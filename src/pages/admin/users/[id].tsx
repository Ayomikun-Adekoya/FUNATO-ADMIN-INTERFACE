import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserForm from '@/components/UserForm';
import { useUser, useUpdateUser, useRoles } from '@/lib/queries';
import { UpdateUserFormData } from '@/lib/validators';
import type { User } from '@/types/api';
import { toast } from 'react-toastify';

// Extended User type with additional fields
interface ExtendedUser extends Omit<User, 'is_active'> {
  phone?: string;
  is_active?: boolean;
}

export default function EditUserPage() {
  const router = useRouter();
  const { id } = router.query;
  const userId = typeof id === 'string' ? parseInt(id, 10) : 0;

  const { data: user, isLoading } = useUser(userId);
  const { data: rolesData } = useRoles();
  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (data: UpdateUserFormData) => {
    try {
      const payload: Partial<UpdateUserFormData> = {};

      // Get current user data with proper typing
      const currentUser = user as ExtendedUser;

      // Only include fields that have changed and are not empty
      if (data.name && data.name.trim() !== '' && data.name !== user?.name) {
        payload.name = data.name;
      }
      if (data.email && data.email.trim() !== '' && data.email !== user?.email) {
        payload.email = data.email;
      }
      if (data.phone !== currentUser?.phone) {
        payload.phone = data.phone;
      }
      if (data.is_active !== currentUser?.is_active) {
        payload.is_active = data.is_active;
      }

      // Only include password if provided
      if (data.password && data.password.trim() !== '') {
        payload.password = data.password;
      }

      // Only make the request if there are changes
      if (Object.keys(payload).length === 0) {
        toast.info('No changes detected.');
        return;
      }

      await updateUserMutation.mutateAsync({
        id: userId,
        data: payload,
      });

      toast.success('User updated successfully!');
      router.push('/admin/users');
    } catch (error) {
      console.error('Update user error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      toast.error(errorMessage);
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

  if (!user) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-3xl mx-auto">
            <div className="card text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">User not found</p>
              <Link href="/admin/users" className="mt-4 inline-block btn-secondary">
                Back to Users
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
        <div className="mx-auto">
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
              <span>Edit</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit User</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Update user information and permissions</p>
          </div>

          <div className="card">
            <UserForm
              user={user}
              onSubmit={handleSubmit}
              isLoading={updateUserMutation.isPending}
              isEdit={true}
              availableRoles={rolesData?.data || []}
            />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
