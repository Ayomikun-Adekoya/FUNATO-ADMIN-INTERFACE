import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { newsApi } from '@/lib/api';
import { toast } from 'react-toastify';
import FileInput from '@/components/FileInput';

export default function CreateNewsPage() {
    const router = useRouter();
    const [heading, setHeading] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onFileChange = (f: File | null) => {
        setImage(f);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await newsApi.create({ news_heading: heading, news_description: description, news_date: date, news_image: image || undefined });
            toast.success('News created');
            router.push('/admin/news');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create news');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold">Create News</h1>
                        <p className="text-sm text-gray-500">Add a new news item</p>
                    </div>

                    <form onSubmit={handleSubmit} className="card space-y-4">
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
                            <FileInput accept="image/*" file={image} onChange={onFileChange} showPreview />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => router.push('/admin/news')} className="btn-secondary">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : 'Create News'}</button>
                        </div>
                    </form>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
