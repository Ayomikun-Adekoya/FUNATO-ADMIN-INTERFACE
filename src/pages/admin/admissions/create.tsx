import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { useAdmissionApplications, useCreateAdmission } from '@/lib/queries';
import { toast } from 'react-toastify';
import type { AdmissionApplication } from '@/types/api';

export default function CreateAdmissionPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<AdmissionApplication | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [decision, setDecision] = useState<'admitted' | 'not_admitted' | 'pending'>('admitted');
    const [notes, setNotes] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Fetch admission applications (students who have submitted applications)
    const { data: applicationsData, isLoading } = useAdmissionApplications({
        per_page: perPage,
        page: currentPage
    });
    const createAdmissionMutation = useCreateAdmission();

    // Filter students based on search term
    const filteredStudents = useMemo(() => {
        if (!applicationsData?.data) return [];

        if (searchTerm) {
            return applicationsData.data.filter((student) =>
                student.application_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.jamb_information?.jamb_registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return applicationsData.data;
    }, [searchTerm, applicationsData]);

    // Submit the admission decision
    const handleSubmit = async () => {
        if (!selectedStudent) {
            toast.error('Please select a student first.');
            return;
        }

        try {
            await createAdmissionMutation.mutateAsync({
                admission_application_id: selectedStudent.id,
                decision: decision,
                notes: notes || `Congratulations! You have been ${decision === 'admitted' ? 'admitted' : decision === 'not_admitted' ? 'not admitted' : 'put on pending'} to the ${selectedStudent.preferred_course || 'program'}.`,
            });
            toast.success('Admission decision submitted successfully!');
            setShowModal(false);
            setSelectedStudent(null);
            router.push('/admin/admissions');
        } catch (error: unknown) {
            console.error('Error submitting admission decision:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit admission decision. Please try again.';
            toast.error(errorMessage);
        }
    };

    const handleStudentSelect = (student: AdmissionApplication) => {
        setSelectedStudent(student);
        setShowModal(true);
        setDecision('admitted');
        setNotes('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedStudent(null);
        setDecision('admitted');
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
                                href="/admin/admissions"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Admissions
                            </Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Create</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Admission</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Search for a student and make an admission decision</p>
                    </div>

                    {/* Search Section */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search by application number, name, email, or JAMB reg number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input input-bordered w-full"
                        />
                    </div>

                    {/* Search Results */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        filteredStudents.length > 0 ? (
                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Application Number</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>JAMB Reg No.</th>
                                                <th>Phone</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="font-medium">{student.application_number}</td>
                                                    <td>
                                                        {student.first_name || 'N/A'} {student.last_name || ''} {student.other_name || ''}
                                                    </td>
                                                    <td>{student.email}</td>
                                                    <td className="font-mono text-sm">{student.jamb_information?.jamb_registration_number || 'N/A'}</td>
                                                    <td>{student.phone}</td>
                                                    <td>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === 'submitted'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                            : student.status === 'accepted'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleStudentSelect(student)}
                                                            className="btn-secondary text-sm py-1 px-3"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {applicationsData && (
                                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                        <Pagination
                                            currentPage={applicationsData.current_page}
                                            totalPages={applicationsData.last_page}
                                            perPage={applicationsData.per_page}
                                            total={applicationsData.total}
                                            onPageChange={setCurrentPage}
                                            onPerPageChange={setPerPage}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="card text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="mt-4 text-gray-500 dark:text-gray-400">No students found.</p>
                            </div>
                        )
                    )}

                    {/* Student Details Modal */}
                    <Modal
                        isOpen={showModal}
                        onClose={handleCloseModal}
                        title="Student Details"
                        size="lg"
                    >
                        {selectedStudent && (
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {selectedStudent.first_name} {selectedStudent.last_name} {selectedStudent.other_name || ''}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">JAMB Registration</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.jamb_information?.jamb_registration_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Preferred Course</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.preferred_course || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Faculty</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.faculty || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.department || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Mode of Entry</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.mode_of_entry || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Year of Entry</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.year_of_entry || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Application Status</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedStudent.status === 'submitted'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            : selectedStudent.status === 'accepted'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {selectedStudent.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Application Fee</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedStudent.application_fee_paid
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                            {selectedStudent.application_fee_paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Acceptance Fee</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedStudent.acceptance_fee_paid
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                            {selectedStudent.acceptance_fee_paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Registration Fee</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedStudent.registration_fee_paid
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                            {selectedStudent.registration_fee_paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>

                                {/* Decision Form */}
                                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <label htmlFor="decision" className="label">
                                            Admission Decision <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="decision"
                                            value={decision}
                                            onChange={(e) => setDecision(e.target.value as 'admitted' | 'not_admitted' | 'pending')}
                                            className="input"
                                        >
                                            <option value="admitted">Admitted</option>
                                            <option value="not_admitted">Not Admitted</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="notes" className="label">Notes</label>
                                        <textarea
                                            id="notes"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Enter notes (optional)"
                                            rows={4}
                                            className="input resize-none"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="btn-secondary"
                                            disabled={createAdmissionMutation.isPending}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="btn-primary"
                                            disabled={createAdmissionMutation.isPending}
                                        >
                                            {createAdmissionMutation.isPending ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Decision'
                                            )}
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
