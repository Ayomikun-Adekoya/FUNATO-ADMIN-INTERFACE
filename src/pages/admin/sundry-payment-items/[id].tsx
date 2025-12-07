// pages/admin/sundry-payment-items/[id].tsx
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import SundryPaymentItemForm from '@/components/SundryPaymentItemForm';
import { useSundryPaymentItem, useUpdateSundryPaymentItem } from '@/lib/queries';
import type { CreateSundryPaymentItemFormData } from '@/lib/validators';

export default function EditSundryPaymentItemPage() {
    const router = useRouter();
    const { id } = router.query;
    const itemId = Number(id);

    const { data: item, isLoading } = useSundryPaymentItem(itemId);
    const updateMutation = useUpdateSundryPaymentItem();

    const handleSubmit = async (data: CreateSundryPaymentItemFormData) => {
        if (!item) return;
        try {
            await updateMutation.mutateAsync({ id: item.id, data });
            router.push('/admin/sundry-payment-items');
        } catch (error) {
            console.error('Error updating sundry payment item:', error);
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                </Layout>
            </ProtectedRoute>
        );
    }

    if (!item) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Payment item not found
                        </h2>
                    </div>
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-4xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Edit Sundry Payment Item
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Update payment item details
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <SundryPaymentItemForm
                            initialData={item}
                            onSubmit={handleSubmit}
                            isSubmitting={updateMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
