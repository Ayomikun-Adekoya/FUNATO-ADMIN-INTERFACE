import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDepartmentSchema, updateDepartmentSchema, CreateDepartmentFormData, UpdateDepartmentFormData } from '@/lib/validators';
import { useFaculties } from '@/lib/queries';
import type { Department } from '@/types/api';

interface DepartmentFormProps {
    department?: Department;
    onSubmit: (data: CreateDepartmentFormData | UpdateDepartmentFormData) => void;
    isLoading?: boolean;
}

export default function DepartmentForm({ department, onSubmit, isLoading = false }: DepartmentFormProps) {
    const isEditing = !!department;
    const { data: facultiesData } = useFaculties();
    const [isActive, setIsActive] = useState(department?.is_active ?? true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CreateDepartmentFormData | UpdateDepartmentFormData>({
        resolver: zodResolver(isEditing ? updateDepartmentSchema : createDepartmentSchema),
        defaultValues: department
            ? {
                name: department.name,
                code: department.code,
                faculty_id: department.faculty_id,
                description: department.description || '',
                is_active: department.is_active,
            }
            : {
                name: '',
                code: '',
                faculty_id: undefined,
                description: '',
                is_active: true,
            },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Name */}
                <div>
                    <label htmlFor="name" className="label">
                        Department Name <span className="text-red-500">*</span>
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

                {/* Department Code */}
                <div>
                    <label htmlFor="code" className="label">
                        Department Code <span className="text-red-500">*</span>
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

                {/* College */}
                <div>
                    <label htmlFor="faculty_id" className="label">
                        College <span className="text-red-500">*</span>
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
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="label">
                    Description
                </label>
                <textarea
                    {...register('description')}
                    id="description"
                    rows={3}
                    placeholder="Brief description of the department"
                    className="input"
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
                        {isActive ? 'Department is active' : 'Department is inactive'}
                    </p>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                >
                    {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Department' : 'Create Department')}
                </button>
            </div>
        </form>
    );
}
