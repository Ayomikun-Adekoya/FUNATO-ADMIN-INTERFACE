import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { useAdmissions, useCreateScreening } from '@/lib/queries';
import { toast } from 'react-toastify';
import type { Admission } from '@/types/api';

export default function CreateScreeningPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Admission | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'failed'>('pending');
    const [scheduledDate, setScheduledDate] = useState('');
    const [venue, setVenue] = useState('');
    const [notes, setNotes] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Fetch admissions with pending status only
    const { data: admissionsData, isLoading } = useAdmissions({
        per_page: perPage,
        page: currentPage,
        decision: 'pending'
    });
    const createScreeningMutation = useCreateScreening();

    // Filter students based on search term
    const filteredStudents = useMemo(() => {
        if (!admissionsData?.data) return [];

        if (searchTerm) {
            return admissionsData.data.filter((admission) =>
                admission.admission_application?.application_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admission.admission_application?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admission.admission_application?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admission.admission_application?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admission.admission_application?.student?.jamb_registration?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return admissionsData.data;
    }, [searchTerm, admissionsData]);

    // Submit the screening
    const handleSubmit = async () => {
        if (!selectedStudent) {
            toast.error('Please select a student first.');
            return;
        }

        if (!scheduledDate || !venue) {
            toast.error('Please fill in scheduled date and venue.');
            return;
        }

        try {
            await createScreeningMutation.mutateAsync({
                admission_application_id: selectedStudent.admission_application.id,
                status: status,
                notes: notes || `Screening scheduled for ${selectedStudent.admission_application.first_name} ${selectedStudent.admission_application.last_name}`,
                screening_data: {
                    scheduled_date: scheduledDate,
                    venue: venue,
                },
            });
            toast.success('Screening created successfully!');
            setShowModal(false);
            setSelectedStudent(null);
            router.push('/admin/screenings');
        } catch (error: unknown) {
            console.error('Error creating screening:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create screening. Please try again.';
            toast.error(errorMessage);
        }
    };

    const handleStudentSelect = (admission: Admission) => {
        setSelectedStudent(admission);
        setShowModal(true);
        setStatus('pending');
        setScheduledDate('');
        setVenue('');
        setNotes('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedStudent(null);
        setStatus('pending');
        setScheduledDate('');
        setVenue('');
        setNotes('');
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="mx-auto">
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <Link
                                href="/admin/screenings"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Screenings
                            </Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Create</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Screening</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Select a student with pending admission status and schedule their screening
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search by application number, name, email, or JAMB reg number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input w-full"
                        />
                    </div>

                    {/* Students Table */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="mt-4 text-gray-500 dark:text-gray-400">
                                {searchTerm
                                    ? 'No students found matching your search.'
                                    : 'No pending admissions available for screening.'}
                            </p>
                            {!searchTerm && (
                                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                                    Students must have a pending admission status to be scheduled for screening.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Application No.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            JAMB Reg No.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Decision
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredStudents.map((admission) => (
                                        <tr key={admission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {admission.admission_application?.application_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                    {admission.admission_application?.first_name} {admission.admission_application?.last_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {admission.admission_application?.email}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                                    {admission.admission_application?.student?.jamb_registration || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {admission.admission_application?.phone || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${admission.decision === 'admitted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    admission.decision === 'not_admitted' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    }`}>
                                                    {admission.decision || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleStudentSelect(admission)}
                                                    className="btn-primary text-sm"
                                                >
                                                    Schedule Screening
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && filteredStudents.length > 0 && admissionsData && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={admissionsData.current_page}
                                totalPages={admissionsData.last_page}
                                perPage={admissionsData.per_page}
                                total={admissionsData.total}
                                onPageChange={setCurrentPage}
                                onPerPageChange={setPerPage}
                            />
                        </div>
                    )}

                    {/* Student Details & Screening Form Modal */}
                    <Modal
                        isOpen={showModal}
                        onClose={handleCloseModal}
                        title="Schedule Screening"
                    >
                        {selectedStudent && (
                            <div className="space-y-6">
                                {/* Student Details Card */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                        Student Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Application Number</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.admission_application?.application_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Full Name</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {selectedStudent.admission_application?.first_name} {selectedStudent.admission_application?.last_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.admission_application?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">JAMB Reg No.</p>
                                            <p className="font-medium font-mono text-gray-900 dark:text-gray-100">{selectedStudent.admission_application?.student?.jamb_registration || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Phone</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.admission_application?.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Preferred Course</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.admission_application?.preferred_course || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">College</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {selectedStudent.admission_application?.faculty || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Department</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {selectedStudent.admission_application?.department || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Admission Decision</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedStudent.decision === 'admitted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    selectedStudent.decision === 'not_admitted' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    }`}>
                                                    {selectedStudent.decision}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Screening Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as 'pending' | 'in_progress' | 'completed' | 'failed')}
                                            className="input w-full"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Scheduled Date *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            className="input w-full"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Venue *
                                        </label>
                                        <input
                                            type="text"
                                            value={venue}
                                            onChange={(e) => setVenue(e.target.value)}
                                            placeholder="e.g., Main Campus Hall A"
                                            className="input w-full"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={3}
                                            placeholder="Additional notes or instructions..."
                                            className="input w-full"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="btn-secondary"
                                            disabled={createScreeningMutation.isPending}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className="btn-primary"
                                            disabled={createScreeningMutation.isPending || !scheduledDate || !venue}
                                        >
                                            {createScreeningMutation.isPending ? 'Creating...' : 'Create Screening'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
