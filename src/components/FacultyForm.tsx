import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFacultySchema, updateFacultySchema, CreateFacultyFormData, UpdateFacultyFormData } from '@/lib/validators';
import type { Faculty } from '@/types/api';
import { useState } from 'react';

interface FacultyFormProps {
    faculty?: Faculty;
    onSubmit: (data: CreateFacultyFormData | UpdateFacultyFormData) => void;
    isLoading?: boolean;
}

export default function FacultyForm({ faculty, onSubmit, isLoading = false }: FacultyFormProps) {
    const isEditing = !!faculty;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CreateFacultyFormData | UpdateFacultyFormData>({
        resolver: zodResolver(isEditing ? updateFacultySchema : createFacultySchema),
        defaultValues: faculty
            ? {
                name: faculty.name,
                code: faculty.code,
                description: faculty.description || '',
                is_active: faculty.is_active,
            }
            : {
                name: '',
                code: '',
                description: '',
                is_active: true,
            },
    });

    const [isActive, setIsActive] = useState<boolean>(!!faculty?.is_active);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Faculty Name */}
                <div>
                    <label htmlFor="name" className="label">
                        College Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('name')}
                        id="name"
                        type="text"
                        placeholder="e.g., College of Science"
                        className="input"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
                </div>

                {/* Faculty Code */}
                <div>
                    <label htmlFor="code" className="label">
                        College Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('code')}
                        id="code"
                        type="text"
                        placeholder="e.g., FSCI"
                        className="input"
                    />
                    {errors.code && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code.message}</p>}
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
                    placeholder="Brief description of the college"
                    className="input"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
            </div>

            {/* Active Status Toggle */}
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
                    {isActive ? 'College is active' : 'College is inactive'}
                </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                >
                    {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Faculty' : 'Create Faculty')}
                </button>
            </div>
        </form>
    );
}
