// pages/admin/registration-fee-items/create.tsx
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RegistrationFeeItemForm from '@/components/RegistrationFeeItemForm';
import { useCreateRegistrationFeeItem } from '@/lib/queries';
import type { CreateRegistrationFeeItemFormData } from '@/lib/validators';

export default function CreateRegistrationFeeItemPage() {
    const router = useRouter();
    const createMutation = useCreateRegistrationFeeItem();

    const handleSubmit = async (data: CreateRegistrationFeeItemFormData) => {
        try {
            await createMutation.mutateAsync(data);
            router.push('/admin/registration-fee-items');
        } catch (error) {
            console.error('Error creating registration fee item:', error);
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-4xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Create Registration Fee Item
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Add a new fee item for student registration
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <RegistrationFeeItemForm
                            onSubmit={handleSubmit}
                            isSubmitting={createMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
