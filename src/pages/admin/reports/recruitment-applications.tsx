import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import { useApplications } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import { ChevronDown, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { applicationsApi } from '@/lib/api';
import type { Application, ApplicationQueryParams } from '@/types/api';

// Export Dropdown Component
function ExportDropdown({ canExport, onExportCSV, onExportExcel, onExportPDF }: {
    canExport: boolean;
    onExportCSV: () => Promise<void>;
    onExportExcel: () => Promise<void>;
    onExportPDF: () => Promise<void>;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (exportFn: () => Promise<void>) => {
        setIsExporting(true);
        try {
            await exportFn();
        } finally {
            setIsExporting(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={!canExport || isExporting}
                className="btn flex items-center gap-2"
            >
                <Download size={16} />
                {isExporting ? 'Exporting...' : 'Export'}
                <ChevronDown size={16} />
            </button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                        <div className="py-1">
                            <button
                                onClick={() => handleExport(onExportCSV)}
                                disabled={isExporting}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                <Download size={14} />
                                Export as CSV
                            </button>
                            <button
                                onClick={() => handleExport(onExportExcel)}
                                disabled={isExporting}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                <Download size={14} />
                                Export as Excel
                            </button>
                            <button
                                onClick={() => handleExport(onExportPDF)}
                                disabled={isExporting}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                <Download size={14} />
                                Export as PDF
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function RecruitmentApplicationsReportPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'pending' | 'reviewed' | 'shortlisted' | 'rejected'| ''>('');
    const [positionTypeFilter, setPositionTypeFilter] = useState<'Academic' | 'Non-Academic' | 'Volunteer' | ''>('');

    const { data: normalizedData, isLoading } = useApplications({
        page,
        per_page: perPage,
        search: search || undefined,
        status: statusFilter || undefined,
        position_type: positionTypeFilter || undefined,
    });

    // Normalize application data to flat rows for table and export
    const normalizeApplicationForReport = (app: Application): Record<string, any> => {
        return {
            applicant_id: app.applicant_id || '',
            full_name: `${app.first_name || ''} ${app.last_name || ''}`.trim(),
            email: app.email || '',
            phone: app.phone || '',
            position_applied_for: app.position_applied_for || '',
            position_type: app.position_type || '',
            college: app.college || '',
            department: app.department || '',
            status: app.status || 'pending',
            created_at: app.created_at || '',
        };
    };

    // Get all rows from fetched data
    const allRows = useMemo(() => {
        if (!normalizedData?.data || normalizedData.data.length === 0) return [];
        return normalizedData.data.map(normalizeApplicationForReport);
    }, [normalizedData?.data]);

    // Client-side filter for search
    const filteredData = useMemo(() => {
        if (!search) return allRows;
        const searchLower = search.toLowerCase();
        return allRows.filter((row) => {
            const fullName = String(row.full_name).toLowerCase();
            const email = String(row.email).toLowerCase();
            const phone = String(row.phone).toLowerCase();
            const position = String(row.position_applied_for).toLowerCase();

            return fullName.includes(searchLower) ||
                email.includes(searchLower) ||
                phone.includes(searchLower) ||
                position.includes(searchLower);
        });
    }, [allRows, search]);

    const columns = useMemo(() => {
        return [
            { key: 'full_name', header: 'Applicant Name' },
            { key: 'email', header: 'Email' },
            { key: 'phone', header: 'Phone' },
            { key: 'position_applied_for', header: 'Position' },
            { key: 'position_type', header: 'Position Type' },
            { key: 'college', header: 'College' },
            { key: 'department', header: 'Department' },
            { key: 'status', header: 'Status' },
            { key: 'created_at', header: 'Submitted Date' },
        ];
    }, []);

    const tableColumns = [
        {
            key: 'full_name',
            header: 'Applicant Name',
            render: (row: Record<string, any>) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{row.full_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{row.email}</div>
                </div>
            ),
        },
        {
            key: 'position',
            header: 'Position Applied',
            render: (row: Record<string, any>) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{row.position_applied_for}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.position_type}</div>
                </div>
            ),
        },
        {
            key: 'contact',
            header: 'Contact',
            render: (row: Record<string, any>) => (
                <div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{row.phone}</div>
                </div>
            ),
        },
        {
            key: 'college_dept',
            header: 'College / Department',
            render: (row: Record<string, any>) => (
                <div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{row.college || 'N/A'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.department || 'N/A'}</div>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: Record<string, any>) => (
                <span className={`badge ${
                    row.status === 'shortlisted' ? 'badge-info' :
                    row.status === 'rejected' ? 'badge-danger' :
                    row.status === 'reviewed' ? 'badge-warning' :
                    'badge-warning'
                }`}>
                    {row.status}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Submitted',
            render: (row: Record<string, any>) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(row.created_at)}</span>
            ),
        },
    ];

    const canExport = filteredData.length > 0;

    // Fetch all applications from API respecting status and position_type filters
    const fetchAllApplications = async (status?: string, positionType?: string): Promise<Application[]> => {
        const allApplications: Application[] = [];
        const perPage = 500; // Increased for faster fetching

        try {
            // Fetch first page to get total count
            const firstParams: ApplicationQueryParams = {
                page: 1,
                per_page: perPage,
            };

            // Only include filters if they have values
            if (status && status !== '') {
                firstParams.status = status;
            }
            if (positionType && positionType !== '') {
                firstParams.position_type = positionType;
            }

            const firstResponse = await applicationsApi.getAll(firstParams);
            // Handle both paginated and non-paginated responses
            const firstData = Array.isArray(firstResponse) ? firstResponse : firstResponse.data;
            allApplications.push(...firstData);
            const totalPages = (firstResponse as any).last_page || 1;

            if (totalPages > 1) {
                toast.info(`Fetching ${totalPages} pages of data...`, { autoClose: false });

                // Fetch remaining pages
                for (let p = 2; p <= totalPages; p++) {
                    const params: ApplicationQueryParams = {
                        page: p,
                        per_page: perPage,
                    };

                    // Only include filters if they have values
                    if (status && status !== '') {
                        params.status = status;
                    }
                    if (positionType && positionType !== '') {
                        params.position_type = positionType;
                    }

                    const response = await applicationsApi.getAll(params);
                    const responseData = Array.isArray(response) ? response : response.data;
                    allApplications.push(...responseData);
                }

                toast.dismiss();
            }
        } catch (error) {
            toast.dismiss();
            throw error;
        }

        return allApplications;
    };

    const downloadCSV = async () => {
        if (!canExport) return;

        try {
            toast.loading('Preparing CSV export...', { autoClose: false });

            // Fetch all applications with filters
            const allApps = await fetchAllApplications(
                statusFilter,
                positionTypeFilter
            );

            const allRows = allApps.map(normalizeApplicationForReport);
            const headers = columns.map((c) => c.header).join(',');
            const csvRows = allRows
                .map((r) => columns.map((c) => `"${String(r[c.key] || '').replace(/"/g, '""')}"`).join(','))
                .join('\n');
            const content = `${headers}\n${csvRows}`;
            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'recruitment-applications.csv';
            a.click();
            URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success(`CSV exported successfully (${allApps.length} records)`);
        } catch (error) {
            toast.dismiss();
            console.error('Error exporting to CSV:', error);
            toast.error('Failed to export CSV');
        }
    };

    const downloadExcel = async () => {
        if (!canExport) return;

        try {
            toast.loading('Preparing Excel export...', { autoClose: false });

            // Fetch all applications with filters
            const allApps = await fetchAllApplications(
                statusFilter,
                positionTypeFilter
            );

            const allRows = allApps.map(normalizeApplicationForReport);
            const headerHtml = `<tr>${columns.map((c) => `<th>${c.header}</th>`).join('')}</tr>`;
            const bodyHtml = allRows
                .map((r) => `<tr>${columns.map((c) => `<td>${String(r[c.key] || '')}</td>`).join('')}</tr>`)
                .join('');
            const table = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><table>${headerHtml}${bodyHtml}</table></body></html>`;
            const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'recruitment-applications.xls';
            a.click();
            URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success(`Excel exported successfully (${allApps.length} records)`);
        } catch (error) {
            toast.dismiss();
            console.error('Error exporting to Excel:', error);
            toast.error('Failed to export Excel');
        }
    };

    const downloadPDF = async () => {
        if (!canExport) return;

        try {
            toast.loading('Preparing PDF export...', { autoClose: false });

            // Fetch all applications with filters
            const allApps = await fetchAllApplications(
                statusFilter,
                positionTypeFilter
            );

            const allRows = allApps.map(normalizeApplicationForReport);
            const jsPDFModule = await import('jspdf');
            const autoTableModule = await import('jspdf-autotable');
            const jsPDF = jsPDFModule.default as any;
            const autoTable = autoTableModule.default as any;
            const doc = new jsPDF({ orientation: 'landscape' });
            const head = [columns.map((c) => c.header)];
            const body = allRows.map((r) => columns.map((c) => String(r[c.key] || '')));
            // @ts-ignore
            doc.autoTable({ head, body, startY: 14, styles: { fontSize: 8 } });
            doc.save('recruitment-applications.pdf');

            toast.dismiss();
            toast.success(`PDF exported successfully (${allApps.length} records)`);
        } catch (error) {
            toast.dismiss();
            console.error('Error exporting to PDF:', error);
            toast.error('Failed to export PDF');
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Recruitment Applications</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                View and manage staff recruitment applications
                            </p>
                        </div>
                        <ExportDropdown
                            canExport={canExport}
                            onExportCSV={downloadCSV}
                            onExportExcel={downloadExcel}
                            onExportPDF={downloadPDF}
                        />
                    </div>

                    <div className="card">
                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone, or position..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="input pl-10 w-full"
                                />
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as typeof statusFilter);
                                    setPage(1);
                                }}
                                className="input w-full sm:w-48"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="rejected">Rejected</option>
                        
                            </select>

                            <select
                                value={positionTypeFilter}
                                onChange={(e) => {
                                    setPositionTypeFilter(e.target.value as typeof positionTypeFilter);
                                    setPage(1);
                                }}
                                className="input w-full sm:w-48"
                            >
                                <option value="">All Position Types</option>
                                <option value="Academic">Academic</option>
                                <option value="Non-Academic">Non-Academic</option>
                                <option value="Volunteer">Volunteer</option>
                            </select>
                        </div>

                        <Table columns={tableColumns} data={filteredData} isLoading={isLoading} />

                        {normalizedData?.meta && (
                            <div className="mt-6">
                                {search && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Showing {filteredData.length} of {normalizedData.meta.total} results (client-side filtered)
                                    </p>
                                )}
                                <Pagination
                                    currentPage={normalizedData.meta.current_page}
                                    totalPages={normalizedData.meta.last_page}
                                    perPage={perPage}
                                    total={normalizedData.meta.total}
                                    onPageChange={setPage}
                                    onPerPageChange={(newPerPage) => {
                                        setPerPage(newPerPage);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
