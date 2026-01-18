import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { newsApi } from '@/lib/api';
import { formatDate } from '@/utils/date';
import type { News } from '@/types/api';
import { toast } from 'react-toastify';

export default function NewsListPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; news: News | null }>({ open: false, news: null });
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await newsApi.getAll({ page, per_page: perPage, search });
            setData(res);
        } catch (error) {
            console.error('Fetch news error', error);
            toast.error('Failed to load news');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch when component mounts or when pagination/search params change
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, perPage, search]);

    const handleDelete = async () => {
        if (!deleteModal.news) return;
        try {
            await newsApi.delete(deleteModal.news.id);
            toast.success('News deleted');
            setDeleteModal({ open: false, news: null });
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete news');
        }
    };

    const columns = [
        {
            key: 'news_heading',
            header: 'Heading',
            render: (n: News) => <div className="font-semibold">{n.news_heading}</div>,
        },
        {
            key: 'news_date',
            header: 'Date',
            render: (n: News) => <span className="text-sm text-gray-600">{formatDate(n.news_date)}</span>,
        },
        {
            key: 'created_at',
            header: 'Created',
            render: (n: News) => <span className="text-sm text-gray-600">{formatDate(n.created_at)}</span>,
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (n: News) => (
                <div className="flex items-center gap-3">
                    <Link href={`/admin/news/${n.id}`} className="link text-sm">Edit</Link>
                    <button onClick={() => setDeleteModal({ open: true, news: n })} className="text-sm text-red-600">Delete</button>
                </div>
            ),
        },
    ];

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">News</h1>
                            <p className="text-sm text-gray-500">Manage news items</p>
                        </div>
                        <Link href="/admin/news/create" className="btn-primary">Create News</Link>
                    </div>

                    <div className="card">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input type="text" placeholder="Search news..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
                        </div>
                    </div>

                    <Table data={data?.data || []} columns={columns} isLoading={isLoading} />

                    {data && (
                        <Pagination currentPage={data.current_page} totalPages={data.last_page} perPage={data.per_page} total={data.total} onPageChange={(p) => { setPage(p); }} onPerPageChange={(pp) => { setPerPage(pp); }} />
                    )}
                </div>

                <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, news: null })} title="Delete News">
                    <div className="space-y-4">
                        <p>Are you sure you want to delete this news item?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteModal({ open: false, news: null })} className="btn-secondary">Cancel</button>
                            <button onClick={handleDelete} className="btn-danger">Delete</button>
                        </div>
                    </div>
                </Modal>
            </Layout>
        </ProtectedRoute>
    );
}
