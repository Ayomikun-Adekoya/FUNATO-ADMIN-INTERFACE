interface PaginationProps {
    currentPage: number;
    totalPages: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    perPage,
    total,
    onPageChange,
    onPerPageChange,
}: PaginationProps) {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    const from = (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, total);

    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:px-6 shadow-sm">
            {/* Mobile view */}
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>

            {/* Desktop view */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing <span className="font-semibold">{from}</span> to{' '}
                        <span className="font-semibold">{to}</span> of{' '}
                        <span className="font-semibold">{total}</span> results
                    </p>
                    {onPerPageChange && (
                        <select
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            className="input py-1.5 text-sm"
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                    )}
                </div>

                {/* Pagination controls */}
                <nav className="isolate inline-flex gap-1" aria-label="Pagination">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 dark:text-gray-300 
                                 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="sr-only">Previous</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {startPage > 1 && (
                        <>
                            <button
                                onClick={() => onPageChange(1)}
                                className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium 
                                         text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                1
                            </button>
                            {startPage > 2 && (
                                <span className="relative inline-flex items-center justify-center w-9 h-9 text-sm font-medium text-gray-500 dark:text-gray-500">
                                    ...
                                </span>
                            )}
                        </>
                    )}

                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === currentPage
                                    ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-md scale-105'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && (
                                <span className="relative inline-flex items-center justify-center w-9 h-9 text-sm font-medium text-gray-500 dark:text-gray-500">
                                    ...
                                </span>
                            )}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium 
                                         text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 dark:text-gray-300 
                                 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="sr-only">Next</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </nav>
            </div>
        </div>
    );
}
