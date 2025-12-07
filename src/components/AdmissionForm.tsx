import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAdmissionSchema, updateAdmissionSchema, CreateAdmissionFormData, UpdateAdmissionFormData } from '@/lib/validators';
import { useFaculties, useDepartments, useModeOfEntries } from '@/lib/queries';
import type { Admission } from '@/types/api';

interface AdmissionFormProps {
    admission?: Admission;
    onSubmit: (data: CreateAdmissionFormData | UpdateAdmissionFormData) => void;
    isLoading?: boolean;
}

export default function AdmissionForm({ admission, onSubmit, isLoading = false }: AdmissionFormProps) {
    const isEditing = !!admission;
    const { data: facultiesData } = useFaculties();
    const { data: departmentsData } = useDepartments();
    const { data: modeOfEntriesData } = useModeOfEntries();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateAdmissionFormData | UpdateAdmissionFormData>({
        resolver: zodResolver(isEditing ? updateAdmissionSchema : createAdmissionSchema),
        defaultValues: admission
            ? {
                applicant_name: admission.applicant_name,
                applicant_email: admission.applicant_email,
                applicant_phone: admission.applicant_phone,
                programme: admission.programme,
                admission_status: admission.admission_status,
                screening_score: admission.screening_score ?? undefined,
                interview_date: admission.interview_date?.split('T')[0],
                remarks: admission.remarks || '',
                faculty_id: admission.faculty_id ?? undefined,
                department_id: admission.department_id ?? undefined,
                mode_of_entry_id: admission.mode_of_entry_id ?? undefined,
            }
            : {
                applicant_name: '',
                applicant_email: '',
                applicant_phone: '',
                programme: '',
                admission_status: 'pending',
                screening_score: undefined,
                interview_date: '',
                remarks: '',
                faculty_id: undefined,
                department_id: undefined,
                mode_of_entry_id: undefined,
            },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Applicant Name */}
                <div>
                    <label htmlFor="applicant_name" className="label">
                        Applicant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('applicant_name')}
                        id="applicant_name"
                        type="text"
                        placeholder="Full name"
                        className="input"
                    />
                    {errors.applicant_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.applicant_name.message}</p>}
                </div>

                {/* Applicant Email */}
                <div>
                    <label htmlFor="applicant_email" className="label">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('applicant_email')}
                        id="applicant_email"
                        type="email"
                        placeholder="email@example.com"
                        className="input"
                    />
                    {errors.applicant_email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.applicant_email.message}</p>}
                </div>

                {/* Applicant Phone */}
                <div>
                    <label htmlFor="applicant_phone" className="label">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('applicant_phone')}
                        id="applicant_phone"
                        type="tel"
                        placeholder="+234 XXX XXX XXXX"
                        className="input"
                    />
                    {errors.applicant_phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.applicant_phone.message}</p>}
                </div>

                {/* Programme */}
                <div>
                    <label htmlFor="programme" className="label">
                        Programme <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('programme')}
                        id="programme"
                        type="text"
                        placeholder="e.g., Computer Science"
                        className="input"
                    />
                    {errors.programme && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.programme.message}</p>}
                </div>

                {/* Admission Status */}
                <div>
                    <label htmlFor="admission_status" className="label">
                        Status
                    </label>
                    <select
                        {...register('admission_status')}
                        id="admission_status"
                        className="input"
                    >
                        <option value="pending">Pending</option>
                        <option value="admitted">Admitted</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlisted">Waitlisted</option>
                    </select>
                    {errors.admission_status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.admission_status.message}</p>}
                </div>

                {/* Screening Score */}
                <div>
                    <label htmlFor="screening_score" className="label">
                        Screening Score
                    </label>
                    <input
                        {...register('screening_score', { valueAsNumber: true })}
                        id="screening_score"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0-100"
                        className="input"
                    />
                    {errors.screening_score && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.screening_score.message}</p>}
                </div>

                {/* Interview Date */}
                <div>
                    <label htmlFor="interview_date" className="label">
                        Interview Date
                    </label>
                    <input
                        {...register('interview_date')}
                        id="interview_date"
                        type="date"
                        className="input"
                    />
                    {errors.interview_date && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.interview_date.message}</p>}
                </div>

                {/* College */}
                <div>
                    <label htmlFor="faculty_id" className="label">
                        College
                    </label>
                    <select
                        {...register('faculty_id', { valueAsNumber: true })}
                        id="faculty_id"
                        className="input"
                    >
                        <option value="">Select College</option>
                        {facultiesData?.data.map((faculty) => (
                            <option key={faculty.id} value={faculty.id}>
                                {faculty.name}
                            </option>
                        ))}
                    </select>
                    {errors.faculty_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.faculty_id.message}</p>}
                </div>

                {/* Department */}
                <div>
                    <label htmlFor="department_id" className="label">
                        Department
                    </label>
                    <select
                        {...register('department_id', { valueAsNumber: true })}
                        id="department_id"
                        className="input"
                    >
                        <option value="">Select Department</option>
                        {departmentsData?.data.map((department) => (
                            <option key={department.id} value={department.id}>
                                {department.name}
                            </option>
                        ))}
                    </select>
                    {errors.department_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.department_id.message}</p>}
                </div>

                {/* Mode of Entry */}
                <div>
                    <label htmlFor="mode_of_entry_id" className="label">
                        Mode of Entry
                    </label>
                    <select
                        {...register('mode_of_entry_id', { valueAsNumber: true })}
                        id="mode_of_entry_id"
                        className="input"
                    >
                        <option value="">Select Mode of Entry</option>
                        {modeOfEntriesData?.data.map((mode) => (
                            <option key={mode.id} value={mode.id}>
                                {mode.name}
                            </option>
                        ))}
                    </select>
                    {errors.mode_of_entry_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mode_of_entry_id.message}</p>}
                </div>
            </div>

            {/* Remarks */}
            <div>
                <label htmlFor="remarks" className="label">
                    Remarks
                </label>
                <textarea
                    {...register('remarks')}
                    id="remarks"
                    rows={4}
                    placeholder="Additional notes about the admission"
                    className="input"
                />
                {errors.remarks && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.remarks.message}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                >
                    {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Admission' : 'Create Admission')}
                </button>
            </div>
        </form>
    );
}
