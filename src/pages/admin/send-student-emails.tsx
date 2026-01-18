import { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '@/lib/api';

export default function SendStudentEmails() {
    function validateEmail(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [input, setInput] = useState('');
    const [emails, setEmails] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<null | {
        total_emails: number;
        queued: number;
        failed: number;
        invalid: number;
    }>(null);
    const [warning, setWarning] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setWarning('');
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addEmail(input.trim());
        } else if (e.key === ' ') {
            setWarning('Separate emails with a comma.');
        }
    };

    const addEmail = (email: string) => {
        if (!email) return;
        if (email.includes(' ')) {
            setWarning('Separate emails with a comma.');
            return;
        }
        if (!validateEmail(email)) {
            setWarning('Invalid email address.');
            return;
        }
        if (emails.includes(email)) {
            setWarning('Email already added.');
            return;
        }
        setEmails([...emails, email]);
        setInput('');
        setWarning('');
    };

    const removeEmail = (email: string) => {
        setEmails(emails.filter(e => e !== email));
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text');
        const split = pasted.split(',').map(s => s.trim()).filter(Boolean);
        let anyInvalid = false;
        let anySpace = false;
        split.forEach(email => {
            if (email.includes(' ')) anySpace = true;
            else if (!validateEmail(email)) anyInvalid = true;
        });
        if (anySpace) setWarning('Separate emails with a comma.');
        else if (anyInvalid) setWarning('One or more emails are invalid.');
        else {
            setEmails([...emails, ...split.filter(email => !emails.includes(email))]);
            setWarning('');
        }
        setInput('');
        e.preventDefault();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setWarning('');
        if (input.trim()) {
            addEmail(input.trim());
            if (!validateEmail(input.trim())) return;
        }
        if (emails.length === 0) {
            setWarning('Please enter at least one valid email.');
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/send-student-emails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                },
                body: JSON.stringify({ subject, message, emails: emails.join(',') }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setResult(data.data);
                toast.success(data.message || 'Emails queued successfully!');
                setEmails([]);
                setInput('');
            } else {
                toast.error(data.message || 'Failed to send emails');
            }
        } catch (err) {
            toast.error('Network or server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="mx-auto py-10">
                    <h1 className="text-2xl font-bold mb-4">Send Email Notification to Students</h1>
                    <p className="mb-4 text-sm text-gray-600">
                        Enter multiple student emails separated by a comma (e.g. <span className="font-mono">student1@example.com,student2@example.com</span>).
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
                        <div>
                            <label className="block text-sm font-medium mb-1">Subject</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea
                                className="input w-full min-h-[120px]"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Emails</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {emails.map(email => (
                                    <span key={email} className="inline-flex items-center bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded-full px-3 py-1 text-xs font-medium">
                                        {email}
                                        <button type="button" className="ml-2 text-blue-500 hover:text-red-500" onClick={() => removeEmail(email)}>
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                className="input w-full"
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleInputKeyDown}
                                onPaste={handlePaste}
                                placeholder="Type email and press Enter or comma"
                            />
                            {warning && <div className="text-xs text-red-500 mt-1">{warning}</div>}
                            <span className="text-xs text-gray-500">Separate multiple emails with a comma or press Enter after each.</span>
                        </div>
                        <button
                            type="submit"
                            className="btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Emails'}
                        </button>
                    </form>
                    {/* Result display removed as per user request; toast notification is sufficient */}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
