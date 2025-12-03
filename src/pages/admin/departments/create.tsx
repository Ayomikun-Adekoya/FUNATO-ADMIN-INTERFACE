import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import DepartmentForm from '@/components/DepartmentForm';
import { useCreateDepartment } from '@/lib/queries';
import { CreateDepartmentFormData } from '@/lib/validators';
import { toast } from 'react-toastify';

export default function CreateDepartmentPage() {
    const router = useRouter();
    const createDepartmentMutation = useCreateDepartment();

    const handleSubmit = async (data: CreateDepartmentFormData) => {
        try {
            await createDepartmentMutation.mutateAsync({
                name: data.name,
                code: data.code,
                faculty_id: data.faculty_id,
                description: data.description,
            } as any);
            toast.success('Department created successfully!');
            router.push('/admin/departments');
        } catch (error) {
            console.error('Create department error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create department';
            toast.error('Failed to create department. Please try again.');
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <Link
                                href="/admin/departments"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Departments
                            </Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Create</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Department</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Add a new department to the system</p>
                    </div>

                    <div className="card">
                        <DepartmentForm
                            onSubmit={handleSubmit}
                            isLoading={createDepartmentMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
