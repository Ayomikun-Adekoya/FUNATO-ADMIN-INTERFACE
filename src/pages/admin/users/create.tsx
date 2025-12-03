import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserForm from '@/components/UserForm';
import { useCreateUser, useRoles } from '@/lib/queries';
import { CreateUserFormData } from '@/lib/validators';
import { toast } from 'react-toastify';

export default function CreateUserPage() {
  const router = useRouter();
  const createUserMutation = useCreateUser();
  const { data: rolesData } = useRoles();

  const handleSubmit = async (data: CreateUserFormData) => {
    try {
      await createUserMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        roles: data.roles || [],
      });
      toast.success('User created successfully!');
      router.push('/admin/users');
    } catch (error) {
      console.error('Create user error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      toast.error('Failed to create user. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className=" mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <Link
                href="/admin/users"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Users
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Create</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create User</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Add a new user to the system</p>
          </div>

          <div className="card">
            <UserForm
              onSubmit={handleSubmit}
              isLoading={createUserMutation.isPending}
              isEdit={false}
              availableRoles={rolesData?.data || []}
            />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
