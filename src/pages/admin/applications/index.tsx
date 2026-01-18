// pages/admin/applications/index.tsx
import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import { useApplications } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import { getStatusColor, truncate } from '@/utils/format';
import type { Application } from '@/types/api';

export default function ApplicationsListPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [positionTypeFilter, setPositionTypeFilter] = useState('');

  const { data: normalizedData, isLoading } = useApplications({
    page,
    per_page: perPage,
    search,
    status: statusFilter,
    position_type: positionTypeFilter,
  });

  // Safely access normalized data
  const data = normalizedData?.data || [];
  const meta = normalizedData?.meta;


  const columns = [
    {
      key: 'applicant',
      header: 'Applicant',
      render: (app: Application) => (
        <div>
          <div className="font-medium text-gray-900">
            {app.first_name} {app.last_name}
          </div>
          <div className="text-sm text-gray-500">{app.email}</div>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Position',
      render: (app: Application) => (
        <div>
          <div className="text-sm text-gray-900">{truncate(app.position_applied_for, 30)}</div>
          <div className="text-xs text-gray-500">{app.position_type}</div>
        </div>
      ),
    },
    {
      key: 'academic_info',
      header: 'College / Department',
      render: (app: Application) => (
        app.position_type === 'Academic' ? (
          <div>
            <div className="text-sm text-gray-900">{app.college || '—'}</div>
            <div className="text-xs text-gray-500">{app.department || '—'}</div>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (app: Application) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            app.status || 'pending'
          )}`}
        >
          {app.status || 'pending'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Submitted',
      render: (app: Application) => (
        <span className="text-sm text-gray-500">{formatDate(app.created_at)}</span>
      ),
    },
    {
      key: 'id',
      header: 'Application ID',
      render: (app: Application) => (
        <span className="text-sm text-gray-900">{app.applicant_id}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (app: Application) => (
        <Link
          href={`/admin/applications/${encodeURIComponent(app.applicant_id || '')}`}
          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage recruitment applications
            </p>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <input
                type="text"
                placeholder="Search by Name or Email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="input"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
              <select
                value={positionTypeFilter}
                onChange={(e) => {
                  setPositionTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="input"
              >
                <option value="">All Position Types</option>
                <option value="Academic">Academic</option>
                <option value="Non-Academic">Non-Academic</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>
          </div>

          <Table data={data} columns={columns} isLoading={isLoading} />

          {meta && (
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              perPage={meta.per_page}
              total={meta.total}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
            />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
