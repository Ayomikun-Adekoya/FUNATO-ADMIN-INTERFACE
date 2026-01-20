import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    useUpdateAdmission,
    useUpdateStudentProgram,
    useFaculties,
    useDepartments,
    usePrograms,
} from '@/lib/queries';
import { toast } from 'react-toastify';
import type { Admission } from '@/types/api';

export default function EditAdmissionPage() {
    const router = useRouter();
    const { id, data: queryData, mode } = router.query;
    const admissionId = Number(id);
    const editMode = mode === 'course' ? 'course' : 'decision';

    const [admission, setAdmission] = useState<Admission | null>(null);

    /* Decision state */
    const [decision, setDecision] =
        useState<'admitted' | 'not_admitted' | 'pending'>('pending');
    const [notes, setNotes] = useState('');

    /* Course edit state */
    const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);

    const updateAdmissionMutation = useUpdateAdmission();
    const updateStudentProgramMutation = useUpdateStudentProgram();

    /* === DATA FETCHING === */
    const { data: facultiesResponse } = useFaculties();
    const faculties = Array.isArray(facultiesResponse?.data)
        ? facultiesResponse.data
        : [];

    const { data: departmentsResponse } = useDepartments(selectedFacultyId ? { faculty_id: selectedFacultyId } : undefined);
    const departments = Array.isArray(departmentsResponse?.data)
        ? departmentsResponse.data
        : [];

    const { data: programsResponse } = usePrograms(selectedDepartmentId ? { department_id: selectedDepartmentId } : undefined);
    const programs = Array.isArray(programsResponse?.data)
        ? programsResponse.data
        : [];

    /* Load admission from query */
    useEffect(() => {
        if (queryData && typeof queryData === 'string') {
            try {
                const parsed = JSON.parse(queryData) as Admission;
                setAdmission(parsed);
                setDecision(parsed.decision);
                setNotes(parsed.notes || '');
            } catch (e) {
                console.error('Admission parse error:', e);
            }
        }
    }, [queryData]);

    const handleDecisionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!notes.trim()) {
            toast.error('Notes are required');
            return;
        }

        try {
            await updateAdmissionMutation.mutateAsync({
                id: admissionId,
                data: {
                    decision,
                    notes,
                },
            });

            toast.success('Admission updated successfully');
            router.push('/admin/admissions');
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                'Failed to update admission';
            toast.error(message);
        }
    };

    const handleCourseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProgramId) {
            toast.error('Please select a program');
            return;
        }

        if (!admission?.admission_application?.student?.id) {
            toast.error('Student ID not found');
            return;
        }

        try {
            await updateStudentProgramMutation.mutateAsync({
                studentId: admission.admission_application.student.id,
                programId: selectedProgramId,
            });

            toast.success('Student program updated successfully');
            router.push('/admin/admissions');
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                'Failed to update student program';
            toast.error(message);
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                            <Link href="/admin/admissions" className="hover:text-primary-600">
                                Admissions
                            </Link>
                            <span>/</span>
                            <span>Edit Admission</span>
                        </div>

                        <h1 className="text-3xl font-bold">Update Admission</h1>
                        <p className="mt-2 text-gray-600">
                            {editMode === 'course' ? 'Change student program/course' : 'Review decision and update notes'}
                        </p>
                    </div>

                    {/* Student Information */}
                    {admission && (
                        <div className="card mb-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Applicant Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Application No.</p>
                                    <p className="font-semibold">
                                        {admission.admission_application.application_number}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="font-semibold">
                                        {admission.admission_application.first_name}{' '}
                                        {admission.admission_application.last_name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-semibold">
                                        {admission.admission_application.email}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-semibold">
                                        {admission.admission_application.phone}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Original Faculty</p>
                                    <p className="font-semibold">
                                        {admission.admission_application.faculty || '—'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Original Department</p>
                                    <p className="font-semibold">
                                        {admission.admission_application.department || '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Decision Edit Form */}
                    {editMode === 'decision' && (
                        <form onSubmit={handleDecisionSubmit} className="card space-y-6">
                            {/* Decision */}
                            <div>
                                <label className="label">
                                    Admission Decision <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={decision}
                                    onChange={(e) =>
                                        setDecision(e.target.value as any)
                                    }
                                    className="input"
                                    required
                                >
                                    <option value="admitted">Admitted</option>
                                    <option value="not_admitted">Not Admitted</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="label">
                                    Notes <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={5}
                                    className="input resize-none"
                                    required
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Link href="/admin/admissions" className="btn-secondary">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={updateAdmissionMutation.isPending}
                                    className="btn-primary"
                                >
                                    {updateAdmissionMutation.isPending ? 'Updating…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Course Edit Form */}
                    {editMode === 'course' && (
                        <form onSubmit={handleCourseSubmit} className="card space-y-6">
                            <div>
                                <label className="label">
                                    Faculty <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedFacultyId ?? ''}
                                    onChange={(e) => {
                                        const facultyId = e.target.value ? Number(e.target.value) : null;
                                        setSelectedFacultyId(facultyId);
                                        setSelectedDepartmentId(null);
                                        setSelectedProgramId(null);
                                    }}
                                    className="input"
                                    required
                                >
                                    <option value="">Select faculty</option>
                                    {faculties.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedDepartmentId ?? ''}
                                    onChange={(e) => {
                                        const deptId = e.target.value ? Number(e.target.value) : null;
                                        setSelectedDepartmentId(deptId);
                                        setSelectedProgramId(null);
                                    }}
                                    className="input"
                                    disabled={!selectedFacultyId}
                                    required
                                >
                                    <option value="">Select department</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">
                                    Program <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedProgramId ?? ''}
                                    onChange={(e) =>
                                        setSelectedProgramId(e.target.value ? Number(e.target.value) : null)
                                    }
                                    className="input"
                                    disabled={!selectedDepartmentId}
                                    required
                                >
                                    <option value="">Select program</option>
                                    {programs.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Link href="/admin/admissions" className="btn-secondary">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={updateStudentProgramMutation.isPending}
                                    className="btn-primary"
                                >
                                    {updateStudentProgramMutation.isPending ? 'Updating…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
