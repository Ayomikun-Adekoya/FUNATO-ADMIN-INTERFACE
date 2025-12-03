import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import DepartmentForm from '@/components/DepartmentForm';
import { useDepartment, useUpdateDepartment } from '@/lib/queries';
import { UpdateDepartmentFormData } from '@/lib/validators';
import { toast } from 'react-toastify';

export default function EditDepartmentPage() {
    const router = useRouter();
    const { id } = router.query;
    const departmentId = parseInt(id as string);

    const { data: department, isLoading } = useDepartment(departmentId);
    const updateDepartmentMutation = useUpdateDepartment();

    const handleSubmit = async (data: UpdateDepartmentFormData) => {
        try {
            const payload: Partial<UpdateDepartmentFormData> = {};

            if (data.name && data.name !== department?.name) {
                payload.name = data.name;
            }

            if (data.code && data.code !== department?.code) {
                payload.code = data.code;
            }

            if (data.faculty_id) {
                payload.faculty_id = data.faculty_id;
            }

            if (data.description) {
                payload.description = data.description;
            }

            if (data.is_active !== undefined) {
                payload.is_active = data.is_active;
            }

            await updateDepartmentMutation.mutateAsync({
                id: departmentId,
                data: payload,
            });

            toast.success('Department updated successfully!');
            router.push('/admin/departments');
        } catch (error) {
            console.error('Update department error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update department';
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

    if (!department) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Department Not Found</h1>
                            <Link href="/admin/departments" className="link mt-4 inline-block">
                                Back to Departments
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
                                href="/admin/departments"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Departments
                            </Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Edit</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Department</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Update department details</p>
                    </div>

                    <div className="card">
                        <DepartmentForm
                            department={department}
                            onSubmit={handleSubmit}
                            isLoading={updateDepartmentMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
