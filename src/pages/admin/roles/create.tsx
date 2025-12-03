import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleForm from '@/components/RoleForm';
import { useCreateRole } from '@/lib/queries';
import { CreateRoleFormData } from '@/lib/validators';
import { toast } from 'react-toastify';

export default function CreateRolePage() {
    const router = useRouter();
    const createRoleMutation = useCreateRole();

    const handleSubmit = async (data: CreateRoleFormData) => {
        console.log('Submitting role data:', data);
        try {
            await createRoleMutation.mutateAsync(data);
            toast.success('Role created successfully!');
            router.push('/admin/roles');
        } catch (error: any) {
            console.error('Create role error:', error);
            toast.error(error.response?.data?.message || 'Failed to create role. Please try again.');
        }
    };

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
                            <span>Create</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Role</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Add a new role with permissions</p>
                    </div>

                    <div className="card">
                        <RoleForm onSubmit={handleSubmit} isLoading={createRoleMutation.isPending} />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
