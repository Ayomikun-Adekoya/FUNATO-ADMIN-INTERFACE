// pages/admin/sundry-payment-items/create.tsx
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import SundryPaymentItemForm from '@/components/SundryPaymentItemForm';
import { useCreateSundryPaymentItem } from '@/lib/queries';
import type { CreateSundryPaymentItemFormData } from '@/lib/validators';

export default function CreateSundryPaymentItemPage() {
    const router = useRouter();
    const createMutation = useCreateSundryPaymentItem();

    const handleSubmit = async (data: CreateSundryPaymentItemFormData) => {
        try {
            await createMutation.mutateAsync(data);
            router.push('/admin/sundry-payment-items');
        } catch (error) {
            console.error('Error creating sundry payment item:', error);
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-4xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Create Sundry Payment Item
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Add a new miscellaneous payment item for students
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <SundryPaymentItemForm
                            onSubmit={handleSubmit}
                            isSubmitting={createMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
