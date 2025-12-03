import { ReactNode } from 'react';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    emptyMessage?: string;
}

export default function Table<T extends Record<string, any>>({
    data,
    columns,
    isLoading = false,
    emptyMessage = 'No data available',
}: TableProps<T>) {
    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];

    if (isLoading) {
        return (
            <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="animate-pulse">
                    <div className="h-14 bg-gray-100 dark:bg-gray-900"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (safeData.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="mt-4 text-gray-500 dark:text-gray-400">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key}>{column.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {safeData.map((item, index) => (
                            <tr key={item.id || index}>
                                {columns.map((column) => (
                                    <td key={column.key}>
                                        {column.render ? column.render(item) : item[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
