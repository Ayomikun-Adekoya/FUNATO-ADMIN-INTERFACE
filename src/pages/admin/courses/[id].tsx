import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CourseForm from '@/components/CourseForm';
import { useCourse, useUpdateCourse } from '@/lib/queries';
import type { UpdateCourseFormData } from '@/lib/validators';

export default function EditCoursePage() {
    const router = useRouter();
    const { id } = router.query;
    const courseId = Number(id);

    const { data: course, isLoading } = useCourse(courseId);
    const updateCourseMutation = useUpdateCourse();

    const handleSubmit = async (data: UpdateCourseFormData) => {
        try {
            await updateCourseMutation.mutateAsync({ id: courseId, data });
            router.push('/admin/courses');
        } catch (error) {
            console.error('Update course error:', error);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </Layout>
        );
    }

    if (!course) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course not found</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        The course you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <button
                        onClick={() => router.push('/admin/courses')}
                        className="mt-4 btn-primary"
                    >
                        Back to Courses
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Course</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Update course information for {course.code}
                        </p>
                    </div>

                    {/* Course Details Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Current Course Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Course Code:</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{course.code}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Title:</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{course.title}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Program:</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {course.program?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Department:</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {course.department?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">College:</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {course.faculty?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Level:</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{course.level} Level</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Semester:</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {course.semester === 'first' ? 'First' : 'Second'} Semester
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Unit:</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {course.unit} {course.unit === 1 ? 'Unit' : 'Units'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {course.is_elective ? 'Elective' : 'Core'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            {course.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            {course.description && (
                                <div className="mt-4">
                                    <span className="text-gray-500 dark:text-gray-400">Description:</span>
                                    <p className="mt-1 text-gray-900 dark:text-gray-100">{course.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        <CourseForm
                            course={course}
                            onSubmit={handleSubmit}
                            isLoading={updateCourseMutation.isPending}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
