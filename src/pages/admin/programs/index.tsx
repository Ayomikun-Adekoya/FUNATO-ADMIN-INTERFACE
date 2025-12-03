import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { usePrograms, useDeleteProgram } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import type { Program } from '@/types/api';
import { toast } from 'react-toastify';

export default function ProgramsListPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; program: Program | null }>({
        open: false,
        program: null,
    });

    const { data, isLoading } = usePrograms({ page, per_page: perPage, search });
    const deleteProgramMutation = useDeleteProgram();

    const handleDelete = async () => {
        if (!deleteModal.program) return;

        try {
            await deleteProgramMutation.mutateAsync(deleteModal.program.id);
            setDeleteModal({ open: false, program: null });
            toast.success('Program deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete program. Please try again.');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (program: Program) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{program.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{program.code}</div>
                </div>
            ),
        },
        {
            key: 'department',
            header: 'Department',
            render: (program: Program) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {program.department?.name || 'N/A'}
                </span>
            ),
        },
        {
            key: 'degree_type',
            header: 'Degree Type',
            render: (program: Program) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">{program.degree_type}</span>
            ),
        },
        {
            key: 'duration',
            header: 'Duration',
            render: (program: Program) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {program.duration} {program.duration === 1 ? 'year' : 'years'}
                </span>
            ),
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (program: Program) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${program.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                >
                    {program.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Created',
            render: (program: Program) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(program.created_at)}</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (program: Program) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/programs/${program.id}`}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => setDeleteModal({ open: true, program })}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
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
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Programs</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Manage academic programs
                            </p>
                        </div>
                        <Link href="/admin/programs/create" className="btn-primary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Program
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search programs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card overflow-hidden">
                        <Table columns={columns} data={data?.data || []} isLoading={isLoading} />
                    </div>

                    {/* Pagination */}
                    {data && (
                        <Pagination
                            currentPage={data.current_page}
                            totalPages={data.last_page}
                            perPage={perPage}
                            total={data.total}
                            onPageChange={setPage}
                            onPerPageChange={setPerPage}
                        />
                    )}
                </div>

                {/* Delete Modal */}
                <Modal
                    isOpen={deleteModal.open}
                    onClose={() => setDeleteModal({ open: false, program: null })}
                    title="Delete Program"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            Are you sure you want to delete the program <strong>{deleteModal.program?.name}</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, program: null })}
                                className="btn-secondary"
                                disabled={deleteProgramMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn-danger"
                                disabled={deleteProgramMutation.isPending}
                            >
                                {deleteProgramMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </Layout>
        </ProtectedRoute>
    );
}
