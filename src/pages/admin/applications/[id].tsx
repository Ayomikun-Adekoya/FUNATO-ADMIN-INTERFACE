// pages/admin/applications/[id].tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import dynamic from 'next/dynamic';
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });

import {
  useApplication,
  useUpdateApplicationAdmin,
  useDeleteApplication,
} from '@/lib/queries';
import { applicationsApi } from '@/lib/api';
import { formatDate } from '@/utils/date';
import { getStatusColor, downloadBlob, isPDF, getFileExtension } from '@/utils/format';
import type { Application, ApplicationDocument } from '@/types/api';

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  // ✅ Keep the ID as string (applicant_id)
  const applicantId = typeof id === 'string' ? id : '';

  const { data: application, isLoading } = useApplication(applicantId);
  const updateMutation = useUpdateApplicationAdmin();
  const deleteMutation = useDeleteApplication();

  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [documentModal, setDocumentModal] = useState<{
    open: boolean;
    document: ApplicationDocument | null;
    blob: Blob | null;
  }>({ open: false, document: null, blob: null });

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    try {
      await updateMutation.mutateAsync({ applicantId, data: { status: newStatus as any } });
      setStatusModal(false);
      toast.success('Status updated successfully!');
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(applicantId);
      toast.success('Application deleted successfully!');
      router.push('/admin/applications');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete application');
    }
  };

  const handleViewDocument = async (doc: ApplicationDocument) => {
    try {
      const blob = await applicationsApi.getDocument(applicantId, doc.id);
      setDocumentModal({ open: true, document: doc, blob });
    } catch (error) {
      console.error('Document fetch error:', error);
      toast.error('Failed to load document');
    }
  };

  const handleDownloadDocument = async (doc: ApplicationDocument) => {
    try {
      const blob = await applicationsApi.getDocument(applicantId, doc.id);
      downloadBlob(blob, doc.file_name);
      toast.success('Document downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!application) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <p className="text-gray-500">Application not found</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Application: {application.applicant_id} — {application.first_name} {application.last_name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Submitted on {formatDate(application.created_at)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                  application.status || 'pending'
                )}`}
              >
                {application.status || 'pending'}
              </span>
              <button onClick={() => setStatusModal(true)} className="btn-secondary">
                Update Status
              </button>
              <button onClick={() => setDeleteModal(true)} className="btn-danger">
                Delete
              </button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ['Full Name', `${application.form_of_address} ${application.first_name} ${application.last_name} ${application.other_name || ''}`],
                ['Email', application.email],
                ['Phone', application.phone],
                ['Gender', application.gender],
                ['Date of Birth', application.date_of_birth ? formatDate(application.date_of_birth) : 'N/A'],
                ['Nationality', application.nationality],
                ['Marital Status', application.marital_status],
                ['State of Origin', application.state_of_origin],
                ['LGA', application.lga],
                ['Home Town', application.home_town],
                ['Residential Address', application.residential_address],
              ].map(([label, value], idx) => (
                <div key={idx}>
                  <dt className="text-sm font-medium text-gray-500">{label}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{value || 'N/A'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Position Information */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Position Information</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Position Applied For</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.position_applied_for}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Position Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.position_type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Preferred Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.preferred_start_date ? formatDate(application.preferred_start_date) : 'N/A'}
                </dd>
              </div>
              {application.how_did_you_hear && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">How Did You Hear</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.how_did_you_hear}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Education */}
          {application.educational_backgrounds && application.educational_backgrounds.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Education</h2>
              <div className="space-y-4">
                {application.educational_backgrounds.map((edu, index) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4">
                    <h3 className="font-medium text-gray-900">{edu.institution_name}</h3>
                    <p className="text-sm text-gray-600">
                      {edu.degree_type} in {edu.field_of_study}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(edu.start_date)} - {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                    </p>
                    {edu.grade && <p className="text-sm text-gray-600">Grade: {edu.grade}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {application.work_experiences && application.work_experiences.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Work Experience</h2>
              <div className="space-y-4">
                {application.work_experiences.map((exp, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-medium text-gray-900">{exp.job_title}</h3>
                    <p className="text-sm text-gray-600">{exp.company_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(exp.start_date)} —{' '}
                      {exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : 'N/A'}
                    </p>
                    {exp.responsibilities && (
                      <p className="text-sm text-gray-600 mt-2">{exp.responsibilities}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {application.references && application.references.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">References</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {application.references.map((ref, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{ref.name}</h3>
                    <p className="text-sm text-gray-600">
                      {ref.position} at {ref.company_organization}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Relationship: {ref.relationship}</p>
                    <p className="text-sm text-gray-500">Email: {ref.email}</p>
                    <p className="text-sm text-gray-500">Phone: {ref.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Application Status">
          <div className="space-y-4">
            <div>
              <label className="label">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="input"
              >
                <option value="">Select status...</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setStatusModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updateMutation.isPending}
                className="btn-primary disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Application">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this application? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn-danger disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={documentModal.open}
          onClose={() => setDocumentModal({ open: false, document: null, blob: null })}
          title={documentModal.document?.file_name || 'Document Viewer'}
          size="xl"
        >
          {documentModal.blob && (
            <PDFViewer file={documentModal.blob} fileName={documentModal.document?.file_name} />
          )}
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}
