// pages/admin/registrations/[id].tsx
import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import { useRegistration, useClearRegistration } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import { getStatusColor } from '@/utils/format';
import type { ClearRegistrationRequest } from '@/types/api';

export default function RegistrationDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const registrationId = Number(id);

    const { data: registration, isLoading } = useRegistration(registrationId);
    const clearRegistrationMutation = useClearRegistration();

    const [showClearanceModal, setShowClearanceModal] = useState(false);
    const [clearanceStatus, setClearanceStatus] = useState<'approved' | 'rejected'>('approved');
    const [clearanceNotes, setClearanceNotes] = useState('');

    const handleClearance = async () => {
        if (!registration) return;

        const clearanceData: ClearRegistrationRequest = {
            clearance_status: clearanceStatus,
            clearance_notes: clearanceNotes || undefined,
        };

        try {
            await clearRegistrationMutation.mutateAsync({ id: registration.id, data: clearanceData });
            setShowClearanceModal(false);
            setClearanceNotes('');
        } catch (error) {
            console.error('Error updating clearance:', error);
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                </Layout>
            </ProtectedRoute>
        );
    }

    if (!registration) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Registration not found
                        </h2>
                        <Link
                            href="/admin/registrations"
                            className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                        >
                            ← Back to Registrations
                        </Link>
                    </div>
                </Layout>
            </ProtectedRoute>
        );
    }

    const canClear = registration.course_confirmed &&
        registration.enrollment_form_completed &&
        registration.acceptance_fee_paid &&
        registration.credentials_uploaded;

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/admin/registrations"
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    Registration Details
                                </h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {registration.student?.first_name} {registration.student?.last_name}
                                </p>
                            </div>
                        </div>

                        {canClear && registration.clearance_status === 'pending' && (
                            <button
                                onClick={() => setShowClearanceModal(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Process Clearance
                            </button>
                        )}
                    </div>

                    {/* Status Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Registration Status</div>
                            <div className="mt-2">
                                <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                        registration.status
                                    )}`}
                                >
                                    {registration.status}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Clearance Status</div>
                            <div className="mt-2">
                                <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                        registration.clearance_status
                                    )}`}
                                >
                                    {registration.clearance_status}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Matriculation Number</div>
                            <div className="mt-2 font-medium text-gray-900 dark:text-gray-100">
                                {registration.matriculation_number || (
                                    <span className="text-gray-400 dark:text-gray-500 italic">Not assigned</span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Matriculated</div>
                            <div className="mt-2 font-medium text-gray-900 dark:text-gray-100">
                                {registration.matriculated ? (
                                    <span className="text-green-600 dark:text-green-400">✓ Yes</span>
                                ) : (
                                    <span className="text-gray-400 dark:text-gray-500">No</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Student Information */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Student Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Full Name
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {registration.student?.first_name} {registration.student?.last_name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Email
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {registration.student?.email}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Phone
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {registration.student?.phone}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    JAMB Registration
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {registration.student?.jamb_registration}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Program Information */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Program Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Program
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {registration.program?.name} ({registration.program?.code})
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Department
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {registration.program?.department?.name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    College
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {registration.program?.department?.faculty?.name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Level
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {registration.level}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Duration
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {registration.program?.duration} years
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Degree Type
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {registration.program?.degree_type}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Registration Progress */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Registration Progress
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${registration.course_confirmed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}>
                                    {registration.course_confirmed && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`ml-3 text-sm ${registration.course_confirmed ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    Course Confirmed
                                </span>
                            </div>

                            <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${registration.enrollment_form_completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}>
                                    {registration.enrollment_form_completed && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`ml-3 text-sm ${registration.enrollment_form_completed ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    Enrollment Form Completed
                                </span>
                            </div>

                            <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${registration.acceptance_fee_paid ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}>
                                    {registration.acceptance_fee_paid && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`ml-3 text-sm ${registration.acceptance_fee_paid ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    Acceptance Fee Paid
                                </span>
                            </div>

                            <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${registration.registration_fee_paid ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}>
                                    {registration.registration_fee_paid && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`ml-3 text-sm ${registration.registration_fee_paid ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    Registration Fee Paid
                                </span>
                            </div>

                            <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${registration.credentials_uploaded ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}>
                                    {registration.credentials_uploaded && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`ml-3 text-sm ${registration.credentials_uploaded ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    Credentials Uploaded
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Clearance Information */}
                    {(registration.clearance_notes || registration.clearedBy) && (
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Clearance Information
                            </h2>
                            <div className="space-y-4">
                                {registration.clearedBy && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Cleared By
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {registration.clearedBy.name}
                                        </p>
                                        {registration.cleared_at && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(registration.cleared_at)}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {registration.clearance_notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Notes
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                            {registration.clearance_notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Timestamps
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Created At
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {formatDate(registration.created_at)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Updated At
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {formatDate(registration.updated_at)}
                                </p>
                            </div>
                            {registration.matriculated_at && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Matriculated At
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {formatDate(registration.matriculated_at)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Clearance Modal */}
                <Modal
                    isOpen={showClearanceModal}
                    onClose={() => setShowClearanceModal(false)}
                    title="Process Registration Clearance"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Clearance Decision
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="approved"
                                        checked={clearanceStatus === 'approved'}
                                        onChange={(e) => setClearanceStatus(e.target.value as 'approved')}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100">Approve Clearance</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="rejected"
                                        checked={clearanceStatus === 'rejected'}
                                        onChange={(e) => setClearanceStatus(e.target.value as 'rejected')}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100">Reject Clearance</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={clearanceNotes}
                                onChange={(e) => setClearanceNotes(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                placeholder="Add any notes about this clearance decision..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowClearanceModal(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleClearance}
                                disabled={clearRegistrationMutation.isPending}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {clearRegistrationMutation.isPending ? 'Processing...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </Layout>
        </ProtectedRoute>
    );
}
