import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useDepartments, useDeleteDepartment } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import type { Department } from '@/types/api';
import { toast } from 'react-toastify';

export default function DepartmentsListPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; department: Department | null }>({
        open: false,
        department: null,
    });

    const { data, isLoading } = useDepartments({ page, per_page: perPage, search });
    const deleteDepartmentMutation = useDeleteDepartment();

    const handleDelete = async () => {
        if (!deleteModal.department) return;

        try {
            await deleteDepartmentMutation.mutateAsync(deleteModal.department.id);
            setDeleteModal({ open: false, department: null });
            toast.success('Department deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete department. Please try again.');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (department: Department) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{department.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{department.code}</div>
                </div>
            ),
        },
        {
            key: 'faculty',
            header: 'Faculty',
            render: (department: Department) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {department.faculty?.name || 'N/A'}
                </span>
            ),
        },
        {
            key: 'is_active',
            header: 'Active Status',
            render: (department: Department) => (
                <span className={department.is_active ? 'text-green-600' : 'text-red-600'}>
                    {department.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (department: Department) => (
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/departments/${department.id}`}
                        className="link text-sm"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => setDeleteModal({ open: true, department })}
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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Departments</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage departments in the system
                            </p>
                        </div>
                        <Link
                            href="/admin/departments/create"
                            className="btn-primary"
                        >
                            Create Department
                        </Link>
                    </div>

                    <div className="card">
                        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full sm:w-96">
                                <input
                                    type="text"
                                    placeholder="Search departments..."
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
                        onClose={() => setDeleteModal({ open: false, department: null })}
                        title="Delete Department"
                    >
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete the department &quot;{deleteModal.department?.name}&quot;?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, department: null })}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteDepartmentMutation.isPending}
                                className="btn-danger"
                            >
                                {deleteDepartmentMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </Modal>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
