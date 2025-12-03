import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useModeOfEntries, useDeleteModeOfEntry } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import type { ModeOfEntry } from '@/types/api';
import { toast } from 'react-toastify';

export default function ModeOfEntriesListPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; modeOfEntry: ModeOfEntry | null }>({
        open: false,
        modeOfEntry: null,
    });

    const { data, isLoading } = useModeOfEntries({ page, per_page: perPage, search });
    const deleteModeOfEntryMutation = useDeleteModeOfEntry();

    const handleDelete = async () => {
        if (!deleteModal.modeOfEntry) return;

        try {
            await deleteModeOfEntryMutation.mutateAsync(deleteModal.modeOfEntry.id);
            setDeleteModal({ open: false, modeOfEntry: null });
            toast.success('Mode of entry deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete mode of entry. Please try again.');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (modeOfEntry: ModeOfEntry) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{modeOfEntry.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{modeOfEntry.code}</div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (modeOfEntry: ModeOfEntry) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {modeOfEntry.description && modeOfEntry.description.length > 50
                        ? `${modeOfEntry.description.substring(0, 50)}...`
                        : modeOfEntry.description || 'N/A'}
                </span>
            ),
        },
        {
            key: 'is_active',
            header: 'Active',
            render: (modeOfEntry: ModeOfEntry) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {modeOfEntry.is_active ? 'Yes' : 'No'}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Created',
            render: (modeOfEntry: ModeOfEntry) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(modeOfEntry.created_at)}</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (modeOfEntry: ModeOfEntry) => (
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/mode-of-entries/${modeOfEntry.id}`}
                        className="link text-sm"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => setDeleteModal({ open: true, modeOfEntry })}
                        className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mode of Entries</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage admission mode of entry options
                            </p>
                        </div>
                        <Link
                            href="/admin/mode-of-entries/create"
                            className="btn-primary"
                        >
                            Create Mode of Entry
                        </Link>
                    </div>

                    <div className="card">
                        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full sm:w-96">
                                <input
                                    type="text"
                                    placeholder="Search mode of entries..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="input pl-10 w-full"
                                />
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <Table columns={columns} data={data?.data || []} isLoading={isLoading} />

                        {data && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={data.current_page}
                                    totalPages={data.last_page}
                                    perPage={perPage}
                                    total={data.total}
                                    onPageChange={setPage}
                                    onPerPageChange={(newPerPage) => {
                                        setPerPage(newPerPage);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <Modal
                        isOpen={deleteModal.open}
                        onClose={() => setDeleteModal({ open: false, modeOfEntry: null })}
                        title="Delete Mode of Entry"
                    >
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete <strong>{deleteModal.modeOfEntry?.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, modeOfEntry: null })}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteModeOfEntryMutation.isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {deleteModeOfEntryMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </Modal>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
