import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModeOfEntryForm from '@/components/ModeOfEntryForm';
import { useModeOfEntry, useUpdateModeOfEntry } from '@/lib/queries';
import { UpdateModeOfEntryFormData } from '@/lib/validators';
import { toast } from 'react-toastify';

export default function EditModeOfEntryPage() {
    const router = useRouter();
    const { id } = router.query;
    const modeOfEntryId = parseInt(id as string);

    const { data: modeOfEntry, isLoading } = useModeOfEntry(modeOfEntryId);
    const updateModeOfEntryMutation = useUpdateModeOfEntry();

    const handleSubmit = async (data: UpdateModeOfEntryFormData) => {
        try {
            const payload: Partial<UpdateModeOfEntryFormData> = {};

            if (data.name && data.name !== modeOfEntry?.name) {
                payload.name = data.name;
            }

            if (data.code && data.code !== modeOfEntry?.code) {
                payload.code = data.code;
            }

            if (data.description) {
                payload.description = data.description;
            }


            await updateModeOfEntryMutation.mutateAsync({
                id: modeOfEntryId,
                data: payload,
            });

            toast.success('Mode of entry updated successfully!');
            router.push('/admin/mode-of-entries');
        } catch (error) {
            console.error('Update mode of entry error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update mode of entry';
            toast.error(errorMessage);
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                </Layout>
            </ProtectedRoute>
        );
    }

    if (!modeOfEntry) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mode of Entry Not Found</h1>
                            <Link href="/admin/mode-of-entries" className="link mt-4 inline-block">
                                Back to Mode of Entries
                            </Link>
                        </div>
                    </div>
                </Layout>
            </ProtectedRoute>
        );
    }

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
                            <span>Edit</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Mode of Entry</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Update mode of entry details</p>
                    </div>

                    <div className="card">
                        <ModeOfEntryForm
                            modeOfEntry={modeOfEntry}
                            onSubmit={handleSubmit}
                            isLoading={updateModeOfEntryMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
