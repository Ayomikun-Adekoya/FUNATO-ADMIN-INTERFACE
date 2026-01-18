import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { newsApi } from '@/lib/api';
import { toast } from 'react-toastify';
import type { News } from '@/types/api';
import FileInput from '@/components/FileInput';

export default function EditNewsPage() {
    const router = useRouter();
    const { id } = router.query;
    const [news, setNews] = useState<News | null>(null);
    const [heading, setHeading] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        const newsId = Array.isArray(id) ? id[0] : id;
        const parsed = Number(newsId);
        if (isNaN(parsed)) {
            toast.error('Invalid news id');
            return;
        }

        (async () => {
            try {
                const res = await newsApi.getById(parsed);
                setNews(res);
                setHeading(res.news_heading);
                setDescription(res.news_description);
                setDate(res.news_date.split('T')[0]);
                setPreview(res.news_image || null);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load news');
            }
        })();
    }, [id]);

    const onFileChange = (f: File | null) => {
        setImage(f);
        if (f) setPreview(URL.createObjectURL(f));
        else setPreview(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsSaving(true);
        try {
            await newsApi.update(Number(id), { news_heading: heading, news_description: description, news_date: date, news_image: image || undefined });
            toast.success('News updated');
            router.push('/admin/news');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update news');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await newsApi.delete(Number(id));
            toast.success('News deleted');
            router.push('/admin/news');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete news');
        }
    };

    if (!news) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="p-6">Loading...</div>
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold">Edit News</h1>
                        <p className="text-sm text-gray-500">Modify this news item</p>
                    </div>

                    <form onSubmit={handleSave} className="card space-y-4">
                        <div>
                            <label className="label">Heading</label>
                            <input type="text" value={heading} onChange={(e) => setHeading(e.target.value)} className="input" required />
                        </div>

                        <div>
                            <label className="label">Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input h-32" required />
                        </div>

                        <div>
                            <label className="label">Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" required />
                        </div>

                        <div>
                            <label className="label">Image (optional)</label>
                            <FileInput accept="image/*" file={image} onChange={onFileChange} showPreview previewUrl={preview} />
                        </div>

                        <div className="flex justify-between">
                            <button type="button" onClick={handleDelete} className="btn-danger">Delete</button>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => router.push('/admin/news')} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
