import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import FileInput from '@/components/FileInput';
import { useAdmissions, useBulkUpdateAdmissionStatus } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import type { Admission } from '@/types/api';

export default function AdmissionsListPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [decisionFilter, setDecisionFilter] = useState<'pending' | 'admitted' | 'rejected' | 'waitlisted' | ''>('');
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [bulkStatus, setBulkStatus] = useState<'admitted' | 'not_admitted' | 'pending' | ''>('');

    const { data, isLoading } = useAdmissions({ page, per_page: perPage, search, decision: decisionFilter || undefined });
    const bulkUpdateMutation = useBulkUpdateAdmissionStatus();

    // Client-side filter as workaround for backend search issues
    const filteredData = data?.data.filter((admission) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        const appNumber = admission.admission_application.application_number?.toLowerCase() || '';
        const firstName = admission.admission_application.first_name?.toLowerCase() || '';
        const lastName = admission.admission_application.last_name?.toLowerCase() || '';
        const email = admission.admission_application.email?.toLowerCase() || '';
        const jambReg = admission.admission_application.student?.jamb_registration?.toLowerCase() || '';

        return appNumber.includes(searchLower) ||
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            email.includes(searchLower) ||
            jambReg.includes(searchLower);
    }) || [];

    const columns = [
        {
            key: 'application_number',
            header: 'Application No.',
            render: (admission: Admission) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">{admission.admission_application.application_number}</span>
            ),
        },
        {
            key: 'applicant_name',
            header: 'Applicant',
            render: (admission: Admission) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {admission.admission_application.first_name} {admission.admission_application.last_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{admission.admission_application.email}</div>
                </div>
            ),
        },
        {
            key: 'jamb_registration',
            header: 'JAMB Reg No.',
            render: (admission: Admission) => (
                <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    {admission.admission_application.student?.jamb_registration || 'N/A'}
                </span>
            ),
        },
        {
            key: 'decision',
            header: 'Decision',
            render: (admission: Admission) => (
                <span className={`badge ${admission.decision === 'admitted' ? 'badge-success' :
                    admission.decision === 'not_admitted' ? 'badge-danger' :
                        'badge-warning'
                    }`}>
                    {admission.decision}
                </span>
            ),
        },
        {
            key: 'admin',
            header: 'Decided By',
            render: (admission: Admission) => (
                <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{admission.admin.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{admission.admin.email}</div>
                </div>
            ),
        },
        {
            key: 'decision_made_at',
            header: 'Decision Date',
            render: (admission: Admission) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(admission.decision_made_at)}</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (admission: Admission) => (
                <div className="relative group">
                    <button className="link text-sm">
                        Edit ▼
                    </button>
                    <div className="hidden group-hover:block absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-10">
                        <button
                            onClick={() => router.push({
                                pathname: `/admin/admissions/${admission.id}`,
                                query: { data: JSON.stringify(admission), mode: 'decision' }
                            })}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                            Edit Admission Decision
                        </button>
                        <button
                            onClick={() => router.push({
                                pathname: `/admin/admissions/${admission.id}`,
                                query: { data: JSON.stringify(admission), mode: 'course' }
                            })}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600"
                        >
                            Edit Course/Program
                        </button>
                    </div>
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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admissions</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage student admission records
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsBulkModalOpen(true)}
                                className="btn"
                            >
                                Bulk Update Status
                            </button>
                            <Link
                                href="/admin/admissions/create"
                                className="btn-primary"
                            >
                                Create Admission
                            </Link>
                        </div>
                    </div>

                    <div className="card">
                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by application no., name, email, or JAMB reg number..."
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
                                value={decisionFilter}
                                onChange={(e) => {
                                    setDecisionFilter(e.target.value as typeof decisionFilter);
                                    setPage(1);
                                }}
                                className="input w-full sm:w-48"
                            >
                                <option value="">All Decisions</option>
                                <option value="admitted">Admitted</option>
                                <option value="rejected">Rejected</option>
                                <option value="waitlisted">Waitlisted</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        <Table columns={columns} data={filteredData} isLoading={isLoading} />

                        {data && (
                            <div className="mt-6">
                                {search && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Showing {filteredData.length} of {data.total} results (client-side filtered)
                                    </p>
                                )}
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
                </div>

                {/* Bulk Upload Modal */}
                <Modal
                    isOpen={isBulkModalOpen}
                    onClose={() => {
                        setIsBulkModalOpen(false);
                        setBulkFile(null);
                        setBulkStatus('');
                    }}
                    title="Bulk Update Admission Status"
                    size="md"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status to Apply
                            </label>
                            <select
                                value={bulkStatus}
                                onChange={(e) => setBulkStatus(e.target.value as typeof bulkStatus)}
                                className="input w-full"
                            >
                                <option value="">Select Status</option>
                                <option value="admitted">Admitted</option>
                                <option value="not_admitted">Not Admitted</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Upload File (Excel/CSV)
                            </label>
                            <FileInput
                                accept=".xlsx,.xls,.csv"
                                file={bulkFile}
                                onChange={setBulkFile}
                                placeholder="Choose Excel or CSV file"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                File should contain admission IDs in the first column
                            </p>
                        </div>

                        <div className="flex items-center gap-3 justify-end pt-4">
                            <button
                                onClick={() => {
                                    setIsBulkModalOpen(false);
                                    setBulkFile(null);
                                    setBulkStatus('');
                                }}
                                className="btn"
                                disabled={bulkUpdateMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (bulkFile && bulkStatus) {
                                        bulkUpdateMutation.mutate(
                                            { file: bulkFile, status: bulkStatus },
                                            {
                                                onSuccess: () => {
                                                    setIsBulkModalOpen(false);
                                                    setBulkFile(null);
                                                    setBulkStatus('');
                                                },
                                            }
                                        );
                                    }
                                }}
                                className="btn-primary"
                                disabled={!bulkFile || !bulkStatus || bulkUpdateMutation.isPending}
                            >
                                {bulkUpdateMutation.isPending ? 'Uploading...' : 'Upload & Update'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </Layout>
        </ProtectedRoute>
    );
}
