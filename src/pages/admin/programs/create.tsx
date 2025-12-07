import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProgramForm from '@/components/ProgramForm';
import { useCreateProgram } from '@/lib/queries';
import { CreateProgramFormData, UpdateProgramFormData } from '@/lib/validators';
import { toast } from 'react-toastify';

export default function CreateProgramPage() {
    const router = useRouter();
    const createProgramMutation = useCreateProgram();

    const handleSubmit = async (data: CreateProgramFormData | UpdateProgramFormData) => {
        try {
            await createProgramMutation.mutateAsync({
                name: data.name!,
                code: data.code!,
                department_id: data.department_id!,
                description: data.description,
                duration: data.duration!,
                degree_type: data.degree_type!,
                is_active: data.is_active,
            });
            toast.success('Program created successfully!');
            router.push('/admin/programs');
        } catch (error) {
            console.error('Create program error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create program';
            toast.error('Failed to create program. Please try again.');
        }
    };

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
                            <span>Create</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Program</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Add a new academic program to the system</p>
                    </div>

                    <div className="card">
                        <ProgramForm
                            onSubmit={handleSubmit}
                            isLoading={createProgramMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
