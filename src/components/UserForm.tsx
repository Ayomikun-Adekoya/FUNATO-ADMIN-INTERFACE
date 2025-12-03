import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { User, Role } from '@/types/api';
import type { UpdateUserFormData, CreateUserFormData } from '@/lib/validators';
import { updateUserSchema, createUserSchema } from '@/lib/validators';

interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  isEdit?: boolean;
  availableRoles?: Role[];
}

export default function UserForm({
  user,
  onSubmit,
  isLoading,
  isEdit = false,
  availableRoles = [],
}: UserFormProps) {
  const [isActive, setIsActive] = useState((user as any)?.is_active ?? true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateUserFormData | CreateUserFormData>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: (user as any)?.phone || '',
      roles: user?.roles?.map(r => r.name) || [],
      is_active: (user as any)?.is_active ?? true,
      password: '',
      password_confirmation: '',
    },
  });

  const handleFormSubmit = (data: UpdateUserFormData | CreateUserFormData) => {
    const submitData = { ...data, is_active: isActive };

    // Remove empty password fields in edit mode
    if (isEdit && (!data.password || data.password === '')) {
      delete (submitData as any).password;
      delete (submitData as any).password_confirmation;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Name *
        </label>
        <input
          type="text"
          {...register('name')}
          className="input w-full"
          placeholder="Enter full name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email *
        </label>
        <input
          type="email"
          {...register('email')}
          className="input w-full"
          placeholder="user@example.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Phone
        </label>
        <input
          type="text"
          {...register('phone')}
          className="input w-full"
          placeholder="+234 XXX XXX XXXX"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password {isEdit ? '' : '*'}
          {isEdit && <span className="text-gray-500 text-xs ml-2">(leave blank to keep current)</span>}
        </label>
        <input
          type="password"
          {...register('password')}
          className="input w-full"
          placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter password'}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Confirm Password {isEdit ? '' : '*'}
        </label>
        <input
          type="password"
          {...register('password_confirmation')}
          className="input w-full"
          placeholder={isEdit ? 'Confirm new password if changing' : 'Confirm password'}
        />
        {errors.password_confirmation && (
          <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>
        )}
      </div>

      {/* Roles Multi-select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Role
        </label>
        <select
          {...register('roles.0')}
          className="input w-full"
        >
          <option value="">Select a role</option>
          {availableRoles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
            </option>
          ))}
        </select>
        {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles.message as string}</p>}
      </div>

      {/* Status Toggle */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <label className="flex items-center justify-between">
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Status
            </span>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isActive ? 'User is active and can log in' : 'User is inactive and cannot log in'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsActive(!isActive);
              setValue('is_active', !isActive);
            }}
            className={`${isActive ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            role="switch"
            aria-checked={isActive}
          >
            <span
              className={`${isActive ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
          </button>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
}
