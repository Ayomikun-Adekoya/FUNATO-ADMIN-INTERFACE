import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleSchema, updateRoleSchema, CreateRoleFormData, UpdateRoleFormData } from '@/lib/validators';
import { usePermissions } from '@/lib/queries';
import type { Role } from '@/types/api';

interface RoleFormProps {
    role?: Role;
    onSubmit: (data: CreateRoleFormData | UpdateRoleFormData) => void;
    isLoading?: boolean;
}

export default function RoleForm({ role, onSubmit, isLoading = false }: RoleFormProps) {
    const { data: permissions, isLoading: permissionsLoading } = usePermissions();
    const isEditing = !!role;

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<CreateRoleFormData | UpdateRoleFormData>({
        resolver: zodResolver(isEditing ? updateRoleSchema : createRoleSchema),
        defaultValues: role
            ? {
                name: role.name,
                description: role.description,
                permissions: role.permissions?.map((p) => p.id),
            }
            : {
                name: '',
                description: '',
                permissions: [],
            },
    });

    const selectedPermissionIds = watch('permissions') || [];

    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        const current = selectedPermissionIds;
        if (checked) {
            setValue('permissions', [...current, permissionId]);
        } else {
            setValue('permissions', current.filter((id) => id !== permissionId));
        }
    };

    const handleFormSubmit = (data: CreateRoleFormData | UpdateRoleFormData) => {
        console.log('RoleForm: Submitting data:', data);
        console.log('RoleForm: Is editing?', isEditing);
        console.log('RoleForm: Selected permissions:', selectedPermissionIds);
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Name */}
            <div>
                <label htmlFor="name" className="label">
                    Role Name <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('name')}
                    id="name"
                    type="text"
                    placeholder="e.g., Admin, Manager, User"
                    className="input"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="label">
                    Description
                </label>
                <textarea
                    {...register('description')}
                    id="description"
                    rows={3}
                    placeholder="Brief description of this role"
                    className="input"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
            </div>

            {/* Permissions */}
            <div>
                <label className="label mb-3">
                    Permissions
                    {selectedPermissionIds.length > 0 && (
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                            ({selectedPermissionIds.length} selected)
                        </span>
                    )}
                </label>

                {permissionsLoading ? (
                    <div className="text-center py-8">
                        <div className="spinner h-8 w-8 mx-auto"></div>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3
                                  bg-gray-50 dark:bg-gray-900/30">
                        {permissions && permissions.length > 0 ? (
                            permissions.map((permission) => (
                                <label
                                    key={permission.id}
                                    htmlFor={`permission-${permission.id}`}
                                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 
                                             transition-colors cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        id={`permission-${permission.id}`}
                                        checked={selectedPermissionIds.includes(permission.id)}
                                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                        className="mt-0.5 h-4 w-4 text-primary-600 dark:text-primary-500 focus:ring-2 focus:ring-primary-500 
                                                 border-gray-300 dark:border-gray-600 rounded transition-colors"
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-900 dark:text-gray-100 block">{permission.name}</span>
                                        {permission.description && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400 block mt-0.5">
                                                {permission.description}
                                            </span>
                                        )}
                                    </div>
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No permissions available</p>
                        )}
                    </div>
                )}
                {errors.permissions && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.permissions.message}</p>}
            </div>

            {/* Submit button */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="spinner h-4 w-4" viewBox="0 0 24 24"></svg>
                            Saving...
                        </span>
                    ) : (
                        <span>{isEditing ? 'Update Role' : 'Create Role'}</span>
                    )}
                </button>
            </div>
        </form>
    );
}
