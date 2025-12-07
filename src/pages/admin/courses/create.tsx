import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CourseForm from '@/components/CourseForm';
import { useCreateCourse } from '@/lib/queries';
import type { CreateCourseFormData, UpdateCourseFormData } from '@/lib/validators';

export default function CreateCoursePage() {
    const router = useRouter();
    const createCourseMutation = useCreateCourse();

    const handleSubmit = async (data: CreateCourseFormData | UpdateCourseFormData) => {
        try {
            await createCourseMutation.mutateAsync(data as CreateCourseFormData);
            router.push('/admin/courses');
        } catch (error) {
            console.error('Create course error:', error);
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Course</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Add a new course to the catalog
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <CourseForm
                            onSubmit={handleSubmit}
                            isLoading={createCourseMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
