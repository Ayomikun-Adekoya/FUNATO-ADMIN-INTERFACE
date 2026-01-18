import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { candidateDataApi } from '@/lib/api';
import { toast } from 'react-toastify';
import Link from 'next/link';
import type { CandidateRecord } from '@/types/api';

export default function CandidateViewPage() {
    const router = useRouter();
    const { registrationNumber } = router.query;
    const [record, setRecord] = useState<CandidateRecord | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!registrationNumber) return;
        (async () => {
            setLoading(true);
            try {
                const res = await candidateDataApi.getByRegistrationNumber(String(registrationNumber));
                setRecord(res);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load candidate data');
            } finally {
                setLoading(false);
            }
        })();
    }, [registrationNumber]);

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    {/* Header with Back Button */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Link href="/admin/candidate-data" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </Link>
                            <h1 className="text-2xl font-bold">Candidate Details</h1>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* No Data State */}
                    {!loading && !record && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No candidate data found</p>
                        </div>
                    )}

                    {/* Candidate Data */}
                    {!loading && record && (
                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div className="card">
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <h2 className="text-lg font-semibold">Personal Information</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{record.rg_candname}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Registration Number</p>
                                        <p className="font-medium text-gray-900 dark:text-white font-mono">{record.rg_num}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sex</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{record.rg_sex || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">State</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{record.state_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">LGA</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{record.lga_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Country</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{record.co_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Aggregate Score</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{record.rg_aggr}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Subjects & Scores */}
                            <div className="card">
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <h2 className="text-lg font-semibold">Subjects & Scores</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {record.subject1 && (
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{record.subject1}</p>
                                            <p className="text-xl font-semibold text-gray-900 dark:text-white">{record.rg_sub1scor}</p>
                                        </div>
                                    )}
                                    {record.subject2 && (
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{record.subject2}</p>
                                            <p className="text-xl font-semibold text-gray-900 dark:text-white">{record.rg_sub2scor}</p>
                                        </div>
                                    )}
                                    {record.subject3 && (
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{record.subject3}</p>
                                            <p className="text-xl font-semibold text-gray-900 dark:text-white">{record.rg_sub3scor}</p>
                                        </div>
                                    )}
                                    {record.eng_score && (
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">English</p>
                                            <p className="text-xl font-semibold text-gray-900 dark:text-white">{record.eng_score}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Metadata */}
                            {(record.created_at || record.updated_at) && (
                                <div className="card">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                        {record.created_at && (
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Created</p>
                                                <p className="text-gray-900 dark:text-white">
                                                    {new Date(record.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        {record.updated_at && (
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                                                <p className="text-gray-900 dark:text-white">
                                                    {new Date(record.updated_at).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
