import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useScreenings } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import type { Screening } from '@/types/api';

export default function ScreeningsListPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [viewModal, setViewModal] = useState<{ open: boolean; screening: Screening | null }>({
        open: false,
        screening: null,
    });

    const { data, isLoading } = useScreenings({ page, per_page: perPage, search, status: statusFilter });

    const handleEdit = (screening: Screening) => {
        router.push({
            pathname: `/admin/screenings/${screening.id}`,
            query: { data: JSON.stringify(screening) },
        });
    };

    const columns = [
        {
            key: 'application_number',
            header: 'Application No.',
            render: (screening: Screening) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    {screening.admission_application?.application_number || 'N/A'}
                </span>
            ),
        },
        {
            key: 'applicant',
            header: 'Applicant',
            render: (screening: Screening) => {
                const student = screening.admission_application?.student;
                return (
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {student ? `${student.first_name} ${student.last_name}` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {student?.email || 'N/A'}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'scheduled_date',
            header: 'Scheduled Date',
            render: (screening: Screening) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {screening.screening_data?.scheduled_date ? formatDate(screening.screening_data.scheduled_date) : 'N/A'}
                </span>
            ),
        },
        {
            key: 'venue',
            header: 'Venue',
            render: (screening: Screening) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {screening.screening_data?.venue || 'N/A'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (screening: Screening) => (
                <span className={`badge ${screening.status === 'completed' ? 'badge-success' :
                    screening.status === 'in_progress' ? 'badge-warning' :
                        screening.status === 'failed' ? 'badge-danger' :
                            'badge-primary'
                    }`}>
                    {screening.status || 'pending'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (screening: Screening) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setViewModal({ open: true, screening })}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        View
                    </button>
                    <button
                        onClick={() => handleEdit(screening)}
                        className="link text-sm"
                    >
                        Edit
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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Screenings</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage admission screening sessions
                            </p>
                        </div>
                        <Link
                            href="/admin/screenings/create"
                            className="btn-primary"
                        >
                            Create Screening
                        </Link>
                    </div>

                    <div className="card">
                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search screenings..."
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
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="input w-full sm:w-48"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                            </select>
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

                    {/* View Screening Details Modal */}
                    <Modal
                        isOpen={viewModal.open}
                        onClose={() => setViewModal({ open: false, screening: null })}
                        title="Screening Details"
                    >
                        {viewModal.screening && (
                            <div className="space-y-6">
                                {/* Student Information */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Student Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Application Number</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {viewModal.screening.admission_application?.application_number || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Name</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {viewModal.screening.admission_application?.student?.first_name}{' '}
                                                {viewModal.screening.admission_application?.student?.last_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {viewModal.screening.admission_application?.student?.email || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Phone</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {viewModal.screening.admission_application?.student?.phone || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Screening Information */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Screening Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Status</p>
                                            <span className={`inline-block mt-1 badge ${viewModal.screening.status === 'completed' ? 'badge-success' :
                                                viewModal.screening.status === 'in_progress' ? 'badge-warning' :
                                                    viewModal.screening.status === 'failed' ? 'badge-danger' :
                                                        'badge-primary'
                                                }`}>
                                                {viewModal.screening.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Scheduled Date</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {viewModal.screening.screening_data?.scheduled_date
                                                    ? formatDate(viewModal.screening.screening_data.scheduled_date)
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Venue</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {viewModal.screening.screening_data?.venue || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Screened At</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {(viewModal.screening as any).screened_at
                                                    ? formatDate((viewModal.screening as any).screened_at)
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Screening Data */}
                                {((viewModal.screening.screening_data as any)?.completed_date ||
                                    (viewModal.screening.screening_data as any)?.examiner ||
                                    (viewModal.screening.screening_data as any)?.score !== undefined ||
                                    (viewModal.screening.screening_data as any)?.remarks) && (
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                Additional Details
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                {(viewModal.screening.screening_data as any)?.completed_date && (
                                                    <div>
                                                        <p className="text-gray-500 dark:text-gray-400">Completed Date</p>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {formatDate((viewModal.screening.screening_data as any).completed_date)}
                                                        </p>
                                                    </div>
                                                )}
                                                {(viewModal.screening.screening_data as any)?.examiner && (
                                                    <div>
                                                        <p className="text-gray-500 dark:text-gray-400">Examiner</p>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {(viewModal.screening.screening_data as any).examiner}
                                                        </p>
                                                    </div>
                                                )}
                                                {(viewModal.screening.screening_data as any)?.score !== undefined && (
                                                    <div>
                                                        <p className="text-gray-500 dark:text-gray-400">Score</p>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {(viewModal.screening.screening_data as any).score}
                                                        </p>
                                                    </div>
                                                )}
                                                {(viewModal.screening.screening_data as any)?.remarks && (
                                                    <div className="col-span-2">
                                                        <p className="text-gray-500 dark:text-gray-400">Remarks</p>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {(viewModal.screening.screening_data as any).remarks}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Admin & Notes */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Admin & Notes
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Admin</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {viewModal.screening.admin?.name || 'N/A'}
                                            </p>
                                            {viewModal.screening.admin?.email && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {viewModal.screening.admin.email}
                                                </p>
                                            )}
                                        </div>
                                        {viewModal.screening.notes && (
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Notes</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {viewModal.screening.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Timestamps
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Created At</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatDate(viewModal.screening.created_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Updated At</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatDate(viewModal.screening.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => setViewModal({ open: false, screening: null })}
                                        className="btn-secondary"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </Modal>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
