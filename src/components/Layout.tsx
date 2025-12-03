import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/lib/queries';
import { authApi } from '@/lib/api';
import PermissionError from './PermissionError';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const router = useRouter();
    const { data: user, isLoading } = useCurrentUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const queryClient = useQueryClient();

    // Initialize theme from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = saved === 'dark' || (!saved && prefersDark);

        setIsDarkMode(shouldBeDark);
        document.documentElement.classList.toggle('dark', shouldBeDark);
    }, []);

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newTheme);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            // Notify backend and remove token
            await authApi.logout();

            // Clear react-query cache so protected data doesn't flicker back
            try {
                queryClient.clear();
            } catch {
                // ignore if queryClient isn't available for some reason
            }

            // Redirect to login page
            if (typeof window !== 'undefined') {
                window.location.href = '/admin/login';
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Ensure token is removed and user is redirected even if API call fails
            try {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            } catch {
                // ignore
            }
            if (typeof window !== 'undefined') {
                window.location.href = '/admin/login';
            }
        } finally {
            setIsLoggingOut(false);
        }
    };

    const navigation = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Users',
            href: '/admin/users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            name: 'Roles',
            href: '/admin/roles',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        },
    ];

    const applicationsManagement = [
        {
            name: 'Recruitment',
            href: '/admin/applications',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            name: 'Screenings',
            href: '/admin/screenings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            )
        },
        {
            name: 'Admissions',
            href: '/admin/admissions',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
    ];

    const admissionNavigation = [
        {
            name: 'Faculties',
            href: '/admin/faculties',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            name: 'Departments',
            href: '/admin/departments',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            )
        },
        {
            name: 'Programs',
            href: '/admin/programs',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            name: 'Mode of Entries',
            href: '/admin/mode-of-entries',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
            )
        },
    ];

    const isActive = (path: string) => {
        if (path === '/admin') {
            return router.pathname === path;
        }
        return router.pathname.startsWith(path);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="spinner h-12 w-12"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
                           shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">RA</span>
                            </div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                                Recruitment
                            </h1>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden btn-icon"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={isActive(item.href) ? 'sidebar-link-active' : 'sidebar-link'}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}

                        {/* Applications Management Section */}
                        <div className="pt-6 pb-2">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Applications Management
                            </h3>
                        </div>

                        {applicationsManagement.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={isActive(item.href) ? 'sidebar-link-active' : 'sidebar-link'}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}

                        {/* Admission Management Section */}
                        <div className="pt-6 pb-2">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Admission Management
                            </h3>
                        </div>

                        {admissionNavigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={isActive(item.href) ? 'sidebar-link-active' : 'sidebar-link'}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User section */}
                    {user && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900">
                                    <span className="text-sm font-semibold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 dark:text-red-400 
                                         bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 
                                         transition-all duration-200 active:scale-95 ${isLoggingOut ? 'opacity-60 pointer-events-none' : ''}`}
                            >
                                {isLoggingOut ? (
                                    <>
                                        <svg className="spinner h-4 w-4" viewBox="0 0 24 24"></svg>
                                        <span>Logging out...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
                {/* Top bar */}
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between h-16 px-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="btn-icon lg:hidden"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-4 ml-auto">
                            {/* User roles */}
                            {user?.roles && user.roles.length > 0 && (
                                <div className="hidden sm:flex items-center gap-2">
                                    {user.roles.map((role) => (
                                        <span key={role.id} className="badge-primary">
                                            {role.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Theme toggle */}
                            <button
                                onClick={toggleTheme}
                                className="btn-icon"
                                aria-label="Toggle theme"
                            >
                                {isDarkMode ? (
                                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6 animate-fade-in">
                    <PermissionError />
                    {children}
                </main>
            </div>

            {/* Sidebar overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
