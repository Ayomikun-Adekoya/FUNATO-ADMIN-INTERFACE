import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModeOfEntryForm from '@/components/ModeOfEntryForm';
import { useCreateModeOfEntry } from '@/lib/queries';
import { CreateModeOfEntryFormData } from '@/lib/validators';
import { toast } from 'react-toastify';

export default function CreateModeOfEntryPage() {
    const router = useRouter();
    const createModeOfEntryMutation = useCreateModeOfEntry();

    const handleSubmit = async (data: CreateModeOfEntryFormData) => {
        try {
            await createModeOfEntryMutation.mutateAsync({
                name: data.name,
                code: data.code,
                description: data.description,
                is_active: data.is_active,
            });
            toast.success('Mode of entry created successfully!');
            router.push('/admin/mode-of-entries');
        } catch (error) {
            console.error('Create mode of entry error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create mode of entry';
            toast.error('Failed to create mode of entry. Please try again.');
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <Link
                                href="/admin/mode-of-entries"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Mode of Entries
                            </Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Create</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Mode of Entry</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Add a new mode of entry option</p>
                    </div>

                    <div className="card">
                        <ModeOfEntryForm
                            onSubmit={handleSubmit}
                            isLoading={createModeOfEntryMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
