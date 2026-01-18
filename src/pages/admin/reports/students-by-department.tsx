import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import { useDepartments, useFaculties, usePrograms, useStudentsReport } from '@/lib/queries';
import { toast } from 'react-toastify';
import { ChevronDown, Download } from 'lucide-react';

// Export Dropdown Component
function ExportDropdown({ canExport, onExportCSV, onExportExcel, onExportPDF }: {
    canExport: boolean;
    onExportCSV: () => void;
    onExportExcel: () => void;
    onExportPDF: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={!canExport}
                className="btn flex items-center gap-2"
            >
                <Download size={16} />
                Export
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
                                onClick={() => {
                                    onExportCSV();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                                <Download size={14} />
                                Export as CSV
                            </button>
                            <button
                                onClick={() => {
                                    onExportExcel();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                                <Download size={14} />
                                Export as Excel
                            </button>
                            <button
                                onClick={() => {
                                    onExportPDF();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
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

export default function StudentsByDepartmentReportPage() {
    const [reportType, setReportType] = useState<'department' | 'faculty' | 'program' | undefined>('department');
    const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>(undefined);
    const [selectedFacultyId, setSelectedFacultyId] = useState<number | undefined>(undefined);
    const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>(undefined);
    const [yearOfEntry, setYearOfEntry] = useState<number | undefined>(undefined);
    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(100);

    // Load options
    const { data: departmentsData, isLoading: loadingDepartments } = useDepartments({ per_page: 200 });
    const departments = departmentsData?.data || [];
    const { data: facultiesData } = useFaculties({ per_page: 200 });
    const faculties = facultiesData?.data || [];
    const { data: programsData } = usePrograms({ per_page: 500 });
    const programs = programsData?.data || [];

    const selectedEntity = (
        reportType === 'department' ? departments.find((d) => d.id === selectedDeptId)
        : reportType === 'faculty' ? faculties.find((f) => f.id === selectedFacultyId)
        : programs.find((p) => p.id === selectedProgramId) || null
    ) || null;

    const selectedId = reportType === 'department' ? selectedDeptId : reportType === 'faculty' ? selectedFacultyId : selectedProgramId;

    // Fetch ALL data for complete sorting (use a very large per_page to get everything)
    const { data: reportResponse, isLoading: loadingReport, isError: reportError } = useStudentsReport(reportType, selectedId, yearOfEntry, 1, 10000);

    if (reportError) {
        toast.error('Failed to load student report.');
    }

    // paginated is the server paginated payload: { current_page, data: Student[], per_page, total }
    const paginated = reportResponse?.data;
    const studentsArray = Array.isArray(paginated?.data) ? paginated.data : [];

    const normalizeStudentForReport = (s: any): Record<string, any> => {
        // Prefer the first admission application
        const app = Array.isArray(s?.admission_applications) && s.admission_applications.length > 0 
            ? s.admission_applications[0] 
            : null;
        
        const jambInfo = app?.jamb_information ?? null;

        // JAMB subjects and scores: { "Mathematics": 80, "English": 70, ... }
        const jambSubjectsScores = (jambInfo?.utme_subjects_scores as Record<string, any>) ?? {};
        const jambSubjectsEntries = Object.entries(jambSubjectsScores);

        // O-level: Get BOTH sittings
        const academicBackgrounds = Array.isArray(app?.academic_backgrounds) ? app.academic_backgrounds : [];
        
        // First sitting
        const firstSitting = (academicBackgrounds[0]?.subjects_grades as Record<string, any>) ?? {};
        const firstSittingEntries = Object.entries(firstSitting);
        
        // Second sitting
        const secondSitting = (academicBackgrounds[1]?.subjects_grades as Record<string, any>) ?? {};
        const secondSittingEntries = Object.entries(secondSitting);

        const name = s?.first_name && s?.last_name 
            ? `${s.first_name} ${s.last_name}`.trim()
            : s?.full_name ?? '';

        // Try to get sex/gender from multiple possible locations
        const sex = s?.sex ?? s?.gender ?? app?.sex ?? app?.gender ?? '';

        // Get course from multiple possible locations
        const course = app?.preferred_course ?? app?.course ?? s?.program?.title ?? s?.course?.title ?? '';

        // Get JAMB aggregate from multiple possible locations
        const jambAggregate = jambInfo?.utme_score ?? jambInfo?.jamb_aggregate ?? s?.jamb_aggregate ?? '';

        const row: Record<string, any> = {
            JAMB_REG: s?.jamb_registration ?? s?.jamb_registration_number ?? app?.jamb_registration ?? '',
            NAME: name,
            SEX: sex,
            COURSE: course,
            JAMB_AGGREGATE: String(jambAggregate),
        };

        // Add JAMB subjects with their individual scores (up to 4 subjects)
        for (let i = 0; i < 4; i++) {
            const subjectEntry = jambSubjectsEntries[i];
            row[`JAMB_SUB${i + 1}`] = subjectEntry?.[0] ?? '';
            row[`JAMB_SCORE${i + 1}`] = subjectEntry?.[1] ?? '';
        }

        // First sitting O-level (up to 9 subjects)
        for (let i = 0; i < 9; i++) {
            row[`OLEVEL1_SUB${i + 1}`] = firstSittingEntries[i]?.[0] ?? '';
            row[`OLEVEL1_GRADE${i + 1}`] = firstSittingEntries[i]?.[1] ?? '';
        }

        // Second sitting O-level (up to 9 subjects)
        for (let i = 0; i < 9; i++) {
            row[`OLEVEL2_SUB${i + 1}`] = secondSittingEntries[i]?.[0] ?? '';
            row[`OLEVEL2_GRADE${i + 1}`] = secondSittingEntries[i]?.[1] ?? '';
        }

        return row;
    };

    // Sort ALL rows first
    const allSortedRows = useMemo(() => {
        if (!Array.isArray(studentsArray)) return [] as Record<string, any>[];

        const normalized = studentsArray.map((s: any) => normalizeStudentForReport(s));
        
        // Sort by course alphabetically, then by JAMB aggregate (highest to lowest)
        return normalized.sort((a, b) => {
            const courseA = String(a.COURSE || '').toLowerCase();
            const courseB = String(b.COURSE || '').toLowerCase();
            
            // First compare courses alphabetically
            if (courseA < courseB) return -1;
            if (courseA > courseB) return 1;
            
            // If courses are the same, compare JAMB aggregate (highest first)
            const jambA = parseFloat(String(a.JAMB_AGGREGATE)) || 0;
            const jambB = parseFloat(String(b.JAMB_AGGREGATE)) || 0;
            return jambB - jambA; // Descending order (highest first)
        });
    }, [studentsArray]);

    // Client-side pagination for display
    const totalRows = allSortedRows.length;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const rows = allSortedRows.slice(startIndex, endIndex);

    const columns = useMemo(() => {
        const base = ['JAMB_REG', 'NAME', 'SEX', 'COURSE', 'JAMB_AGGREGATE'];
        
        // JAMB subjects and scores (4 subjects)
        const jambCols: string[] = [];
        for (let i = 1; i <= 4; i++) {
            jambCols.push(`JAMB_SUB${i}`);
            jambCols.push(`JAMB_SCORE${i}`);
        }
        
        // First sitting O-level (9 subjects)
        const olevel1Cols: string[] = [];
        for (let i = 1; i <= 9; i++) {
            olevel1Cols.push(`OLEVEL1_SUB${i}`);
            olevel1Cols.push(`OLEVEL1_GRADE${i}`);
        }
        
        // Second sitting O-level (9 subjects)
        const olevel2Cols: string[] = [];
        for (let i = 1; i <= 9; i++) {
            olevel2Cols.push(`OLEVEL2_SUB${i}`);
            olevel2Cols.push(`OLEVEL2_GRADE${i}`);
        }
        
        return [...base, ...jambCols, ...olevel1Cols, ...olevel2Cols].map((key) => ({ key, header: key }));
    }, []);

    const canExport = allSortedRows.length > 0;
    const fileBaseName = selectedEntity?.name || (selectedEntity as any)?.title || reportType || 'students';

    const downloadCSV = () => {
        if (!canExport) return;
        const headers = columns.map((c) => c.header).join(',');
        // Use ALL sorted rows for export, not just current page
        const csvRows = allSortedRows.map((r) => columns.map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const content = `${headers}\n${csvRows}`;
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileBaseName}-report.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadExcel = () => {
        if (!canExport) return;
        const headerHtml = `<tr>${columns.map((c) => `<th>${c.header}</th>`).join('')}</tr>`;
        // Use ALL sorted rows for export, not just current page
        const bodyHtml = allSortedRows.map((r) => `<tr>${columns.map((c) => `<td>${String(r[c.key] ?? '')}</td>`).join('')}</tr>`).join('');
        const table = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><table>${headerHtml}${bodyHtml}</table></body></html>`;
        const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileBaseName}-report.xls`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadPDF = async () => {
        if (!canExport) return;
        const jsPDFModule = await import('jspdf');
        const autoTableModule = await import('jspdf-autotable');
        const jsPDF = jsPDFModule.default as any;
        const autoTable = autoTableModule.default as any;
        const doc = new jsPDF({ orientation: 'landscape' });
        const head = [columns.map((c) => c.header)];
        // Use ALL sorted rows for export, not just current page
        const body = allSortedRows.map((r) => columns.map((c) => String(r[c.key] ?? '')));
        // @ts-ignore
        doc.autoTable({ head, body, startY: 14, styles: { fontSize: 8 } });
        doc.save(`${fileBaseName}-report.pdf`);
    };

    const totalPages = Math.ceil(totalRows / perPage);

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Student Reports</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Select a scope and filters to view and download student reports</p>
                        </div>
                    </div>

                    <div className="card">
                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <select
                                        value={reportType}
                                        onChange={(e) => {
                                            const t = e.target.value as 'department' | 'faculty' | 'program';
                                            setReportType(t);
                                            setSelectedDeptId(undefined);
                                            setSelectedFacultyId(undefined);
                                            setSelectedProgramId(undefined);
                                            setPage(1);
                                        }}
                                        className="input"
                                    >
                                        <option value="department">Department</option>
                                        <option value="faculty">Faculty</option>
                                        <option value="program">Program</option>
                                    </select>

                                    {reportType === 'department' && (
                                        <select
                                            value={selectedDeptId ?? ''}
                                            onChange={(e) => { setSelectedDeptId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
                                            className="input"
                                            disabled={departments.length === 0}
                                        >
                                            <option value="">{departments.length ? 'Select department...' : 'No departments available'}</option>
                                            {departments.map((d: any) => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    )}

                                    {reportType === 'faculty' && (
                                        <select
                                            value={selectedFacultyId ?? ''}
                                            onChange={(e) => { setSelectedFacultyId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
                                            className="input"
                                            disabled={faculties.length === 0}
                                        >
                                            <option value="">{faculties.length ? 'Select faculty...' : 'No faculties available'}</option>
                                            {faculties.map((f: any) => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                    )}

                                    {reportType === 'program' && (
                                        <select
                                            value={selectedProgramId ?? ''}
                                            onChange={(e) => { setSelectedProgramId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
                                            className="input"
                                            disabled={programs.length === 0}
                                        >
                                            <option value="">{programs.length ? 'Select program...' : 'No programs available'}</option>
                                            {programs.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.title ?? p.name}</option>
                                            ))}
                                        </select>
                                    )}

                                    <input
                                        type="number"
                                        placeholder="Year of entry"
                                        value={yearOfEntry ?? ''}
                                        onChange={(e) => { setYearOfEntry(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
                                        className="input w-40"
                                    />

                                    <ExportDropdown 
                                        canExport={canExport}
                                        onExportCSV={downloadCSV}
                                        onExportExcel={downloadExcel}
                                        onExportPDF={downloadPDF}
                                    />
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedEntity ? (
                                        <div>Showing <strong>{(selectedEntity as any).name ?? (selectedEntity as any).title}</strong></div>
                                    ) : (
                                        <div>Please select a scope and entity</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-500">Per page:</label>
                                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="input w-24">
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>

                        <Table columns={columns} data={rows} isLoading={loadingReport || loadingDepartments} emptyMessage={selectedEntity ? 'No students found for this selection' : 'Please choose scope, entity and filters to view the report'} />

                        {totalRows > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Total: {totalRows} | Showing {startIndex + 1} to {Math.min(endIndex, totalRows)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                                        <div className="px-3">Page {page} of {totalPages}</div>
                                        <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}