import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProgramForm from '@/components/ProgramForm';
import { useProgram, useUpdateProgram } from '@/lib/queries';
import { UpdateProgramFormData } from '@/lib/validators';
import { toast } from 'react-toastify';

export default function EditProgramPage() {
    const router = useRouter();
    const { id } = router.query;
    const programId = parseInt(id as string);

    const { data: program, isLoading } = useProgram(programId);
    const updateProgramMutation = useUpdateProgram();

    const handleSubmit = async (data: UpdateProgramFormData) => {
        try {
            const payload: Partial<UpdateProgramFormData> = {};

            if (data.name && data.name !== program?.name) {
                payload.name = data.name;
            }

            if (data.code && data.code !== program?.code) {
                payload.code = data.code;
            }

            if (data.department_id) {
                payload.department_id = data.department_id;
            }

            if (data.description) {
                payload.description = data.description;
            }

            if (data.duration) {
                payload.duration = data.duration;
            }

            if (data.degree_type) {
                payload.degree_type = data.degree_type;
            }

            if (data.is_active !== undefined) {
                payload.is_active = data.is_active;
            }

            await updateProgramMutation.mutateAsync({
                id: programId,
                data: payload,
            });

            toast.success('Program updated successfully!');
            router.push('/admin/programs');
        } catch (error) {
            console.error('Update program error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update program';
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

    if (!program) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Program Not Found</h1>
                            <Link href="/admin/programs" className="link mt-4 inline-block">
                                Back to Programs
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
                                href="/admin/programs"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Programs
                            </Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Edit</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Program</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Update program details</p>
                    </div>

                    <div className="card">
                        <ProgramForm
                            program={program}
                            onSubmit={handleSubmit}
                            isLoading={updateProgramMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
