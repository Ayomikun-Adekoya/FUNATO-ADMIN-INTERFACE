// pages/admin/applications/[id].tsx
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';
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
import { getStatusColor, downloadBlob, isPDF, isImage } from '@/utils/format';
import type { ApplicationDocument } from '@/types/api';

import type { Education, Experience, Reference, Certification } from '@/types/api';

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
      await updateMutation.mutateAsync({ applicantId, data: { status: newStatus as 'pending' | 'reviewing' | 'accepted' | 'rejected' } });
      setStatusModal(false);
      toast.success('Status updated successfully!');
    } catch (error: unknown) {
      console.error('Update status error:', error);
      // @ts-expect-error: error may be an AxiosError
      if (typeof error === 'object' && error && 'response' in error && error.response?.data?.message) {
        // @ts-expect-error: error may be an AxiosError
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update status');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(applicantId);
      toast.success('Application deleted successfully!');
      router.push('/admin/applications');
    } catch (error: unknown) {
      console.error('Delete error:', error);
      // @ts-expect-error: error may be an AxiosError
      if (typeof error === 'object' && error && 'response' in error && error.response?.data?.message) {
        // @ts-expect-error: error may be an AxiosError
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete application');
      }
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

  // Print single application as PDF (excluding created_at and updated_at)
  const handlePrintPDF = () => {
    if (!application) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Application: ${application.applicant_id} — ${application.first_name} ${application.last_name}`, 10, 14);
    let y = 22;

    // Helper to format date
    const formatDateOnly = (dateStr: string | undefined | null): string => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString();
    };

    // Personal Info
    doc.setFontSize(12);
    doc.text('Personal Information', 10, y);
    y += 6;
    const personalRows = [
      ['Full Name', `${application.form_of_address} ${application.first_name} ${application.last_name} ${application.other_name || ''}`],
      ['Email', application.email],
      ['Phone', application.phone],
      ['Gender', application.gender],
      ['Date of Birth', formatDateOnly(application.date_of_birth)],
      ['Nationality', application.nationality],
      ['Marital Status', application.marital_status],
      ['State of Origin', application.state_of_origin],
      ['LGA', application.lga],
      ['Home Town', application.home_town],
      ['Residential Address', application.residential_address],
    ];
    autoTable(doc, { head: [['Field', 'Value']], body: personalRows, startY: y, styles: { fontSize: 9 } });
    // @ts-expect-error: lastAutoTable is a jsPDF plugin property
    y = doc.lastAutoTable.finalY + 6;

    // Position Info
    doc.text('Position Information', 10, y);
    y += 6;
    const positionRows = [
      ['Position Applied For', application.position_applied_for],
      ['Position Type', application.position_type],
      ['Preferred Start Date', application.preferred_start_date ? formatDateOnly(application.preferred_start_date) : 'N/A'],
      ['How Did You Hear', application.how_did_you_hear || 'N/A'],
      ['Status', application.status || 'pending'],
    ];
    autoTable(doc, { head: [['Field', 'Value']], body: positionRows, startY: y, styles: { fontSize: 9 } });
    // @ts-expect-error: lastAutoTable is a jsPDF plugin property
    y = doc.lastAutoTable.finalY + 6;

    // Education
    if (application.educational_backgrounds && application.educational_backgrounds.length > 0) {
      doc.text('Education', 10, y);
      y += 6;
      const eduRows = application.educational_backgrounds.map((e: Education) => [
        e.institution_name || '',
        e.degree_type || '',
        e.field_of_study || '',
        e.start_date ? formatDateOnly(e.start_date) : '',
        e.end_date ? formatDateOnly(e.end_date) : '',
        e.grade || '',
        e.certificate || ''
      ]);
      autoTable(doc, {
        head: [['Institution', 'Degree Type', 'Field of Study', 'Start Date', 'End Date', 'Grade', 'Certificate']],
        body: eduRows,
        startY: y,
        styles: { fontSize: 9 }
      });
      // @ts-expect-error: lastAutoTable is a jsPDF plugin property
      y = doc.lastAutoTable?.finalY + 6 || y + 6;
    }

    // Work Experience
    if (application.work_experiences && application.work_experiences.length > 0) {
      doc.text('Work Experience', 10, y);
      y += 6;
      const workRows = application.work_experiences.map((w: Experience) => [
        w.company_name || '',
        w.job_title || '',
        `${formatDateOnly(w.start_date) || ''} - ${w.end_date ? formatDateOnly(w.end_date) : (w.is_current ? 'Present' : '')}`,
        w.responsibilities || ''
      ]);
      autoTable(doc, {
        head: [['Company', 'Job Title', 'Period', 'Responsibilities']],
        body: workRows,
        startY: y,
        styles: { fontSize: 9 }
      });
      // @ts-expect-error: lastAutoTable is a jsPDF plugin property
      y = doc.lastAutoTable?.finalY + 6 || y + 6;
    }

    // References
    if (application.references && application.references.length > 0) {
      doc.text('References', 10, y);
      y += 6;
      const refRows = application.references.map((r: Reference) => [
        r.name || '',
        r.position || '',
        r.company_organization || '',
        r.relationship || '',
        r.email || '',
        r.phone || ''
      ]);
      autoTable(doc, { head: [['Name', 'Position', 'Company', 'Relationship', 'Email', 'Phone']], body: refRows, startY: y, styles: { fontSize: 9 } });
      // @ts-expect-error: lastAutoTable is a jsPDF plugin property
      y = doc.lastAutoTable?.finalY + 6 || y + 6;
    }

    // Certifications
    if (application.professional_certifications && application.professional_certifications.length > 0) {
      doc.text('Certifications', 10, y);
      y += 6;
      const certRows = application.professional_certifications.map((c: Certification) => [
        c.certification_name || '',
        c.issuing_organization || '',
        c.issue_date ? formatDateOnly(c.issue_date) : '',
        c.expiry_date ? formatDateOnly(c.expiry_date) : '',
      ]);
      autoTable(doc, { head: [['Certification', 'Issuer', 'Issue Date', 'Expiry Date']], body: certRows, startY: y, styles: { fontSize: 9 } });
      // @ts-expect-error: lastAutoTable is a jsPDF plugin property
      y = doc.lastAutoTable?.finalY + 6 || y + 6;
    }

    // Documents
    if (application.documents && application.documents.length > 0) {
      doc.text('Documents', 10, y);
      y += 6;
      const docRows = application.documents.map((d: ApplicationDocument) => [
        d.document_type || '',
        d.file_name || ''
      ]);
      autoTable(doc, { head: [['Type', 'File Name']], body: docRows, startY: y, styles: { fontSize: 9 } });
      // @ts-expect-error: lastAutoTable is a jsPDF plugin property
      y = doc.lastAutoTable?.finalY + 6 || y + 6;
    }

    doc.save(`application_${application.applicant_id}.pdf`);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          {/* Breadcrumb */}
          <div className="mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <Link
                href="/admin/applications"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Applications
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>View</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Application: {application.applicant_id} — {application.first_name} {application.last_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Submitted on {formatDate(application.created_at)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handlePrintPDF} className="btn-primary">
              Print Application (PDF)
            </button>
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
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Education</h2>
          {application.educational_backgrounds && application.educational_backgrounds.length > 0 ? (
            <div className="space-y-4">
              {application.educational_backgrounds.map((edu, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-medium text-gray-900">{edu.institution_name || 'null'}</h3>
                  <p className="text-sm text-gray-600">Degree Type: {edu.degree_type || 'null'}</p>
                  <p className="text-sm text-gray-600">Field of Study: {edu.field_of_study || 'null'}</p>
                  <p className="text-sm text-gray-500">
                    {edu.start_date ? formatDate(edu.start_date) : 'null'} - {edu.end_date ? formatDate(edu.end_date) : (edu.start_date ? 'Present' : 'null')}
                  </p>
                  <p className="text-sm text-gray-600">Grade: {edu.grade || 'null'}</p>
                  <p className="text-xs">
                    {edu.certificate ? (
                      <a href={edu.certificate} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">View Certificate</a>
                    ) : 'null'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">null</div>
          )}
        </div>

        {/* Work Experience */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Work Experience</h2>
          {application.work_experiences && application.work_experiences.length > 0 ? (
            <div className="space-y-4">
              {application.work_experiences.map((exp, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">{exp.job_title || 'null'}</h3>
                  <p className="text-sm text-gray-600">{exp.company_name || 'null'}</p>
                  <p className="text-sm text-gray-500">
                    {exp.start_date ? formatDate(exp.start_date) : 'null'} — {exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : 'null'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{exp.responsibilities || 'null'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">null</div>
          )}
        </div>

        {/* References */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">References</h2>
          {application.references && application.references.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {application.references.map((ref, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{ref.name || 'null'}</h3>
                  <p className="text-sm text-gray-600">
                    {(ref.position || 'null')} at {(ref.company_organization || 'null')}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Relationship: {ref.relationship || 'null'}</p>
                  <p className="text-sm text-gray-500">Email: {ref.email || 'null'}</p>
                  <p className="text-sm text-gray-500">Phone: {ref.phone || 'null'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">null</div>
          )}
        </div>

        {/* Certifications */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Professional Certifications</h2>
          {application.professional_certifications && application.professional_certifications.length > 0 ? (
            <div className="space-y-4">
              {application.professional_certifications.map((cert, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-900">{cert.certification_name || 'null'}</h3>
                  <p className="text-sm text-gray-600">{cert.issuing_organization || 'null'}</p>
                  <p className="text-sm text-gray-500">
                    Issued: {cert.issue_date || 'null'} {cert.expiry_date ? `| Expires: ${cert.expiry_date}` : '| Expires: null'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">null</div>
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
          {documentModal.blob && documentModal.document && (
            (() => {
              const fileName = documentModal.document.file_name;
              const isPdf = isPDF(fileName);
              const isImg = isImage(fileName);
              if (isPdf) {
                return <PDFViewer file={documentModal.blob} fileName={fileName} />;
              } else if (isImg) {
                const url = URL.createObjectURL(documentModal.blob);
                return (
                  <div className="flex justify-center items-center min-h-[400px]">
                    <img src={url} alt={fileName} className="max-h-[80vh] max-w-full rounded shadow" onLoad={() => URL.revokeObjectURL(url)} />
                  </div>
                );
              } else {
                return <div className="text-center text-gray-500">Cannot preview this file type.</div>;
              }
            })()
          )}
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}
