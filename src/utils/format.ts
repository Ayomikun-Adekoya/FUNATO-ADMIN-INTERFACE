/**
 * Format file size to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format name (capitalize first letter of each word)
 */
export const formatName = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format based on length
    if (cleaned.length === 11) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }

    return phone;
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string | undefined | null, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

/**
 * Format status badge color
 */
export const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        reviewing: 'bg-blue-100 text-blue-800',
        accepted: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        suspended: 'bg-red-100 text-red-800',
    };

    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Convert object to query string
 */
export const objectToQueryString = (obj: Record<string, any>): string => {
    const params = new URLSearchParams();

    Object.entries(obj).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
        }
    });

    return params.toString();
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
    return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
};

/**
 * Check if file is PDF
 */
export const isPDF = (filename: string): boolean => {
    return getFileExtension(filename) === 'pdf';
};

/**
 * Check if file is image
 */
export const isImage = (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(getFileExtension(filename));
};

/**
 * Format currency (Nigerian Naira)
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
