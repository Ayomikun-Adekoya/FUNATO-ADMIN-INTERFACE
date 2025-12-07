// pages/admin/registrations/index.tsx
import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import { useRegistrations } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import { getStatusColor } from '@/utils/format';
import type { Registration } from '@/types/api';

export default function RegistrationsListPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [clearanceStatusFilter, setClearanceStatusFilter] = useState('');
    const [matriculatedFilter, setMatriculatedFilter] = useState('');

    const { data, isLoading } = useRegistrations({
        page,
        per_page: perPage,
        search,
        status: (statusFilter || undefined) as 'pending' | 'cleared' | 'rejected' | 'matriculated' | undefined,
        clearance_status: (clearanceStatusFilter || undefined) as 'pending' | 'approved' | 'rejected' | undefined,
        matriculated: matriculatedFilter === '' ? undefined : matriculatedFilter === 'true',
    });

    const columns = [
        {
            key: 'student',
            header: 'Student',
            render: (reg: Registration) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                        {reg.student?.first_name} {reg.student?.last_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{reg.student?.email}</div>
                    {reg.student?.jamb_registration && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            JAMB: {reg.student.jamb_registration}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'matriculation',
            header: 'Matric Number',
            render: (reg: Registration) => (
                <div className="text-sm">
                    {reg.matriculation_number || (
                        <span className="text-gray-400 dark:text-gray-500 italic">Not assigned</span>
                    )}
                </div>
            ),
        },
        {
            key: 'program',
            header: 'Program',
            render: (reg: Registration) => (
                <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {reg.program?.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {reg.program?.code} - Level {reg.level}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {reg.program?.department?.name}
                    </div>
                </div>
            ),
        },
        {
            key: 'progress',
            header: 'Progress',
            render: (reg: Registration) => (
                <div className="space-y-1">
                    <div className="flex items-center text-xs">
                        <span className={`w-3 h-3 rounded-full mr-2 ${reg.course_confirmed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                        <span className={reg.course_confirmed ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                            Course Confirmed
                        </span>
                    </div>
                    <div className="flex items-center text-xs">
                        <span className={`w-3 h-3 rounded-full mr-2 ${reg.enrollment_form_completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                        <span className={reg.enrollment_form_completed ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                            Enrollment Form
                        </span>
                    </div>
                    <div className="flex items-center text-xs">
                        <span className={`w-3 h-3 rounded-full mr-2 ${reg.acceptance_fee_paid ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                        <span className={reg.acceptance_fee_paid ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                            Acceptance Fee
                        </span>
                    </div>
                    <div className="flex items-center text-xs">
                        <span className={`w-3 h-3 rounded-full mr-2 ${reg.registration_fee_paid ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                        <span className={reg.registration_fee_paid ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                            Registration Fee
                        </span>
                    </div>
                    <div className="flex items-center text-xs">
                        <span className={`w-3 h-3 rounded-full mr-2 ${reg.credentials_uploaded ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                        <span className={reg.credentials_uploaded ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                            Credentials
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'clearance',
            header: 'Clearance Status',
            render: (reg: Registration) => (
                <div>
                    <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            reg.clearance_status
                        )}`}
                    >
                        {reg.clearance_status}
                    </span>
                    {reg.cleared_at && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(reg.cleared_at)}
                        </div>
                    )}
                    {reg.clearedBy && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            By: {reg.clearedBy.name}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (reg: Registration) => (
                <div>
                    <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            reg.status
                        )}`}
                    >
                        {reg.status}
                    </span>
                    {reg.matriculated && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Matriculated
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'created',
            header: 'Created',
            render: (reg: Registration) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(reg.created_at)}</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (reg: Registration) => (
                <Link
                    href={`/admin/registrations/${reg.id}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm"
                >
                    View Details
                </Link>
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
                                Student Registrations
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Manage student registrations and clearance
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Search by ID, name, email, JAMB or matric number..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="cleared">Cleared</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="matriculated">Matriculated</option>
                                </select>
                            </div>

                            {/* Clearance Status Filter */}
                            <div>
                                <label htmlFor="clearance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Clearance
                                </label>
                                <select
                                    id="clearance"
                                    value={clearanceStatusFilter}
                                    onChange={(e) => setClearanceStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Matriculated Filter */}
                            <div>
                                <label htmlFor="matriculated" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Matriculated
                                </label>
                                <select
                                    id="matriculated"
                                    value={matriculatedFilter}
                                    onChange={(e) => setMatriculatedFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
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
            </Layout>
        </ProtectedRoute>
    );
}
