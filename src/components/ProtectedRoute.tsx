import { useRouter } from 'next/router';
import { useEffect, ReactNode } from 'react';
import { useCurrentUser } from '@/lib/queries';
import { getToken } from '@/lib/api';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { data: user, isLoading } = useCurrentUser();

    // Check if we have a token - this is the source of truth for authentication
    // During SSR, avoid rendering a different UI (spinner/redirect) than the client.
    // Render children server-side and let the client handle auth/redirect to prevent hydration mismatches.
    if (typeof window === 'undefined') {
        return <>{children}</>;
    }

    const token = getToken();
    const cachedUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Only redirect if there's absolutely no token
        // Token existence = authenticated, regardless of API call status
        if (!token) {
            router.push('/admin/login');
        }
        // Never redirect if we have a token - trust the token completely
    }, [token, router]);

    // If we have a token, always allow access
    // Don't wait for API call - token is proof of authentication
    if (token) {
        // Show minimal loading only if we have no cached user and API is still loading
        // Otherwise, render immediately with cached data
        if (isLoading && !cachedUser) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                    </div>
                </div>
            );
        }
        
        // Token exists = authenticated - render children immediately
        // API call success/failure is irrelevant for authentication
        return <>{children}</>;
    }

    // No token - show loading briefly while redirect happens
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
            </div>
        </div>
    );
}
