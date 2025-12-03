import {
    useCurrentUser,
    useUsers,
    useRoles,
    useApplications,
    useScreenings,
    useAdmissions,
    useAdmissionApplications,
    useFaculties,
    useDepartments,
    usePrograms,
    useModeOfEntries,
} from '@/lib/queries';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { formatDate } from '@/utils/date';

export default function AdminDashboard() {
    const { data: user } = useCurrentUser();

    const quickLinks = [
        {
            name: 'Users',
            description: 'Manage user accounts and permissions',
            href: '/admin/users',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'from-blue-500 to-blue-600',
        },
        {
            name: 'Roles',
            description: 'Manage roles and permissions',
            href: '/admin/roles',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            color: 'from-purple-500 to-purple-600',
        },
        {
            name: 'Recruitments',
            description: 'View and manage recruitment applications',
            href: '/admin/applications',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'from-green-500 to-green-600',
        },
        {
            name: 'Admissions',
            description: 'Manage admission records and statuses',
            href: '/admin/admissions',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            color: 'from-indigo-500 to-indigo-600',
        },
        {
            name: 'Screenings',
            description: 'Schedule and manage student screenings',
            href: '/admin/screenings',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            color: 'from-cyan-500 to-cyan-600',
        },
        {
            name: 'Faculties',
            description: 'Manage faculties and academic units',
            href: '/admin/faculties',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            color: 'from-pink-500 to-pink-600',
        },
        {
            name: 'Departments',
            description: 'Organize and manage departments',
            href: '/admin/departments',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
            color: 'from-orange-500 to-orange-600',
        },
        {
            name: 'Programs',
            description: 'Manage academic programs and courses',
            href: '/admin/programs',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            color: 'from-teal-500 to-teal-600',
        },
        {
            name: 'Mode of Entries',
            description: 'Configure admission entry modes',
            href: '/admin/mode-of-entries',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
            ),
            color: 'from-red-500 to-red-600',
        },
    ];

    // Fetch real counts from APIs
    const usersQuery = useUsers();
    const rolesQuery = useRoles();
    const applicationsQuery = useApplications();
    const screeningsQuery = useScreenings();
    const admissionsQuery = useAdmissions();
    const admissionApplicationsQuery = useAdmissionApplications();
    const facultiesQuery = useFaculties();
    const departmentsQuery = useDepartments();
    const programsQuery = usePrograms();
    const modeOfEntriesQuery = useModeOfEntries();

    // Extract total counts - handle multiple response structures
    const extractTotal = (data: any): number => {
        if (!data) return 0;
        // Try different common pagination structures
        return data.meta?.total ?? data.total ?? data.pagination?.total ?? data.data?.length ?? 0;
    };

    const totalUsers = extractTotal(usersQuery.data);
    const totalRoles = extractTotal(rolesQuery.data);
    const totalApplications = extractTotal(applicationsQuery.data);
    const totalScreenings = extractTotal(screeningsQuery.data);
    const totalAdmissions = extractTotal(admissionsQuery.data);
    const totalAdmissionApplications = extractTotal(admissionApplicationsQuery.data);
    const totalFaculties = extractTotal(facultiesQuery.data);
    const totalDepartments = extractTotal(departmentsQuery.data);
    const totalPrograms = extractTotal(programsQuery.data);
    const totalModeOfEntries = extractTotal(modeOfEntriesQuery.data);

    // Calculate applications this month
    const getApplicationsThisMonth = (): number => {
        if (!applicationsQuery.data) return 0;

        // Handle both array and paginated response formats
        let apps: any[] = [];
        if (Array.isArray(applicationsQuery.data)) {
            apps = applicationsQuery.data;
        } else if (applicationsQuery.data.data && Array.isArray(applicationsQuery.data.data)) {
            apps = applicationsQuery.data.data;
        }

        if (!Array.isArray(apps)) return 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return apps.filter((app: any) => {
            try {
                const appDate = new Date(app.created_at);
                return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
            } catch {
                return false;
            }
        }).length;
    };

    // Calculate pending screenings
    const getPendingScreenings = (): number => {
        if (!screeningsQuery.data) return 0;

        let screenings: any[] = [];
        if (Array.isArray(screeningsQuery.data)) {
            screenings = screeningsQuery.data;
        } else if (screeningsQuery.data.data && Array.isArray(screeningsQuery.data.data)) {
            screenings = screeningsQuery.data.data;
        }

        if (!Array.isArray(screenings)) return 0;

        return screenings.filter((s: any) => s.status === 'pending' || s.status === 'in_progress').length;
    };

    const applicationsThisMonth = getApplicationsThisMonth();
    const pendingScreenings = getPendingScreenings();

    // Debug: log responses in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log('Dashboard API responses:', {
            users: { data: usersQuery.data, total: totalUsers },
            roles: { data: rolesQuery.data, total: totalRoles },
            applications: { data: applicationsQuery.data, total: totalApplications, thisMonth: applicationsThisMonth },
            screenings: { data: screeningsQuery.data, total: totalScreenings, pending: pendingScreenings },
            admissions: { data: admissionsQuery.data, total: totalAdmissions },
            admissionApplications: { data: admissionApplicationsQuery.data, total: totalAdmissionApplications },
            faculties: { data: facultiesQuery.data, total: totalFaculties },
            departments: { data: departmentsQuery.data, total: totalDepartments },
            programs: { data: programsQuery.data, total: totalPrograms },
            modeOfEntries: { data: modeOfEntriesQuery.data, total: totalModeOfEntries },
        });
    }

    const stats = [
        {
            name: 'Total Users',
            value: usersQuery.isLoading ? '...' : String(totalUsers),
            change: '',
            trend: 'up' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'text-blue-600 dark:text-blue-400',
        },
        {
            name: 'Active Roles',
            value: rolesQuery.isLoading ? '...' : String(totalRoles),
            change: '',
            trend: 'up' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            color: 'text-purple-600 dark:text-purple-400',
        },
        {
            name: 'Recruitments',
            value: applicationsQuery.isLoading ? '...' : String(totalApplications),
            change: `${applicationsThisMonth} this month`,
            trend: 'up' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'text-green-600 dark:text-green-400',
        },
        {
            name: 'Screenings',
            value: screeningsQuery.isLoading ? '...' : String(totalScreenings),
            change: `${pendingScreenings} pending`,
            trend: 'up' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            color: 'text-cyan-600 dark:text-cyan-400',
        },
        {
            name: 'Admissions',
            value: admissionsQuery.isLoading ? '...' : String(totalAdmissions),
            change: '',
            trend: 'up' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            color: 'text-indigo-600 dark:text-indigo-400',
        },
        {
            name: 'Admission Apps',
            value: admissionApplicationsQuery.isLoading ? '...' : String(totalAdmissionApplications),
            change: '',
            trend: 'up' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'text-violet-600 dark:text-violet-400',
        },
        {
            name: 'Faculties',
            value: facultiesQuery.isLoading ? '...' : String(totalFaculties),
            change: '',
            trend: 'up' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            color: 'text-pink-600 dark:text-pink-400',
        },
        {
            name: 'Departments',
            value: departmentsQuery.isLoading ? '...' : String(totalDepartments),
            change: '',
            trend: 'up' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
            color: 'text-orange-600 dark:text-orange-400',
        },
        {
            name: 'Programs',
            value: programsQuery.isLoading ? '...' : String(totalPrograms),
            change: '',
            trend: 'up' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            color: 'text-teal-600 dark:text-teal-400',
        },
        {
            name: 'Entry Modes',
            value: modeOfEntriesQuery.isLoading ? '...' : String(totalModeOfEntries),
            change: '',
            trend: 'up' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
            ),
            color: 'text-red-600 dark:text-red-400',
        },
    ];

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-8">
                    {/* Welcome section */}
                    <div className="card-hover border-l-4 border-l-blue-500 dark:border-l-blue-400">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Welcome back, {user?.name}!
                                </h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    {user?.email}
                                </p>
                                {user?.roles && user.roles.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {user.roles.map((role) => (
                                            <span key={role.id} className="badge-primary">
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                    <span className="text-2xl font-bold text-white">{user?.name.charAt(0).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Overview</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                            {stats.map((stat) => (
                                <div key={stat.name} className="card-hover">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center`}>
                                            <div className={stat.color}>
                                                {stat.icon}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                                        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                                        {stat.change && (
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Access</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="card-hover group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} 
                                                      flex items-center justify-center text-white shadow-lg 
                                                      group-hover:scale-110 transition-transform duration-200`}>
                                            {link.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {link.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{link.description}</p>
                                        </div>
                                        <svg className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* System Information removed intentionally (sensitive) */}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
