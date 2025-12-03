import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createModeOfEntrySchema, updateModeOfEntrySchema, CreateModeOfEntryFormData, UpdateModeOfEntryFormData } from '@/lib/validators';
import type { ModeOfEntry } from '@/types/api';
import { useState } from 'react';

interface ModeOfEntryFormProps {
    modeOfEntry?: ModeOfEntry;
    onSubmit: (data: CreateModeOfEntryFormData | UpdateModeOfEntryFormData) => void;
    isLoading?: boolean;
}

export default function ModeOfEntryForm({ modeOfEntry, onSubmit, isLoading = false }: ModeOfEntryFormProps) {
    const isEditing = !!modeOfEntry;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CreateModeOfEntryFormData | UpdateModeOfEntryFormData>({
        resolver: zodResolver(isEditing ? updateModeOfEntrySchema : createModeOfEntrySchema),
        defaultValues: modeOfEntry
            ? {
                name: modeOfEntry.name,
                code: modeOfEntry.code,
                description: modeOfEntry.description || '',
                is_active: modeOfEntry.is_active,
            }
            : {
                name: '',
                code: '',
                description: '',
                is_active: false,
            },
    });

    const [isActive, setIsActive] = useState(modeOfEntry?.is_active || false);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mode of Entry Name */}
                <div>
                    <label htmlFor="name" className="label">
                        Mode of Entry Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('name')}
                        id="name"
                        type="text"
                        placeholder="e.g., UTME, Direct Entry"
                        className="input"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
                </div>

                {/* Mode of Entry Code */}
                <div>
                    <label htmlFor="code" className="label">
                        Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('code')}
                        id="code"
                        type="text"
                        placeholder="e.g., UTME, DE"
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
                    placeholder="Brief description of this mode of entry"
                    className="input"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
            </div>

            {/* Status Toggle */}
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
                    {isActive ? 'Mode of entry is active' : 'Mode of entry is inactive'}
                </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                >
                    {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Mode of Entry' : 'Create Mode of Entry')}
                </button>
            </div>
        </form>
    );
}
