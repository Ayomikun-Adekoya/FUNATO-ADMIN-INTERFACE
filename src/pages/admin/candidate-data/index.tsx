import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import FileInput from '@/components/FileInput';
import { candidateDataApi } from '@/lib/api';
import { toast } from 'react-toastify';
import Link from 'next/link';

import type { CandidateRecord, CandidateDataQueryParams, PaginatedResponse } from '@/types/api';

export default function CandidateDataIndexPage() {
    // Listing state
    const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    });

    // Filter and sort state
    const [filters, setFilters] = useState({
        registration_number: '',
        candidate_name: '',
        state_name: '',
    });
    const [sorting, setSorting] = useState({
        sort_by: 'id',
        sort_order: 'asc' as 'asc' | 'desc',
    });

    // Upload modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Fetch candidates
    const fetchCandidates = async (page: number = 1) => {
        setLoading(true);
        try {
            // Build params, excluding empty filter values
            const params: any = {
                per_page: pagination.per_page,
                sort_by: sorting.sort_by,
                sort_order: sorting.sort_order,
            };
            
            // Only add filter params if they have values
            if (filters.registration_number.trim()) {
                params.registration_number = filters.registration_number;
            }
            if (filters.candidate_name.trim()) {
                params.candidate_name = filters.candidate_name;
            }
            if (filters.state_name.trim()) {
                params.state_name = filters.state_name;
            }

            console.log('Fetching candidates with params:', params);
            const response = await candidateDataApi.getAll(params);
            console.log('Candidates response:', response);
            
            if (response && response.data) {
                setCandidates(response.data);
                setPagination({
                    current_page: response.current_page || 1,
                    per_page: response.per_page || 15,
                    total: response.total || 0,
                    last_page: response.last_page || 1,
                });
            } else {
                console.warn('Unexpected response structure:', response);
                setCandidates([]);
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
            toast.error('Failed to load candidate data');
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on mount
    useEffect(() => {
        fetchCandidates(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refetch when filters or sorting change
    useEffect(() => {
        fetchCandidates(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, sorting]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSortChange = (field: string) => {
        if (sorting.sort_by === field) {
            // Toggle sort order
            setSorting(prev => ({
                ...prev,
                sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc',
            }));
        } else {
            // Change sort field
            setSorting({
                sort_by: field,
                sort_order: 'asc',
            });
        }
    };

    const handlePageChange = (page: number) => {
        fetchCandidates(page);
    };

    const handlePerPageChange = (perPage: number) => {
        setPagination(prev => ({ ...prev, per_page: perPage }));
    };

    const handleUploadFile = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        const allowed = ['.xlsx', '.xls', '.csv'];
        const name = file.name.toLowerCase();
        if (!allowed.some(ext => name.endsWith(ext))) {
            toast.error('The file must be an Excel file or CSV');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        try {
            const response = await candidateDataApi.upload(file, (ev) => {
                if (typeof ev.loaded === 'number' && typeof ev.total === 'number' && ev.total > 0) {
                    setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
                }
            });
            toast.success(response.message || 'Upload completed successfully');
            setShowUploadModal(false);
            setFile(null);
            setUploadProgress(0);
            // Refresh the list
            fetchCandidates(1);
        } catch (error: any) {
            console.error('Upload error:', error);
            if (error?.errors) {
                const first = Object.values(error.errors)[0];
                if (Array.isArray(first) && first.length > 0) {
                    toast.error(String(first[0]));
                } else {
                    toast.error(error.message || 'Upload failed');
                }
            } else if (error?.message) {
                toast.error(String(error.message));
            } else {
                toast.error('Upload failed');
            }
        } finally {
            setIsUploading(false);
        }
    };

    const columns = [
        {
            key: 'rg_num',
            header: 'Registration Number',
            render: (item: CandidateRecord) => (
                <Link href={`/admin/candidate-data/${encodeURIComponent(String(item.rg_num))}`} className="text-blue-600 hover:underline">
                    {item.rg_num}
                </Link>
            ),
        },
        {
            key: 'rg_candname',
            header: 'Name',
            render: (item: CandidateRecord) => item.rg_candname,
        },
        {
            key: 'rg_sex',
            header: 'Sex',
            render: (item: CandidateRecord) => item.rg_sex || '-',
        },
        {
            key: 'state_name',
            header: 'State',
            render: (item: CandidateRecord) => item.state_name || '-',
        },
        {
            key: 'rg_aggr',
            header: 'Aggregate',
            render: (item: CandidateRecord) => item.rg_aggr || '-',
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: CandidateRecord) => (
                <Link href={`/admin/candidate-data/${encodeURIComponent(String(item.rg_num))}`} className="btn-secondary btn-sm">
                    View Details
                </Link>
            ),
        },
    ];

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Candidate Data</h1>
                            <p className="text-sm text-gray-500">Manage and review candidate information</p>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="btn-primary"
                        >
                            Upload Candidates
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="card space-y-4">
                        <h3 className="font-semibold">Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="label">Registration Number</label>
                                <input
                                    type="text"
                                    value={filters.registration_number}
                                    onChange={(e) => handleFilterChange('registration_number', e.target.value)}
                                    placeholder="Filter by registration..."
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="label">Candidate Name</label>
                                <input
                                    type="text"
                                    value={filters.candidate_name}
                                    onChange={(e) => handleFilterChange('candidate_name', e.target.value)}
                                    placeholder="Filter by name..."
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="label">State</label>
                                <input
                                    type="text"
                                    value={filters.state_name}
                                    onChange={(e) => handleFilterChange('state_name', e.target.value)}
                                    placeholder="Filter by state..."
                                    className="input"
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <button
                                    onClick={() => {
                                        setFilters({
                                            registration_number: '',
                                            candidate_name: '',
                                            state_name: '',
                                        });
                                    }}
                                    className="btn-secondary"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Candidates Table */}
                    <div className="card space-y-4">
                        <Table
                            data={candidates}
                            columns={columns}
                            isLoading={loading}
                            emptyMessage="No candidates found"
                        />
                    </div>

                    {/* Pagination */}
                    {pagination.total > 0 && (
                        <Pagination
                            currentPage={pagination.current_page}
                            totalPages={pagination.last_page}
                            perPage={pagination.per_page}
                            total={pagination.total}
                            onPageChange={handlePageChange}
                            onPerPageChange={handlePerPageChange}
                        />
                    )}
                </div>

                {/* Upload Modal */}
                <Modal
                    isOpen={showUploadModal}
                    onClose={() => {
                        setShowUploadModal(false);
                        setFile(null);
                        setUploadProgress(0);
                    }}
                    title="Upload Candidate Data"
                    size="md"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="label">Select File</label>
                            <FileInput
                                accept=".xlsx,.xls,.csv"
                                file={file}
                                onChange={setFile}
                                placeholder="Select spreadsheet (.xlsx, .xls, .csv)"
                            />
                            <p className="text-sm text-gray-500 mt-2">Supported formats: .xlsx, .xls, .csv</p>
                        </div>

                        {isUploading && (
                            <div>
                                <label className="label">Upload Progress</label>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-2 transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{uploadProgress}%</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setFile(null);
                                    setUploadProgress(0);
                                }}
                                disabled={isUploading}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadFile}
                                disabled={!file || isUploading}
                                className="btn-primary"
                            >
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </Layout>
        </ProtectedRoute>
    );
}
