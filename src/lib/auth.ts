import { authApi, getToken, removeToken } from './api';
import type { LoginRequest, AuthUser } from '@/types/api';
import { toast } from 'react-toastify';

// TODO: In production, implement secure token storage using HttpOnly cookies
// TODO: Consider using NextAuth.js or similar for production-grade authentication
// Current implementation uses localStorage which is vulnerable to XSS attacks

export const auth = {
    /**
     * Login user and store token
     */
    login: async (credentials: LoginRequest): Promise<{ user: AuthUser; token: string }> => {
        const response = await authApi.login(credentials);

        // Response already contains admin user and token
        const user = response.admin;
        const token = response.token;

        return {
            user,
            token,
        };
    },

    /**
     * Logout user and clear token
     */
    logout: async (): Promise<void> => {
        // Remove from localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/admin/login';
        }
    },

    /**
     * Logout from all devices
     */
    logoutAll: async (): Promise<void> => {
        try {
            await authApi.logoutAll();
            toast.success('Logout successful!');
        } catch (error) {
            console.error('Logout all error:', error);
            toast.error('Logout failed. Please try again.');
        } finally {
            removeToken();
            // Redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/admin/login';
            }
        }
    },

    /**
     * Get current authenticated user
     */
    getCurrentUser: async (): Promise<AuthUser | null> => {
        try {
            const token = getToken();
            if (!token) {
                return null;
            }
            return await authApi.me();
        } catch (error) {
            removeToken();
            return null;
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return getToken() !== null;
    },

    /**
     * Check if user has specific role
     */
    hasRole: (user: AuthUser | null, roleName: string): boolean => {
        if (!user || !user.roles) {
            return false;
        }
        return user.roles.some((role) => role.name.toLowerCase() === roleName.toLowerCase());
    },

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole: (user: AuthUser | null, roleNames: string[]): boolean => {
        if (!user || !user.roles) {
            return false;
        }
        return user.roles.some((role) =>
            roleNames.some((name) => role.name.toLowerCase() === name.toLowerCase())
        );
    },

    /**
     * Check if user has specific permission
     */
    hasPermission: (user: AuthUser | null, permissionName: string): boolean => {
        if (!user || !user.roles) {
            return false;
        }
        return user.roles.some((role) =>
            role.permissions?.some((permission) =>
                permission.name.toLowerCase() === permissionName.toLowerCase()
            )
        );
    },
};
