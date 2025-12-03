import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full mx-4">
                        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 border border-red-200 dark:border-red-800">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                                        Something went wrong
                                    </h3>
                                    <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                                        {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
                                    </p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full btn-primary"
                                    >
                                        Refresh Page
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
