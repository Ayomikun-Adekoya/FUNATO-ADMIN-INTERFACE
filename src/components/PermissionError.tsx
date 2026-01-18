import { useState, useEffect } from 'react';

export default function PermissionError() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        // Only access sessionStorage in the browser
        if (typeof window !== 'undefined') {
            const storedError = sessionStorage.getItem('permission_error');
            if (storedError) {
                // Clear it after reading
                sessionStorage.removeItem('permission_error');
                setErrorMessage(storedError);
            }
        }
    }, []);

    if (!errorMessage) {
        return null;
    }

    return (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                        Permission Denied
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                        {errorMessage}
                    </p>
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        If you believe you should have access to this resource, please contact your administrator.
                    </p>
                </div>
                <button
                    onClick={() => setErrorMessage(null)}
                    className="ml-auto flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
