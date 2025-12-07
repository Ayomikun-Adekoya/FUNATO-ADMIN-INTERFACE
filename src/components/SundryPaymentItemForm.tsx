// components/SundryPaymentItemForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSundryPaymentItemSchema } from '@/lib/validators';
import type { CreateSundryPaymentItemFormData } from '@/lib/validators';
import type { SundryPaymentItem } from '@/types/api';

interface SundryPaymentItemFormProps {
    initialData?: SundryPaymentItem;
    onSubmit: (data: CreateSundryPaymentItemFormData) => Promise<void>;
    isSubmitting: boolean;
}

export default function SundryPaymentItemForm({ initialData, onSubmit, isSubmitting }: SundryPaymentItemFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateSundryPaymentItemFormData>({
        resolver: zodResolver(createSundryPaymentItemSchema),
        defaultValues: initialData
            ? {
                name: initialData.name,
                description: initialData.description || '',
                amount: initialData.amount,
                category: initialData.category,
                is_active: initialData.is_active,
                display_order: initialData.display_order,
                due_date: initialData.due_date ? initialData.due_date.split('T')[0] : '',
            }
            : {
                name: '',
                description: '',
                amount: 0,
                category: '',
                is_active: true,
                display_order: 1,
                due_date: '',
            },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        {...register('name')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="e.g., Library Fee"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                    )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        {...register('description')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Brief description of the payment"
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
                    )}
                </div>

                {/* Amount */}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount (₦) *
                    </label>
                    <input
                        type="number"
                        id="amount"
                        {...register('amount', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="5000"
                        min="0"
                        step="1"
                    />
                    {errors.amount && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount.message}</p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                    </label>
                    <input
                        type="text"
                        id="category"
                        {...register('category')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="e.g., library, medical, sports"
                    />
                    {errors.category && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category.message}</p>
                    )}
                </div>

                {/* Display Order */}
                <div>
                    <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Display Order *
                    </label>
                    <input
                        type="number"
                        id="display_order"
                        {...register('display_order', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="1"
                        min="1"
                    />
                    {errors.display_order && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.display_order.message}</p>
                    )}
                </div>

                {/* Due Date */}
                <div>
                    <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Due Date (Optional)
                    </label>
                    <input
                        type="date"
                        id="due_date"
                        {...register('due_date')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                    {errors.due_date && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.due_date.message}</p>
                    )}
                </div>

                {/* Checkbox */}
                <div className="md:col-span-2">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_active"
                            {...register('is_active')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                            Active (Show in payment list)
                        </label>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : initialData ? 'Update Payment Item' : 'Create Payment Item'}
                </button>
            </div>
        </form>
    );
}
