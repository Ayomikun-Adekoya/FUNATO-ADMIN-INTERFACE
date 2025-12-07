import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleForm from '@/components/RoleForm';
import { useRole, useUpdateRole } from '@/lib/queries';
import { UpdateRoleFormData } from '@/lib/validators';
import { toast } from 'react-toastify';

export default function EditRolePage() {
    const router = useRouter();
    const { id } = router.query;
    const roleId = typeof id === 'string' ? parseInt(id, 10) : 0;

    const { data: role, isLoading } = useRole(roleId);
    const updateRoleMutation = useUpdateRole();

    const handleSubmit = async (data: UpdateRoleFormData) => {
        console.log('EditRolePage: handleSubmit called with data:', data);
        console.log('EditRolePage: roleId:', roleId);
        try {
            console.log('EditRolePage: Calling updateRoleMutation.mutateAsync');
            const result = await updateRoleMutation.mutateAsync({ id: roleId, data });
            console.log('EditRolePage: Update successful, result:', result);
            toast.success('Role updated successfully!');
            router.push('/admin/roles');
        } catch (error: any) {
            console.error('Update role error:', error);
            console.error('Error response:', error.response);
            toast.error(error.response?.data?.message || 'Failed to update role. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="spinner h-12 w-12"></div>
                    </div>
                </Layout>
            </ProtectedRoute>
        );
    }

    if (!role) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="max-w-3xl mx-auto">
                        <div className="card text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="mt-4 text-gray-500 dark:text-gray-400">Role not found</p>
                            <Link href="/admin/roles" className="mt-4 inline-block btn-secondary">
                                Back to Roles
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
                            <Link href="/admin/roles" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                Roles
                            </Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Edit</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Role</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Update role information and permissions</p>
                    </div>

                    <div className="card">
                        <RoleForm
                            role={role}
                            onSubmit={handleSubmit}
                            isLoading={updateRoleMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
