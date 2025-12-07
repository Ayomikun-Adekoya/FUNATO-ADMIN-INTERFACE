import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import FacultyForm from '@/components/FacultyForm';
import { useFaculty, useUpdateFaculty } from '@/lib/queries';
import { UpdateFacultyFormData } from '@/lib/validators';
import { toast } from 'react-toastify';

export default function EditFacultyPage() {
    const router = useRouter();
    const { id } = router.query;
    const facultyId = parseInt(id as string);

    const { data: faculty, isLoading } = useFaculty(facultyId);
    const updateFacultyMutation = useUpdateFaculty();

    const handleSubmit = async (data: UpdateFacultyFormData) => {
        try {
            const payload: Record<string, unknown> = {};
            if (data.name) payload.name = data.name;
            if (data.code) payload.code = data.code;
            if (data.description) payload.description = data.description;
            if (data.is_active !== undefined) payload.is_active = data.is_active;

            await updateFacultyMutation.mutateAsync({
                id: facultyId,
                data: payload,
            });
            toast.success('Faculty updated successfully!');
            router.push('/admin/faculties');
        } catch (error) {
            console.error('Update faculty error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update faculty';
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

    if (!faculty) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Faculty Not Found</h1>
                            <Link href="/admin/faculties" className="link mt-4 inline-block">
                                Back to Faculties
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
                                href="/admin/faculties"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Faculties
                            </Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Edit</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Faculty</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Update faculty details</p>
                    </div>

                    <div className="card">
                        <FacultyForm
                            faculty={faculty}
                            onSubmit={handleSubmit}
                            isLoading={updateFacultyMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
