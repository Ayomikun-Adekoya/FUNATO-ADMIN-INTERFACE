import { toast } from 'react-toastify';

export default function CreateApplicationPage() {
    const handleSubmit = async () => {
        try {
            await createApplicationMutation.mutateAsync({ applicantId, programId });
            toast.success('Application created successfully!');
        } catch (error) {
            toast.error('Failed to create application. Please try again.');
        }
    };

    return (
    // ...existing code...
  );
}