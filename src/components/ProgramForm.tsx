import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProgramSchema, updateProgramSchema, CreateProgramFormData, UpdateProgramFormData } from '@/lib/validators';
import { useDepartments } from '@/lib/queries';
import type { Program } from '@/types/api';

interface ProgramFormProps {
    program?: Program;
    onSubmit: (data: CreateProgramFormData | UpdateProgramFormData) => void;
    isLoading?: boolean;
}

export default function ProgramForm({ program, onSubmit, isLoading = false }: ProgramFormProps) {
    const isEditing = !!program;
    const { data: departmentsData } = useDepartments();
    const [isActive, setIsActive] = useState(program?.is_active ?? true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CreateProgramFormData | UpdateProgramFormData>({
        resolver: zodResolver(isEditing ? updateProgramSchema : createProgramSchema),
        defaultValues: program
            ? {
                name: program.name,
                code: program.code,
                department_id: program.department_id,
                description: program.description || '',
                duration: program.duration,
                degree_type: program.degree_type,
                is_active: program.is_active,
            }
            : {
                name: '',
                code: '',
                department_id: undefined,
                description: '',
                duration: 4,
                degree_type: '',
                is_active: true,
            },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Program Name */}
                <div>
                    <label htmlFor="name" className="label">
                        Program Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('name')}
                        id="name"
                        type="text"
                        placeholder="e.g., Computer Science"
                        className="input"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
                </div>

                {/* Program Code */}
                <div>
                    <label htmlFor="code" className="label">
                        Program Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('code')}
                        id="code"
                        type="text"
                        placeholder="e.g., CSC"
                        className="input"
                    />
                    {errors.code && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code.message}</p>}
                </div>

                {/* Department */}
                <div>
                    <label htmlFor="department_id" className="label">
                        Department <span className="text-red-500">*</span>
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

                {/* Degree Type */}
                <div>
                    <label htmlFor="degree_type" className="label">
                        Degree Type <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('degree_type')}
                        id="degree_type"
                        type="text"
                        placeholder="e.g., B.Sc., M.Sc., Ph.D."
                        className="input"
                    />
                    {errors.degree_type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.degree_type.message}</p>}
                </div>

                {/* Duration */}
                <div>
                    <label htmlFor="duration" className="label">
                        Duration (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('duration', { valueAsNumber: true })}
                        id="duration"
                        type="number"
                        min="1"
                        placeholder="e.g., 4"
                        className="input"
                    />
                    {errors.duration && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration.message}</p>}
                </div>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="label">
                    Description
                </label>
                <textarea
                    {...register('description')}
                    id="description"
                    rows={4}
                    placeholder="Enter program description (optional)"
                    className="input resize-none"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
            </div>

            {/* Active Status Toggle - Only show when editing */}
            {isEditing && (
                <div>
                    <label className="flex items-center justify-between">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Active Status
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setValue('is_active', !isActive);
                                setIsActive(!isActive);
                            }}
                            className={`${isActive ? 'bg-primary-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            role="switch"
                            aria-checked={isActive}
                        >
                            <span
                                className={`${isActive ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                        </button>
                    </label>
                    <p className="mt-1 text-sm text-gray-500">
                        {isActive ? 'Program is active' : 'Program is inactive'}
                    </p>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="btn-secondary"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        <>{isEditing ? 'Update Program' : 'Create Program'}</>
                    )}
                </button>
            </div>
        </form>
    );
}
