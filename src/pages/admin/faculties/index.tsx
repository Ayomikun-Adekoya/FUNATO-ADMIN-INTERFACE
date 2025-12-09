import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useFaculties, useDeleteFaculty } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import type { Faculty } from '@/types/api';
import { toast } from 'react-toastify';

export default function FacultiesListPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; faculty: Faculty | null }>({
        open: false,
        faculty: null,
    });

    const { data, isLoading } = useFaculties({ page, per_page: perPage, search });
    const deleteFacultyMutation = useDeleteFaculty();

    const handleDelete = async () => {
        if (!deleteModal.faculty) return;

        try {
            await deleteFacultyMutation.mutateAsync(deleteModal.faculty.id);
            setDeleteModal({ open: false, faculty: null });
            toast.success('Faculty deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete faculty. Please try again.');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (faculty: Faculty) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{faculty.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{faculty.code}</div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (faculty: Faculty) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">{faculty.description || 'N/A'}</span>
            ),
        },
        {
            key: 'is_active',
            header: 'Active Status',
            render: (faculty: Faculty) => (
                <span className={faculty.is_active ? 'text-green-600' : 'text-red-600'}>
                    {faculty.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (faculty: Faculty) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/faculties/${faculty.id}`}
                        className="link text-sm"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => setDeleteModal({ open: true, faculty })}
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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Colleges</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage colleges in the system
                            </p>
                        </div>
                        <Link
                            href="/admin/faculties/create"
                            className="btn-primary"
                        >
                            Create Colleges
                        </Link>
                    </div>

                    <div className="card">
                        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full sm:w-96">
                                <input
                                    type="text"
                                    placeholder="Search colleges..."
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
                        onClose={() => setDeleteModal({ open: false, faculty: null })}
                        title="Delete College"
                    >
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete the college &quot;{deleteModal.faculty?.name}&quot;?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, faculty: null })}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteFacultyMutation.isPending}
                                className="btn-danger"
                            >
                                {deleteFacultyMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </Modal>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
