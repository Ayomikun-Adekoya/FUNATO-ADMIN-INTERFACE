import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useRoles, useDeleteRole } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import type { Role } from '@/types/api';
import { toast } from 'react-toastify';

export default function RolesListPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; role: Role | null }>({
        open: false,
        role: null,
    });

    const { data, isLoading } = useRoles({ page, per_page: perPage, search });
    const deleteRoleMutation = useDeleteRole();

    const handleDelete = async () => {
        if (!deleteModal.role) return;

        try {
            await deleteRoleMutation.mutateAsync(deleteModal.role.id);
            setDeleteModal({ open: false, role: null });
            toast.success('Role deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete role. Please try again.');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (role: Role) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{role.name}</div>
                    {role.description && <div className="text-sm text-gray-500 dark:text-gray-400">{role.description}</div>}
                </div>
            ),
        },
        {
            key: 'permissions',
            header: 'Permissions',
            render: (role: Role) => (
                <div className="flex items-center gap-2">
                    {role.permissions && role.permissions.length > 0 ? (
                        <>
                            <span className="badge-primary">{role.permissions.length} permissions</span>
                        </>
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">No permissions</span>
                    )}
                </div>
            ),
        },
        {
            key: 'created_at',
            header: 'Created',
            render: (role: Role) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(role.created_at)}</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (role: Role) => (
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/roles/${role.id}`}
                        className="link text-sm"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => setDeleteModal({ open: true, role })}
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
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Roles</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage roles and permissions</p>
                        </div>
                        <Link href="/admin/roles/create" className="btn-primary inline-flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Role
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="card">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input pl-10"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table data={data?.data || []} columns={columns} isLoading={isLoading} />

                    {/* Pagination */}
                    {data && (
                        <Pagination
                            currentPage={data.current_page}
                            totalPages={data.last_page}
                            perPage={data.per_page}
                            total={data.total}
                            onPageChange={setPage}
                            onPerPageChange={setPerPage}
                        />
                    )}
                </div>

                {/* Delete confirmation modal */}
                <Modal
                    isOpen={deleteModal.open}
                    onClose={() => setDeleteModal({ open: false, role: null })}
                    title="Delete Role"
                >
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Are you sure you want to delete role <strong className="text-gray-900 dark:text-gray-100">{deleteModal.role?.name}</strong>?
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setDeleteModal({ open: false, role: null })}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteRoleMutation.isPending}
                                className="btn-danger"
                            >
                                {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete Role'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </Layout>
        </ProtectedRoute>
    );
}
