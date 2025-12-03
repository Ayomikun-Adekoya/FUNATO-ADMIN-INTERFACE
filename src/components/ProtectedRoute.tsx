import { useRouter } from 'next/router';
import { useEffect, ReactNode } from 'react';
import { useCurrentUser } from '@/lib/queries';
import { getToken } from '@/lib/api';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { data: user, isLoading, isError, error } = useCurrentUser();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if user is authenticated
        const token = getToken();
        
        // Redirect to login if no token or error fetching user
        if (!isLoading && (!token || isError)) {
            router.push('/admin/login');
        }
    }, [isLoading, isError, router]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Error state - show error message
    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full">
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 border border-red-200 dark:border-red-800">
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                            Authentication Error
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                            {error?.message || 'Failed to verify your session. Please log in again.'}
                        </p>
                        <button
                            onClick={() => router.push('/admin/login')}
                            className="w-full btn-primary"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return null;
    }

    return <>{children}</>;
}
