import { format, parseISO, formatDistanceToNow } from 'date-fns';

/**
 * Format date string to readable format
 */
export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatStr);
    } catch (error) {
        return 'Invalid date';
    }
};

/**
 * Format date with time
 */
export const formatDateTime = (date: string | Date): string => {
    return formatDate(date, 'MMM dd, yyyy HH:mm');
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
        return 'Invalid date';
    }
};

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export const formatInputDate = (date: string | Date): string => {
    return formatDate(date, 'yyyy-MM-dd');
};

/**
 * Check if date is valid
 */
export const isValidDate = (date: any): boolean => {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return dateObj instanceof Date && !isNaN(dateObj.getTime());
    } catch {
        return false;
    }
};
