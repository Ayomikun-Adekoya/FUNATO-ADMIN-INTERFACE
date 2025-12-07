// pages/admin/registration-fee-items/[id].tsx
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RegistrationFeeItemForm from '@/components/RegistrationFeeItemForm';
import { useRegistrationFeeItem, useUpdateRegistrationFeeItem } from '@/lib/queries';
import type { CreateRegistrationFeeItemFormData } from '@/lib/validators';

export default function EditRegistrationFeeItemPage() {
    const router = useRouter();
    const { id } = router.query;
    const itemId = Number(id);

    const { data: item, isLoading } = useRegistrationFeeItem(itemId);
    const updateMutation = useUpdateRegistrationFeeItem();

    const handleSubmit = async (data: CreateRegistrationFeeItemFormData) => {
        if (!item) return;
        try {
            await updateMutation.mutateAsync({ id: item.id, data });
            router.push('/admin/registration-fee-items');
        } catch (error) {
            console.error('Error updating registration fee item:', error);
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
                            Fee item not found
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
                            Edit Registration Fee Item
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Update fee item details
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <RegistrationFeeItemForm
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
