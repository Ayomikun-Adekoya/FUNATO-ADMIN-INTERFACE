import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useUpdateScreening } from '@/lib/queries';
import { toast } from 'react-toastify';
import type { Screening } from '@/types/api';
import { formatDate } from '@/utils/date';

export default function EditScreeningPage() {
    const router = useRouter();
    const { id, data: queryData } = router.query;
    const screeningId = parseInt(id as string);

    const [screening, setScreening] = useState<Screening | null>(null);
    const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'failed'>('pending');
    const [scheduledDate, setScheduledDate] = useState('');
    const [venue, setVenue] = useState('');
    const [notes, setNotes] = useState('');
    const [completedDate, setCompletedDate] = useState('');
    const [examiner, setExaminer] = useState('');
    const [score, setScore] = useState<number | ''>('');
    const [remarks, setRemarks] = useState('');

    const updateScreeningMutation = useUpdateScreening();

    // Load screening data from query params
    useEffect(() => {
        if (queryData && typeof queryData === 'string') {
            try {
                const parsedData = JSON.parse(queryData) as Screening;
                setScreening(parsedData);
                setStatus(parsedData.status);
                setScheduledDate(parsedData.screening_data?.scheduled_date || '');
                setVenue(parsedData.screening_data?.venue || '');
                setNotes(parsedData.notes || '');
                setCompletedDate((parsedData.screening_data as any)?.completed_date || '');
                setExaminer((parsedData.screening_data as any)?.examiner || '');
                setScore((parsedData.screening_data as any)?.score || '');
                setRemarks((parsedData.screening_data as any)?.remarks || '');
            } catch (error) {
                console.error('Error parsing screening data:', error);
            }
        }
    }, [queryData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!scheduledDate || !venue) {
            toast.error('Scheduled date and venue are required');
            return;
        }

        try {
            const screeningData: any = {
                scheduled_date: scheduledDate,
                venue: venue,
            };

            // Add optional fields if provided
            if (completedDate) screeningData.completed_date = completedDate;
            if (examiner) screeningData.examiner = examiner;
            if (score !== '') screeningData.score = Number(score);
            if (remarks) screeningData.remarks = remarks;

            await updateScreeningMutation.mutateAsync({
                id: screeningId,
                data: {
                    status,
                    notes,
                    screening_data: screeningData,
                },
            });
            toast.success('Screening updated successfully!');
            router.push('/admin/screenings');
        } catch (error: any) {
            console.error('Update screening error:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to update screening';
            toast.error(errorMessage);
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <Link
                                href="/admin/screenings"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Screenings
                            </Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Edit Screening</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Update Screening</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Update the screening details for this application</p>
                    </div>

                    {/* Student Details Card */}
                    {screening && (
                        <div className="card mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Student Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Application Number</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {screening.admission_application?.application_number || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {screening.admission_application?.student?.first_name} {screening.admission_application?.student?.last_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {screening.admission_application?.student?.email || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {screening.admission_application?.student?.phone || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Programme</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {screening.admission_application?.programme?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">College</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {screening.admission_application?.faculty?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {screening.admission_application?.department?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {formatDate(screening.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Screening Update Form */}
                    <div className="card">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status *
                                </label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'pending' | 'in_progress' | 'completed' | 'failed')}
                                    className="input w-full"
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Scheduled Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="scheduledDate"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Venue *
                                </label>
                                <input
                                    type="text"
                                    id="venue"
                                    value={venue}
                                    onChange={(e) => setVenue(e.target.value)}
                                    placeholder="e.g., Main Campus Hall A"
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Additional notes or instructions..."
                                    className="input w-full"
                                />
                            </div>

                            {/* Additional Screening Data Fields */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Additional Details (Optional)
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="completedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Completed Date
                                        </label>
                                        <input
                                            type="date"
                                            id="completedDate"
                                            value={completedDate}
                                            onChange={(e) => setCompletedDate(e.target.value)}
                                            className="input w-full"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="examiner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Examiner
                                        </label>
                                        <input
                                            type="text"
                                            id="examiner"
                                            value={examiner}
                                            onChange={(e) => setExaminer(e.target.value)}
                                            placeholder="e.g., Dr. John Doe"
                                            className="input w-full"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="score" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Score
                                        </label>
                                        <input
                                            type="number"
                                            id="score"
                                            value={score}
                                            onChange={(e) => setScore(e.target.value ? Number(e.target.value) : '')}
                                            placeholder="e.g., 85"
                                            min="0"
                                            max="100"
                                            className="input w-full"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Remarks
                                        </label>
                                        <input
                                            type="text"
                                            id="remarks"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="e.g., Excellent performance"
                                            className="input w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/admin/screenings')}
                                    className="btn-secondary"
                                    disabled={updateScreeningMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={updateScreeningMutation.isPending}
                                >
                                    {updateScreeningMutation.isPending ? 'Updating...' : 'Update Screening'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
