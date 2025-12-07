import { ReactNode } from 'react';
import { AxiosError } from 'axios';
import Link from 'next/link';

interface ErrorFallbackProps {
    error: unknown;
    resetError?: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
    const getErrorDetails = () => {
        if (error instanceof AxiosError) {
            const response = error.response;
            const status = response?.status;
            const errorData = response?.data as Record<string, unknown>;
            const message = typeof errorData?.message === 'string'
                ? errorData.message
                : error.message || 'An unexpected error occurred';

            if (status === 403) {
                return {
                    title: 'Access Denied',
                    message: message,
                    icon: (
                        <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    ),
                    showContactAdmin: true,
                };
            }

            if (status === 404) {
                return {
                    title: 'Not Found',
                    message: message || 'The resource you are looking for could not be found.',
                    icon: (
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    showContactAdmin: false,
                };
            }

            if (status === 500) {
                return {
                    title: 'Server Error',
                    message: 'Something went wrong on our end. Please try again later.',
                    icon: (
                        <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    ),
                    showContactAdmin: false,
                };
            }

            return {
                title: 'Error',
                message: message,
                icon: (
                    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                showContactAdmin: true,
            };
        }

        if (error instanceof Error) {
            return {
                title: 'Error',
                message: error.message,
                icon: (
                    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                showContactAdmin: true,
            };
        }

        return {
            title: 'Unexpected Error',
            message: 'An unexpected error occurred. Please try again.',
            icon: (
                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            showContactAdmin: true,
        };
    };

    const details = getErrorDetails();

    return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    {details.icon}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    {details.title}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {details.message}
                </p>

                {details.showContactAdmin && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        If you believe you should have access to this resource, please contact your system administrator.
                    </p>
                )}

                <div className="flex gap-3 justify-center">
                    {resetError && (
                        <button
                            onClick={resetError}
                            className="btn-secondary"
                        >
                            Try Again
                        </button>
                    )}
                    <Link href="/admin" className="btn-primary">
                        Go to Dashboard
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-6 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            Error Details (Development Only)
                        </summary>
                        <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto max-h-60 text-left">
                            {JSON.stringify(error, null, 2)}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
}

interface QueryErrorWrapperProps {
    children: ReactNode;
    error?: unknown;
    isError?: boolean;
    resetError?: () => void;
}

/**
 * Wrapper component for handling query errors gracefully
 */
export function QueryErrorWrapper({ children, error, isError, resetError }: QueryErrorWrapperProps) {
    if (isError && error) {
        return <ErrorFallback error={error} resetError={resetError} />;
    }

    return <>{children}</>;
}
