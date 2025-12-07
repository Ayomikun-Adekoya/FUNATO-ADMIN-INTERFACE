import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import FacultyForm from '@/components/FacultyForm';
import { useCreateFaculty } from '@/lib/queries';
import { CreateFacultyFormData, UpdateFacultyFormData } from '@/lib/validators';
import { toast } from 'react-toastify';

export default function CreateFacultyPage() {
    const router = useRouter();
    const createFacultyMutation = useCreateFaculty();

    const handleSubmit = async (data: CreateFacultyFormData | UpdateFacultyFormData) => {
        try {
            await createFacultyMutation.mutateAsync({
                name: data.name!,
                code: data.code!,
                description: data.description,
            });
            toast.success('College created successfully!');
            router.push('/admin/faculties');
        } catch (error) {
            console.error('Create college error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create college';
            toast.error('Failed to create college. Please try again.');
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <Link
                                href="/admin/faculties"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Faculties
                            </Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Create</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create College</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Add a new college to the system</p>
                    </div>

                    <div className="card">
                        <FacultyForm
                            onSubmit={handleSubmit}
                            isLoading={createFacultyMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
