import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    useUpdateAdmission,
    useFaculties,
    useDepartments,
} from '@/lib/queries';
import { toast } from 'react-toastify';
import type { Admission } from '@/types/api';

export default function EditAdmissionPage() {
    const router = useRouter();
    const { id, data: queryData } = router.query;
    const admissionId = Number(id);

    const [admission, setAdmission] = useState<Admission | null>(null);

    /* Decision state */
    const [decision, setDecision] =
        useState<'admitted' | 'not_admitted' | 'pending'>('pending');
    const [notes, setNotes] = useState('');

    /* Alternative course assignment state */
    const [assignedFacultyId, setAssignedFacultyId] = useState<number | null>(null);
    const [assignedDepartmentId, setAssignedDepartmentId] = useState<number | null>(null);
    const [assignmentReason, setAssignmentReason] = useState('');

    const updateAdmissionMutation = useUpdateAdmission();

    /* === FIXED DATA EXTRACTION === */
    const { data: facultiesResponse } = useFaculties();
    const faculties = Array.isArray(facultiesResponse?.data)
        ? facultiesResponse.data
        : [];

    const { data: departmentsResponse } = useDepartments(assignedFacultyId);
    const departments = Array.isArray(departmentsResponse?.data)
        ? departmentsResponse.data
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!notes.trim()) {
            toast.error('Notes are required');
            return;
        }

        const faculty = faculties.find(f => f.id === assignedFacultyId);
        const department = departments.find(d => d.id === assignedDepartmentId);

        try {
            await updateAdmissionMutation.mutateAsync({
                id: admissionId,
                data: {
                    decision,
                    notes,
                    ...(assignedFacultyId && assignedDepartmentId && {
                        assigned_faculty_id: faculty?.id,
                        assigned_faculty: faculty?.name,
                        assigned_department_id: department?.id,
                        assigned_department: department?.name,
                        assignment_reason: assignmentReason || null,
                    }),
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
                            Review decision and optionally assign an alternative course
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

                                {admission.assigned_department && (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-500">Assigned Faculty</p>
                                            <p className="font-semibold text-blue-600">
                                                {admission.assigned_faculty}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Assigned Department</p>
                                            <p className="font-semibold text-blue-600">
                                                {admission.assigned_department}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Update Form */}
                    <form onSubmit={handleSubmit} className="card space-y-6">
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

                        {/* Alternative Course */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">
                                Assign Alternative Course (Optional)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Faculty</label>
                                    <select
                                        value={assignedFacultyId ?? ''}
                                        onChange={(e) =>
                                            setAssignedFacultyId(
                                                e.target.value ? Number(e.target.value) : null
                                            )
                                        }
                                        className="input"
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
                                    <label className="label">Department</label>
                                    <select
                                        value={assignedDepartmentId ?? ''}
                                        onChange={(e) =>
                                            setAssignedDepartmentId(
                                                e.target.value ? Number(e.target.value) : null
                                            )
                                        }
                                        className="input"
                                        disabled={!assignedFacultyId}
                                    >
                                        <option value="">Select department</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="label">Assignment Reason</label>
                                <textarea
                                    value={assignmentReason}
                                    onChange={(e) => setAssignmentReason(e.target.value)}
                                    rows={3}
                                    className="input resize-none"
                                    placeholder="e.g. Did not meet departmental cut-off"
                                />
                            </div>
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
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
