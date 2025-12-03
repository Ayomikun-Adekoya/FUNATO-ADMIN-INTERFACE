import { useState } from 'react';
import { usersApi, rolesApi, authApi, api } from '@/lib/api';
import Layout from '@/components/Layout';
import { toast } from 'react-toastify';

export default function FixPermissionsPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFixPermissions = async () => {
        setLoading(true);
        setMessage('');
        setError('');

        try {
            // Step 1: Get all roles
            console.log('Fetching roles...');
            const rolesResponse = await rolesApi.getAll({});
            const roles = (rolesResponse?.data as any[]) || [];

            console.log('Available roles:', roles);
            console.log('Roles response:', rolesResponse);
            setMessage(`Found ${roles.length} role(s): ${roles.map((r: any) => `${r.name} (ID: ${r.id})`).join(', ')}`);

            if (roles.length === 0) {
                setError('No roles available. Please create a role first.');
                setLoading(false);
                return;
            }

            // Find admin role or use the first one
            const adminRole = roles.find((r: any) => r.name?.toLowerCase().includes('admin')) || roles[0];
            console.log('Selected role:', adminRole);

            if (!adminRole?.id) {
                setError('Role has no ID');
                setLoading(false);
                return;
            }

            // Step 2: Get current user directly from Funato API
            console.log('Getting current user...');
            const currentUser = await authApi.me();
            console.log('Current user:', currentUser);

            if (!currentUser?.id) {
                setError('Could not determine current user ID');
                setLoading(false);
                return;
            }

            // Step 3: Assign role to current user - try different approaches
            console.log(`Assigning role "${adminRole.name}" (ID: ${adminRole.id}) to user ${currentUser.id}...`);

            // The 403 error suggests we need to send the role_id differently
            // Try multiple payload formats
            const payloads = [
                { role_id: adminRole.id },
                { role_id: String(adminRole.id) },
                { roles: [adminRole.id] },
                { roles: [String(adminRole.id)] },
                { roleId: adminRole.id },
                { role_ids: [adminRole.id] },
            ];

            let assigned = false;
            for (let i = 0; i < payloads.length; i++) {
                try {
                    console.log(`Attempt ${i + 1}:`, payloads[i]);
                    setMessage(`Trying format ${i + 1}...`);

                    const payload = payloads[i];
                    const { data } = await api.post<any>(`/admin/users/${currentUser.id}/assign-role`, payload);

                    console.log('Success! Assign role result:', data);
                    setMessage(`✓ Successfully assigned "${adminRole.name}" role to ${currentUser.email}. Try accessing Users page now.`);
                    assigned = true;
                    break;
                } catch (err: any) {
                    console.log(`Attempt ${i + 1} failed:`, err?.response?.status, err?.response?.data?.message);
                    // Continue to next attempt
                }
            }

            if (!assigned) {
                throw new Error('Could not assign role with any payload format. Your user may not have permission to assign roles.');
            }
        } catch (err: any) {
            console.error('Full error object:', err);
            console.error('Error response:', err?.response?.data);
            setError(`Error: ${err?.response?.data?.message || err?.message || err?.toString() || 'Unknown error'}`);
            toast.error('Failed to fix permissions. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Fix Admin Permissions</h1>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-yellow-800">
                            Your admin account doesn't have any roles assigned. Click the button below to automatically assign the appropriate role.
                        </p>
                    </div>

                    <button
                        onClick={handleFixPermissions}
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg font-medium text-white ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? 'Assigning...' : 'Assign Admin Role'}
                    </button>

                    {message && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800">{message}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
