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
import Image from 'next/image';

import {
  useApplication,
  useUpdateApplicationAdmin,
  useDeleteApplication,
} from '@/lib/queries';
import { applicationsApi } from '@/lib/api';
import { formatDate } from '@/utils/date';
import { getStatusColor, downloadBlob, isPDF, isImage } from '@/utils/format';
import type { ApplicationDocument } from '@/types/api';
import { boolean } from 'zod';

// Extend jsPDF to include lastAutoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

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
    y = doc.lastAutoTable.finalY + 6;

    // Position Info
    doc.text('Position Information', 10, y);
    y += 6;
    const positionRows = [
      ['Position Applied For', application.position_applied_for],
      ['Position Type', application.position_type],
      ['Status', application.status || 'pending'],
    ];
    autoTable(doc, { head: [['Field', 'Value']], body: positionRows, startY: y, styles: { fontSize: 9 } });
    y = doc.lastAutoTable.finalY + 6;

    // Education
    doc.text('Education', 10, y);
    y += 6;
    // Remove file paths and document paths from the PDF generation
    const educationRows = application.educational_backgrounds?.map((edu) => [
      edu.institution_name || 'null',
      edu.certificate_obtained || 'null',
      edu.class_of_degree || 'null',
      edu.year_attained || 'null',
    ]) || [];
    autoTable(doc, {
      head: [['Institution', 'Certificate Obtained', 'Class of Degree', 'Year Attained']],
      body: educationRows,
      startY: y,
      styles: { fontSize: 9 },
    });
    y = doc.lastAutoTable.finalY + 6;

    // Work Experience
    doc.text('Work Experience', 10, y);
    y += 6;
    const workRows = application.work_experiences?.map((exp) => [
      exp.job_title || 'null',
      exp.organization_name || 'null',
      exp.responsibility || 'null',
    ]) || [];
    if (workRows.length > 0) {
      autoTable(doc, {
        head: [['Job Title', 'Organization Name',  'Responsibility']],
        body: workRows,
        startY: y,
        styles: { fontSize: 9 },
      });
      y = doc.lastAutoTable.finalY + 6;
    } else {
      autoTable(doc, { head: [['No work experience records']], body: [], startY: y, styles: { fontSize: 9 } });
      y = doc.lastAutoTable.finalY + 6;
    }

    // References
    doc.text('References', 10, y);
    y += 6;
    const referenceRows = application.references?.map((ref) => [
      ref.full_name || 'null',
      ref.professional_email || 'null',
      ref.relationship || 'null',
    ]) || [];
    if (referenceRows.length > 0) {
      application.references?.forEach((ref, idx) => {
        const refRows = [
          ['Full Name', ref.full_name || 'null'],
          ['Email', ref.email || 'null'],
          ['Professional Email', ref.professional_email || 'null'],
          ['Job Title', ref.job_title || 'null'],
          ['Institution', ref.referee_institution || 'null'],
          ['Relationship', ref.relationship || 'null'],
          ['Phone', ref.phone || 'null'],
          ['Contact Address', ref.contact_address || 'null'],
          ['How Long Known', ref.how_long_known || 'null'],
          ['Assessment', ref.assessment || 'null'],
          ['Professional Competence', ref.professional_competence || 'null'],
          ['Reliability & Integrity', ref.reliability_integrity || 'null'],
          ['Communication Skills', ref.communication_skills || 'null'],
          ['Applicant Strength', ref.applicant_strength || 'null'],
          ['Recommendation', ref.recommendation || 'null'],
          ['Optional Letter', ref.optional_letter || 'null'],
          ['Submitted At', ref.submitted_at ? formatDateOnly(ref.submitted_at) : 'null'],
        ];
        autoTable(doc, {
          head: [['Field', 'Value']],
          body: refRows,
          startY: y,
          styles: { fontSize: 9 },
          margin: { left: 14 },
        });
        y = doc.lastAutoTable.finalY + 4;
        if (application.references && idx < application.references.length - 1) {
          doc.setDrawColor(200);
          doc.line(12, y - 2, 190, y - 2); // separator line
          y += 2;
        }
      });
    } else {
      autoTable(doc, { head: [['No references']], body: [], startY: y, styles: { fontSize: 9 } });
      y = doc.lastAutoTable.finalY + 6;
    }

    // Certifications
    doc.text('Professional Certifications', 10, y);
    y += 6;
    if (application.professional_certifications && application.professional_certifications.length > 0) {
      const certRows = application.professional_certifications.map((cert) => [
        cert.certification_name || 'null',
        cert.certificate_title || 'null',
        cert.issuing_body || 'null',
      ]);
      autoTable(doc, {
        head: [['Certification', 'Issuing Body','Certificate Title']],
        body: certRows,
        startY: y,
        styles: { fontSize: 9 },
      });
      y = doc.lastAutoTable.finalY + 6;
    } else {
      autoTable(doc, { head: [['No certifications']], body: [], startY: y, styles: { fontSize: 9 } });
      y = doc.lastAutoTable.finalY + 6;
    }

    // Documents
    doc.text('Documents', 10, y);
    y += 6;
    if (application.documents && application.documents.length > 0) {
      const docRows = application.documents.map((d) => [
        d.file_name || 'null',
        d.document_type || 'null',
      ]);
      autoTable(doc, {
        head: [['File Name', 'Document Type']],
        body: docRows,
        startY: y,
        styles: { fontSize: 7 },
        columnStyles: { 2: { cellWidth: 60 } },
      });
      y = doc.lastAutoTable.finalY + 6;
    } else {
      autoTable(doc, { head: [['No documents']], body: [], startY: y, styles: { fontSize: 9 } });
      y = doc.lastAutoTable.finalY + 6;
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
            
          </dl>
        </div>

        {/* Education */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Education</h2>
          {application.educational_backgrounds && application.educational_backgrounds.length > 0 ? (
            <div className="space-y-4">
              {application.educational_backgrounds.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">{edu.institution_name || 'null'}</h3>
                  <div className="space-y-1.5">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Certificate Obtained:</span>{' '}
                      <span className="text-gray-600">{edu.certificate_obtained || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Class of Degree:</span>{' '}
                      <span className="text-gray-600">{edu.class_of_degree || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Year Attained:</span>{' '}
                      <span className="text-gray-600">{edu.year_attained || 'null'}</span>
                    </p>
                  </div>
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
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">{exp.job_title || 'null'}</h3>
                  <div className="space-y-1.5">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Organization Name:</span>{' '}
                      <span className="text-gray-600">{exp.organization_name || 'null'}</span>
                    </p>
                
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Responsibility:</span>{' '}
                      <span className="text-gray-600">{exp.responsibility || 'null'}</span>
                    </p>
                  </div>
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
                  <h3 className="font-medium text-gray-900 mb-3">{ref.full_name || 'null'}</h3>
                  <div className="space-y-1.5">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Referee Name:</span>{' '}
                      <span className="text-gray-600">{ref.referee_name || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Email:</span>{' '}
                      <span className="text-gray-600">{ref.email || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Professional Email:</span>{' '}
                      <span className="text-gray-600">{ref.professional_email || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Job Title:</span>{' '}
                      <span className="text-gray-600">{ref.job_title || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Institution:</span>{' '}
                      <span className="text-gray-600">{ref.referee_institution || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Relationship:</span>{' '}
                      <span className="text-gray-600">{ref.relationship || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Phone:</span>{' '}
                      <span className="text-gray-600">{ref.phone || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Contact Address:</span>{' '}
                      <span className="text-gray-600">{ref.contact_address || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">How Long Known:</span>{' '}
                      <span className="text-gray-600">{ref.how_long_known || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Assessment:</span>{' '}
                      <span className="text-gray-600">{ref.assessment || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Professional Competence:</span>{' '}
                      <span className="text-gray-600">{ref.professional_competence || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Reliability & Integrity:</span>{' '}
                      <span className="text-gray-600">{ref.reliability_integrity || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Communication Skills:</span>{' '}
                      <span className="text-gray-600">{ref.communication_skills || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Applicant Strength:</span>{' '}
                      <span className="text-gray-600">{ref.applicant_strength || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Recommendation:</span>{' '}
                      <span className="text-gray-600">{ref.recommendation || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Optional Letter:</span>{' '}
                      <span className="text-gray-600">{ref.optional_letter || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Confidentiality Consent:</span>{' '}
                      <span className="text-gray-600">
                        {ref.confidentiality_consent !== null && ref.confidentiality_consent !== undefined
                          ? ref.confidentiality_consent ? 'Yes' : 'No'
                          : 'null'}
                      </span>                    
                      </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Submitted At:</span>{' '}
                      <span className="text-gray-600">{ref.submitted_at ? formatDate(ref.submitted_at) : 'null'}</span>
                    </p>
                  </div>
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
                  <p className="text-sm text-gray-600">{cert.certificate_title || 'null'}</p>
                  <p className="text-sm text-gray-500">
                    Issuing Body: {cert.issuing_body || 'null'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">null</div>
          )}
        </div>

        {/* Documents */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Documents</h2>
          {application.documents && application.documents.length > 0 ? (
            <div className="space-y-4">
              {application.documents.map((doc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">{doc.file_name || 'null'}</h3>
                  <div className="space-y-1.5">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Document Type:</span>{' '}
                      <span className="text-gray-600">{doc.document_type || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">File Path:</span>{' '}
                      <span className="text-gray-600 break-all">{doc.file_path || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">MIME Type:</span>{' '}
                      <span className="text-gray-600">{doc.mime_type || 'null'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">File Size:</span>{' '}
                      <span className="text-gray-600">{doc.file_size ? `${(parseInt(doc.file_size) / 1024).toFixed(2)} KB` : 'null'}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="btn-primary text-xs py-1 px-3"
                    >
                      Download
                    </button>
                  </div>
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
                    <Image
                      src={url}
                      alt={fileName}
                      className="max-h-[80vh] max-w-full rounded shadow"
                      onLoad={() => URL.revokeObjectURL(url)}
                      width={500} // Example width
                      height={500} // Example height
                    />
                  </div>
                );
              } else {
                return <div className="text-center text-gray-500">Cannot preview this file type.</div>;
              }
            })()
          )}
        </Modal>
      </Layout>
    </ProtectedRoute >
  );
}