// pages/admin/sundry-payment-items/index.tsx
import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useSundryPaymentItems, useDeleteSundryPaymentItem } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import type { SundryPaymentItem } from '@/types/api';

export default function SundryPaymentItemsListPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [search, setSearch] = useState('');
    const [isActiveFilter, setIsActiveFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<SundryPaymentItem | null>(null);

    const { data, isLoading } = useSundryPaymentItems({
        page,
        per_page: perPage,
        search,
        is_active: isActiveFilter === '' ? undefined : isActiveFilter === 'true',
        category: categoryFilter || undefined,
    });

    const deleteMutation = useDeleteSundryPaymentItem();

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deleteMutation.mutateAsync(itemToDelete.id);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Payment Item',
            render: (item: SundryPaymentItem) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                    {item.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (item: SundryPaymentItem) => (
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.amount)}
                </span>
            ),
        },
        {
            key: 'category',
            header: 'Category',
            render: (item: SundryPaymentItem) => (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    {item.category}
                </span>
            ),
        },
        {
            key: 'due_date',
            header: 'Due Date',
            render: (item: SundryPaymentItem) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.due_date ? formatDate(item.due_date) : (
                        <span className="italic text-gray-400 dark:text-gray-500">No due date</span>
                    )}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (item: SundryPaymentItem) => (
                <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${item.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                >
                    {item.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'display_order',
            header: 'Order',
            render: (item: SundryPaymentItem) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">#{item.display_order}</span>
            ),
        },
        {
            key: 'created',
            header: 'Created',
            render: (item: SundryPaymentItem) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.created_at)}</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: SundryPaymentItem) => (
                <div className="flex space-x-2">
                    <Link
                        href={`/admin/sundry-payment-items/${item.id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => {
                            setItemToDelete(item);
                            setDeleteModalOpen(true);
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm"
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
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                Sundry Payment Items
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Manage miscellaneous payment items for students
                            </p>
                        </div>
                        <Link
                            href="/admin/sundry-payment-items/create"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Payment Item
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Search by name, description, or category..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    id="category"
                                    placeholder="Filter by category"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>

                            {/* Active Filter */}
                            <div>
                                <label htmlFor="active" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    id="active"
                                    value={isActiveFilter}
                                    onChange={(e) => setIsActiveFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                        <Table columns={columns} data={data?.data || []} isLoading={isLoading} />
                    </div>

                    {/* Pagination */}
                    {data && (
                        <Pagination
                            currentPage={data.current_page}
                            totalPages={data.last_page}
                            total={data.total}
                            onPageChange={setPage}
                            perPage={perPage}
                            onPerPageChange={setPerPage}
                        />
                    )}
                </div>

                {/* Delete Modal */}
                <Modal
                    isOpen={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setItemToDelete(null);
                    }}
                    title="Delete Sundry Payment Item"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">{itemToDelete?.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setItemToDelete(null);
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </Layout>
        </ProtectedRoute>
    );
}
