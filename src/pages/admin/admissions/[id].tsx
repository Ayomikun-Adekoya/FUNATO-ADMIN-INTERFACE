import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useUpdateAdmission } from '@/lib/queries';
import { toast } from 'react-toastify';
import type { Admission } from '@/types/api';

export default function EditAdmissionPage() {
    const router = useRouter();
    const { id, data: queryData } = router.query;
    const admissionId = parseInt(id as string);

    const [admission, setAdmission] = useState<Admission | null>(null);
    const [decision, setDecision] = useState<'admitted' | 'not_admitted' | 'pending'>('admitted');
    const [notes, setNotes] = useState('');

    const updateAdmissionMutation = useUpdateAdmission();

    // Load admission data from query params
    useEffect(() => {
        if (queryData && typeof queryData === 'string') {
            try {
                const parsedData = JSON.parse(queryData) as Admission;
                setAdmission(parsedData);
                setDecision(parsedData.decision);
                setNotes(parsedData.notes || '');
            } catch (error) {
                console.error('Error parsing admission data:', error);
            }
        }
    }, [queryData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!notes.trim()) {
            toast.error('Notes are required');
            return;
        }

        try {
            await updateAdmissionMutation.mutateAsync({
                id: admissionId,
                data: { decision, notes },
            });
            toast.success('Admission decision updated successfully!');
            router.push('/admin/admissions');
        } catch (error: any) {
            console.error('Update admission error:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to update admission decision';
            toast.error(errorMessage);
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <Link
                                href="/admin/admissions"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Admissions
                            </Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Edit Decision</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Update Admission Decision</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Update the admission decision for this application</p>
                    </div>

                    {/* Student Details Card */}
                    {admission && (
                        <div className="card mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Student Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Application Number</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {admission.admission_application.application_number}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {admission.admission_application.first_name} {admission.admission_application.last_name} {admission.admission_application.other_name || ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {admission.admission_application.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {admission.admission_application.phone}
                                    </p>
                                </div>
                                {admission.admission_application.preferred_course && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Preferred Course</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {admission.admission_application.preferred_course}
                                        </p>
                                    </div>
                                )}
                                {admission.admission_application.faculty && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Faculty</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {admission.admission_application.faculty}
                                        </p>
                                    </div>
                                )}
                                {admission.admission_application.department && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {admission.admission_application.department}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admission.decision === 'admitted'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : admission.decision === 'not_admitted'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}>
                                        {admission.decision}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="card">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="decision" className="label">
                                    Admission Decision <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="decision"
                                    value={decision}
                                    onChange={(e) => setDecision(e.target.value as 'admitted' | 'not_admitted' | 'pending')}
                                    className="input"
                                    required
                                >
                                    <option value="admitted">Admitted</option>
                                    <option value="not_admitted">Not Admitted</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="notes" className="label">
                                    Notes <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Enter notes about this decision"
                                    rows={6}
                                    className="input resize-none"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Link
                                    href="/admin/admissions"
                                    className="btn-secondary"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={updateAdmissionMutation.isPending}
                                    className="btn-primary"
                                >
                                    {updateAdmissionMutation.isPending ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Decision'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
