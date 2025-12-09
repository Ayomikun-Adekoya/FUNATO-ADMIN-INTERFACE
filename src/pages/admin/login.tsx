import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validators';
import { authApi } from '@/lib/api';
import { toast } from 'react-toastify';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setIsLoading(true);
            setError(null);

            // Use authApi.login from api.ts (handles token storage automatically)
            const loginResponse = await authApi.login(data);

            // Fetch and store user data
            const user = await authApi.me();
            localStorage.setItem('auth_user', JSON.stringify(user));

            // Show success toast notification
            toast.success('Login successful!');

            // Redirect to admin dashboard
            router.push('/admin');
        } catch (err) {
            // Only log error details in development mode, never log sensitive data
            if (process.env.NODE_ENV === 'development') {
                console.error('Login error:', err);
                if (err && typeof err === 'object' && 'response' in err) {
                    const axiosError = err as any;
                    console.error('Response status:', axiosError.response?.status);
                    // Never log response data as it might contain sensitive information
                }
            }

            // Display specific error message from API
            let errorMessage = 'Invalid email or password. Please try again.';

            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string; error?: string; errors?: any } }; message?: string };
                errorMessage = axiosError.response?.data?.message
                    || axiosError.response?.data?.error
                    || JSON.stringify(axiosError.response?.data?.errors)
                    || axiosError.message
                    || errorMessage;
            }

            setError(errorMessage);
            toast.error('Login failed. Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 
                      dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 animate-fade-in">
                {/* Logo and title */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 
                                  flex items-center justify-center shadow-lg mb-6">
                        <span className="text-white font-bold text-2xl">RA</span>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 
                                 bg-clip-text text-transparent">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sign in to access the admin dashboard
                    </p>
                </div>

                <div className="card shadow-xl">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 animate-slide-in">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="label">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        {...register('email')}
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                                        placeholder="admin@example.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="error-text">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="label">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="error-text">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="spinner h-5 w-5" viewBox="0 0 24 24"></svg>
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign in</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-gray-500 dark:text-gray-500">
                    Recruitment Admin Dashboard © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
