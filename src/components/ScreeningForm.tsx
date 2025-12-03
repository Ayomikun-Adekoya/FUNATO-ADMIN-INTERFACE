import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createScreeningSchema, updateScreeningSchema, CreateScreeningFormData, UpdateScreeningFormData } from '@/lib/validators';
import type { Screening } from '@/types/api';

interface ScreeningFormProps {
    screening?: Screening;
    onSubmit: (data: CreateScreeningFormData | UpdateScreeningFormData) => void;
    isLoading?: boolean;
}

export default function ScreeningForm({ screening, onSubmit, isLoading = false }: ScreeningFormProps) {
    const isEditing = !!screening;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateScreeningFormData | UpdateScreeningFormData>({
        resolver: zodResolver(isEditing ? updateScreeningSchema : createScreeningSchema),
        defaultValues: screening
            ? {
                screening_type: screening.screening_type,
                screening_date: screening.screening_date?.split('T')[0],
                venue: screening.venue,
                status: screening.status,
                description: screening.description || '',
                max_participants: screening.max_participants || undefined,
            }
            : {
                screening_type: '',
                screening_date: '',
                venue: '',
                status: 'scheduled',
                description: '',
                max_participants: undefined,
            },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Screening Type */}
            <div>
                <label htmlFor="screening_type" className="label">
                    Screening Type <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('screening_type')}
                    id="screening_type"
                    type="text"
                    placeholder="e.g., Written Test, Interview, Physical Assessment"
                    className="input"
                />
                {errors.screening_type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.screening_type.message}</p>}
            </div>

            {/* Screening Date */}
            <div>
                <label htmlFor="screening_date" className="label">
                    Screening Date <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('screening_date')}
                    id="screening_date"
                    type="date"
                    className="input"
                />
                {errors.screening_date && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.screening_date.message}</p>}
            </div>

            {/* Venue */}
            <div>
                <label htmlFor="venue" className="label">
                    Venue <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('venue')}
                    id="venue"
                    type="text"
                    placeholder="e.g., Main Hall, Room 101, Online"
                    className="input"
                />
                {errors.venue && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.venue.message}</p>}
            </div>

            {/* Status */}
            <div>
                <label htmlFor="status" className="label">
                    Status
                </label>
                <select
                    {...register('status')}
                    id="status"
                    className="input"
                >
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>}
            </div>

            {/* Max Participants */}
            <div>
                <label htmlFor="max_participants" className="label">
                    Maximum Participants
                </label>
                <input
                    {...register('max_participants', { valueAsNumber: true })}
                    id="max_participants"
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    className="input"
                />
                {errors.max_participants && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.max_participants.message}</p>}
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
                    placeholder="Additional details about the screening"
                    className="input"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                >
                    {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Screening' : 'Create Screening')}
                </button>
            </div>
        </form>
    );
}
