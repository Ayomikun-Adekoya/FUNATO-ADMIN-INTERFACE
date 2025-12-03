import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useUsers, useDeleteUser } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import { getStatusColor } from '@/utils/format';
import type { User } from '@/types/api';
import { toast } from 'react-toastify';

export default function UsersListPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({
        open: false,
        user: null,
    });

    const { data, isLoading } = useUsers({ page, per_page: perPage, search });
    const deleteUserMutation = useDeleteUser();

    const handleDelete = async () => {
        if (!deleteModal.user) return;

        try {
            await deleteUserMutation.mutateAsync(deleteModal.user.id);
            setDeleteModal({ open: false, user: null });
            toast.success('User deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete user. Please try again.');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (user: User) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
            ),
        },

        {
            key: 'is_active',
            header: 'Status',
            render: (user: User) => (
                <span
                    className={`badge ${user.is_active ? 'badge-success' : 'badge-gray'
                        }`}
                >
                    {user.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },

        {
            key: 'roles',
            header: 'Roles',
            render: (user: User) => (
                <div className="flex flex-wrap gap-1.5">
                    {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                            <span key={role.id} className="badge-primary">
                                {role.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">No roles</span>
                    )}
                </div>
            ),
        },

        {
            key: 'created_at',
            header: 'Created',
            render: (user: User) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(user.created_at)}
                </span>
            ),
        },

        {
            key: 'actions',
            header: 'Actions',
            render: (user: User) => (
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/users/${user.id}`}
                        className="link text-sm"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => setDeleteModal({ open: true, user })}
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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage user accounts and permissions</p>
                        </div>
                        <Link href="/admin/users/create" className="btn-primary inline-flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create User
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
                                placeholder="Search users by name or email..."
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
                    onClose={() => setDeleteModal({ open: false, user: null })}
                    title="Delete User"
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
                                    Are you sure you want to delete user <strong className="text-gray-900 dark:text-gray-100">{deleteModal.user?.name}</strong>?
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setDeleteModal({ open: false, user: null })}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteUserMutation.isPending}
                                className="btn-danger"
                            >
                                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </Layout>
        </ProtectedRoute>
    );
}
