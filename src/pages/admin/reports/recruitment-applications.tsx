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
import { useExportWorker } from '@/hooks/useExportWorker';
import { flattenApplicationForExport, getRecruitmentExportColumns } from '@/utils/recruitmentExport';
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
    const [statusFilter, setStatusFilter] = useState<'pending' | 'reviewed' | 'shortlisted' | 'rejected' | ''>('');
    const [positionTypeFilter, setPositionTypeFilter] = useState<'Academic' | 'Non-Academic' | 'Volunteer' | ''>('');

    // Initialize export worker for offload processing
    const { export: processExport } = useExportWorker();

    const { data: normalizedData, isLoading } = useApplications({
        page,
        per_page: perPage,
        search: search || undefined,
        status: statusFilter || undefined,
        position_type: positionTypeFilter || undefined,
    });


    // Normalize application data to flat rows for table and export (with all details)
    const normalizeApplicationForReport = (app: Application): Record<string, any> => {
        // Get first education, work exp, cert, reference, document if available
        const firstEducation = app.educational_backgrounds?.[0];
        const firstWorkExp = app.work_experiences?.[0];
        const firstCertification = app.professional_certifications?.[0];
        const firstReference = app.references?.[0];
        const firstDocument = app.documents?.[0];

        return {
            // Personal & Contact
            applicant_id: app.applicant_id || '',
            form_of_address: app.form_of_address || '',
            first_name: app.first_name || '',
            last_name: app.last_name || '',
            other_name: app.other_name || '',
            full_name: `${app.first_name || ''} ${app.last_name || ''}`.trim(),
            email: app.email || '',
            phone: app.phone || '',
            residential_address: app.residential_address || '',

            // Demographics
            gender: app.gender || '',
            date_of_birth: app.date_of_birth || '',
            nationality: app.nationality || '',
            marital_status: app.marital_status || '',
            state_of_origin: app.state_of_origin || '',
            home_town: app.home_town || '',
            lga: app.lga || '',

            // Position Info
            position_type: app.position_type || '',
            position_applied_for: app.position_applied_for || '',
            college: app.college || '',
            department: app.department || '',
            preferred_start_date: app.preferred_start_date || '',
            how_did_you_hear: app.how_did_you_hear || '',

            // Status & Dates
            status: app.status || 'pending',
            created_at: app.created_at || '',
            updated_at: app.updated_at || '',

            // Education Details (first record)
            education_institution: firstEducation?.institution_name || '',
            education_certificate: firstEducation?.certificate_obtained || '',
            education_class: firstEducation?.class_of_degree || '',
            education_year: firstEducation?.year_attained || '',

            // Work Experience Details (first record)
            work_organization: firstWorkExp?.organization_name || '',
            work_job_title: firstWorkExp?.job_title || '',
            work_start_date: firstWorkExp?.start_date || '',
            work_end_date: firstWorkExp?.end_date || '',
            work_responsibility: firstWorkExp?.responsibility || '',

            // Certification Details (first record)
            certification_name: firstCertification?.certification_name || '',
            certification_issuer: firstCertification?.issuing_organization || '',
            certification_date: firstCertification?.date_obtained || '',

            // Reference Details (first record)
            reference_full_name: firstReference?.full_name || '',
            reference_phone: firstReference?.phone || '',
            reference_relationship: firstReference?.relationship || '',

            // Document Details (first record)
            document_type: firstDocument?.document_type || '',
            document_file_name: firstDocument?.file_name || '',
            document_mime_type: firstDocument?.mime_type || '',
            document_size: firstDocument?.size ? `${(firstDocument.size / 1024).toFixed(2)} KB` : '',

            // Raw data for custom rendering
            _app: app,
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

    // Get export columns with all available details
    const exportColumns = useMemo(() => {
        return getRecruitmentExportColumns(true); // Include all detail fields
    }, []);

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
            key: 'applicant_info',
            header: 'Applicant Information',
            render: (row: Record<string, any>) => (
                <div className="space-y-2">
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {row.form_of_address && <span>{row.form_of_address} </span>}
                            {row.full_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {row.applicant_id}</div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        <p>{row.email}</p>
                        <p>{row.phone}</p>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {row.gender && <p><span className="font-medium">Gender:</span> {row.gender}</p>}
                        {row.date_of_birth && <p><span className="font-medium">DOB:</span> {formatDate(row.date_of_birth)}</p>}
                        {row.marital_status && <p><span className="font-medium">Marital:</span> {row.marital_status}</p>}
                        {row.other_name && <p><span className="font-medium">Other Name:</span> {row.other_name}</p>}
                    </div>
                </div>
            ),
        },
        {
            key: 'position_info',
            header: 'Position Information',
            render: (row: Record<string, any>) => (
                <div className="space-y-1">
                    <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{row.position_applied_for || 'N/A'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{row.position_type || 'N/A'}</div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-medium">{row.college || 'N/A'}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{row.department || 'N/A'}</p>
                    </div>
                    {row.preferred_start_date && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Start Date:</span> {formatDate(row.preferred_start_date)}
                        </div>
                    )}
                    {row.how_did_you_hear && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Heard via:</span> {row.how_did_you_hear}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'demographics',
            header: 'Demographics',
            render: (row: Record<string, any>) => (
                <div className="text-sm space-y-1">
                    {row.nationality && <p><span className="font-medium">Nationality:</span> {row.nationality}</p>}
                    {row.state_of_origin && <p><span className="font-medium">State:</span> {row.state_of_origin}</p>}
                    {row.home_town && <p><span className="font-medium">Town:</span> {row.home_town}</p>}
                    {row.lga && <p><span className="font-medium">LGA:</span> {row.lga}</p>}
                    {row.residential_address && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Address:</span> {row.residential_address.substring(0, 30)}...
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: 'education',
            header: 'Education (Latest)',
            render: (row: Record<string, any>) => (
                <div className="text-sm space-y-1">
                    {row.education_institution ? (
                        <>
                            <p className="font-medium">{row.education_institution}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{row.education_certificate}</p>
                            {row.education_class && <p className="text-xs"><span className="font-medium">Class:</span> {row.education_class}</p>}
                            {row.education_year && <p className="text-xs"><span className="font-medium">Year:</span> {row.education_year}</p>}
                        </>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">N/A</p>
                    )}
                </div>
            ),
        },
        {
            key: 'work_exp',
            header: 'Work Experience (Latest)',
            render: (row: Record<string, any>) => (
                <div className="text-sm space-y-1">
                    {row.work_organization ? (
                        <>
                            <p className="font-medium">{row.work_job_title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{row.work_organization}</p>
                            {row.work_start_date && (
                                <p className="text-xs">
                                    {formatDate(row.work_start_date)} to {row.work_end_date ? formatDate(row.work_end_date) : 'Present'}
                                </p>
                            )}
                            {row.work_responsibility && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{row.work_responsibility}</p>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">N/A</p>
                    )}
                </div>
            ),
        },
        {
            key: 'certification',
            header: 'Certification (Latest)',
            render: (row: Record<string, any>) => (
                <div className="text-sm space-y-1">
                    {row.certification_name ? (
                        <>
                            <p className="font-medium">{row.certification_name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{row.certification_issuer}</p>
                            {row.certification_date && (
                                <p className="text-xs">{formatDate(row.certification_date)}</p>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">N/A</p>
                    )}
                </div>
            ),
        },
        {
            key: 'reference',
            header: 'Reference (Latest)',
            render: (row: Record<string, any>) => (
                <div className="text-sm space-y-1">
                    {row.reference_full_name ? (
                        <>
                            <p className="font-medium">{row.reference_full_name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{row.reference_relationship}</p>
                            <p className="text-xs">{row.reference_phone}</p>
                        </>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">N/A</p>
                    )}
                </div>
            ),
        },
        {
            key: 'documents',
            header: 'Documents',
            render: (row: Record<string, any>) => (
                <div className="text-sm space-y-1">
                    {row.document_file_name ? (
                        <>
                            <p className="font-medium text-blue-600 dark:text-blue-400">{row.document_type}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{row.document_file_name}</p>
                            {row.document_mime_type && <p className="text-xs text-gray-500">{row.document_mime_type}</p>}
                            {row.document_size && <p className="text-xs text-gray-500">{row.document_size}</p>}
                        </>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">N/A</p>
                    )}
                </div>
            ),
        },
        {
            key: 'status_dates',
            header: 'Status & Timeline',
            render: (row: Record<string, any>) => (
                <div className="space-y-2">
                    <span className={`badge ${row.status === 'shortlisted' ? 'badge-info' :
                        row.status === 'rejected' ? 'badge-danger' :
                            row.status === 'reviewed' ? 'badge-warning' :
                                'badge-warning'
                        }`}>
                        {row.status}
                    </span>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        <p>Submitted: {formatDate(row.created_at)}</p>
                        {row.updated_at && (
                            <p>Updated: {formatDate(row.updated_at)}</p>
                        )}
                    </div>
                </div>
            ),
        },
    ];

    const canExport = filteredData.length > 0;

    // Retry logic with exponential backoff
    const fetchWithRetry = async (
        pageNum: number,
        perPage: number,
        status?: string,
        positionType?: string,
        retries = 3
    ): Promise<any> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const params: ApplicationQueryParams = {
                    page: pageNum,
                    per_page: perPage,
                };

                if (status && status !== '') {
                    params.status = status;
                }
                if (positionType && positionType !== '') {
                    params.position_type = positionType;
                }

                const response = await applicationsApi.getAll(params);
                return response; // Success
            } catch (error) {
                const isLastAttempt = attempt === retries;
                const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // exponential backoff, max 10s

                if (isLastAttempt) {
                    console.error(`Failed to fetch page ${pageNum} after ${retries} attempts`, error);
                    throw error; // Give up
                }

                console.warn(`Page ${pageNum} request failed, retrying in ${backoffMs}ms (attempt ${attempt}/${retries})`);
                toast.warning(`Page ${pageNum} retry attempt ${attempt}/${retries}...`, { autoClose: 2000 });

                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
            }
        }
    };

    // Fetch all applications from API respecting status and position_type filters
    // Optimized with parallel requests and retry logic to prevent timeouts
    const fetchAllApplications = async (status?: string, positionType?: string): Promise<Application[]> => {
        const allApplications: Application[] = [];
        const perPage = 500; // Reduced from 1000 for better stability
        const maxConcurrent = 3; // Reduced from 5 to reduce server load

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

            toast.info('Fetching initial data...', { autoClose: false });
            const firstResponse = await fetchWithRetry(1, perPage, status, positionType);
            const firstData = Array.isArray(firstResponse) ? firstResponse : firstResponse.data;
            allApplications.push(...firstData);
            const totalPages = (firstResponse as any).last_page || 1;

            if (totalPages > 1) {
                // Build array of remaining pages to fetch
                const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);

                // Fetch pages in parallel batches with retry support
                for (let i = 0; i < remainingPages.length; i += maxConcurrent) {
                    const batchPages = remainingPages.slice(i, i + maxConcurrent);
                    const progressStart = i + 2;
                    const progressEnd = Math.min(i + maxConcurrent + 1, totalPages);

                    toast.info(
                        `Fetching pages ${progressStart} to ${progressEnd} of ${totalPages}... (with retries)`,
                        { autoClose: false }
                    );

                    // Create promises for all pages in this batch with retry support
                    const batchPromises = batchPages.map((pageNum) =>
                        fetchWithRetry(pageNum, perPage, status, positionType, 3)
                    );

                    try {
                        // Wait for all requests in this batch to complete
                        const batchResponses = await Promise.all(batchPromises);

                        // Collect results from all responses
                        batchResponses.forEach((response) => {
                            const responseData = Array.isArray(response) ? response : response.data;
                            allApplications.push(...responseData);
                        });
                    } catch (batchError) {
                        console.error('Batch failed:', batchError);
                        toast.error(`Failed to fetch batch at pages ${progressStart}-${progressEnd}. Please try again.`);
                        throw batchError;
                    }
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
            toast.loading('Fetching data for CSV export...', { autoClose: false });

            // Fetch all applications with filters
            const allApps = await fetchAllApplications(statusFilter, positionTypeFilter);

            toast.loading(`Processing ${allApps.length} records with all details...`, { autoClose: false });

            // Flatten each application with all nested details (education, work exp, etc)
            const allRows = allApps.flatMap((app) => flattenApplicationForExport(app, false));

            toast.loading(`Processing ${allRows.length} rows in worker...`, { autoClose: false });

            // Send to worker for processing (off main thread)
            const blob = await processExport({
                type: 'csv',
                data: allRows,
                columns: exportColumns,
                onProgress: (msg) => toast.info(msg, { autoClose: false }),
                onError: (error) => toast.error(`Export error: ${error}`),
            });

            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recruitment-applications-detailed-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success(`CSV exported successfully (${allApps.length} applicants)`);
        } catch (error) {
            toast.dismiss();
            console.error('Error exporting to CSV:', error);
            toast.error('Failed to export CSV');
        }
    };

    const downloadExcel = async () => {
        if (!canExport) return;

        try {
            toast.loading('Fetching data for Excel export...', { autoClose: false });

            // Fetch all applications with filters
            const allApps = await fetchAllApplications(statusFilter, positionTypeFilter);

            toast.loading(`Processing ${allApps.length} records with all details...`, { autoClose: false });

            // Flatten each application with all nested details
            const allRows = allApps.flatMap((app) => flattenApplicationForExport(app, false));

            toast.loading(`Processing ${allRows.length} rows in worker...`, { autoClose: false });

            // Send to worker for processing (off main thread)
            const blob = await processExport({
                type: 'excel',
                data: allRows,
                columns: exportColumns,
                onProgress: (msg) => toast.info(msg, { autoClose: false }),
                onError: (error) => toast.error(`Export error: ${error}`),
            });

            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recruitment-applications-detailed-${new Date().toISOString().split('T')[0]}.xls`;
            a.click();
            URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success(`Excel exported successfully (${allApps.length} applicants)`);
        } catch (error) {
            toast.dismiss();
            console.error('Error exporting to Excel:', error);
            toast.error('Failed to export Excel');
        }
    };

    const downloadPDF = async () => {
        if (!canExport) return;

        try {
            toast.loading('Fetching data for PDF export...', { autoClose: false });

            // Fetch all applications with filters
            const allApps = await fetchAllApplications(statusFilter, positionTypeFilter);

            toast.loading(`Processing ${allApps.length} records with all details...`, { autoClose: false });

            // Flatten each application with all nested details
            const allRows = allApps.flatMap((app) => flattenApplicationForExport(app, false));

            toast.loading(`Processing ${allRows.length} rows in worker...`, { autoClose: false });

            // Send to worker for processing (off main thread)
            const blob = await processExport({
                type: 'pdf',
                data: allRows,
                columns: exportColumns,
                onProgress: (msg) => toast.info(msg, { autoClose: false }),
                onError: (error) => toast.error(`Export error: ${error}`),
            });

            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recruitment-applications-detailed-${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success(`PDF exported successfully (${allApps.length} applicants)`);
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
