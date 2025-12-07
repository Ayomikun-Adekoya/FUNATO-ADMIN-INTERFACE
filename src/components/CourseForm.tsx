import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCourseSchema, updateCourseSchema, CreateCourseFormData, UpdateCourseFormData } from '@/lib/validators';
import { useFaculties, useDepartments, usePrograms } from '@/lib/queries';
import type { Course } from '@/types/api';

interface CourseFormProps {
    course?: Course;
    onSubmit: (data: CreateCourseFormData | UpdateCourseFormData) => void | Promise<void>;
    isLoading?: boolean;
}

export default function CourseForm({ course, onSubmit, isLoading = false }: CourseFormProps) {
    const isEditing = !!course;
    const [selectedFaculty, setSelectedFaculty] = useState<number | undefined>(course?.faculty_id);
    const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>(course?.department_id);
    const [isActive, setIsActive] = useState(course ? course.status === 'active' : true);

    const { data: facultiesData } = useFaculties();
    const { data: departmentsData } = useDepartments({ faculty_id: selectedFaculty });
    const { data: programsData } = usePrograms({ department_id: selectedDepartment });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CreateCourseFormData | UpdateCourseFormData>({
        resolver: zodResolver(isEditing ? updateCourseSchema : createCourseSchema),
        defaultValues: course
            ? {
                code: course.code,
                title: course.title,
                unit: course.unit,
                status: course.status,
                level: course.level,
                semester: course.semester,
                description: course.description || '',
                is_elective: course.is_elective,
                program_id: course.program_id,
                department_id: course.department_id,
                faculty_id: course.faculty_id,
            }
            : {
                code: '',
                title: '',
                unit: 3,
                status: 'active',
                level: '100',
                semester: 'first',
                description: '',
                is_elective: false,
                program_id: undefined,
                department_id: undefined,
                faculty_id: undefined,
            },
    });

    // Update department options when faculty changes
    useEffect(() => {
        if (selectedFaculty !== course?.faculty_id) {
            setValue('department_id', 0);
            setValue('program_id', 0);
        }
    }, [selectedFaculty, course?.faculty_id, setValue]);

    // Update program options when department changes
    useEffect(() => {
        if (selectedDepartment !== course?.department_id) {
            setValue('program_id', 0);
        }
    }, [selectedDepartment, course?.department_id, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Code */}
                <div>
                    <label htmlFor="code" className="label">
                        Course Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('code')}
                        id="code"
                        type="text"
                        placeholder="e.g., CSC101"
                        className="input uppercase"
                    />
                    {errors.code && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code.message}</p>}
                </div>

                {/* Course Title */}
                <div>
                    <label htmlFor="title" className="label">
                        Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('title')}
                        id="title"
                        type="text"
                        placeholder="e.g., Introduction to Computer Science"
                        className="input"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>}
                </div>

                {/* Unit */}
                <div>
                    <label htmlFor="unit" className="label">
                        Unit <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('unit', { valueAsNumber: true })}
                        id="unit"
                        type="number"
                        min="1"
                        max="10"
                        placeholder="e.g., 3"
                        className="input"
                    />
                    {errors.unit && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unit.message}</p>}
                </div>

                {/* Level */}
                <div>
                    <label htmlFor="level" className="label">
                        Level <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('level')}
                        id="level"
                        className="input"
                    >
                        <option value="">Select Level</option>
                        <option value="100">100 Level</option>
                        <option value="200">200 Level</option>
                        <option value="300">300 Level</option>
                        <option value="400">400 Level</option>
                        <option value="500">500 Level</option>
                        <option value="600">600 Level</option>
                        <option value="700">700 Level</option>
                        <option value="800">800 Level</option>
                    </select>
                    {errors.level && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.level.message}</p>}
                </div>

                {/* Semester */}
                <div>
                    <label htmlFor="semester" className="label">
                        Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('semester')}
                        id="semester"
                        className="input"
                    >
                        <option value="">Select Semester</option>
                        <option value="first">First Semester</option>
                        <option value="second">Second Semester</option>
                    </select>
                    {errors.semester && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.semester.message}</p>}
                </div>

                {/* Faculty */}
                <div>
                    <label htmlFor="faculty_id" className="label">
                        College <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('faculty_id', {
                            valueAsNumber: true,
                            onChange: (e) => {
                                const value = e.target.value ? Number(e.target.value) : undefined;
                                setSelectedFaculty(value);
                                setSelectedDepartment(undefined);
                            }
                        })}
                        id="faculty_id"
                        className="input"
                    >
                        <option value="">Select College</option>
                        {facultiesData?.data.map((faculty) => (
                            <option key={faculty.id} value={faculty.id}>
                                {faculty.name}
                            </option>
                        ))}
                    </select>
                    {errors.faculty_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.faculty_id.message}</p>}
                </div>

                {/* Department */}
                <div>
                    <label htmlFor="department_id" className="label">
                        Department <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('department_id', {
                            valueAsNumber: true,
                            onChange: (e) => setSelectedDepartment(e.target.value ? Number(e.target.value) : undefined)
                        })}
                        id="department_id"
                        className="input"
                        disabled={!selectedFaculty}
                    >
                        <option value="">Select Department</option>
                        {departmentsData?.data.map((department) => (
                            <option key={department.id} value={department.id}>
                                {department.name}
                            </option>
                        ))}
                    </select>
                    {errors.department_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.department_id.message}</p>}
                </div>

                {/* Program */}
                <div>
                    <label htmlFor="program_id" className="label">
                        Program <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('program_id', { valueAsNumber: true })}
                        id="program_id"
                        className="input"
                        disabled={!selectedDepartment}
                    >
                        <option value="">Select Program</option>
                        {programsData?.data.map((program) => (
                            <option key={program.id} value={program.id}>
                                {program.name}
                            </option>
                        ))}
                    </select>
                    {errors.program_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.program_id.message}</p>}
                </div>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="label">
                    Description
                </label>
                <textarea
                    {...register('description')}
                    id="description"
                    rows={4}
                    placeholder="Enter course description (optional)"
                    className="input resize-none"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
            </div>

            {/* Course Type - Elective/Core */}
            <div>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        {...register('is_elective')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Elective Course
                    </span>
                </label>
                <p className="mt-1 text-sm text-gray-500">
                    Check this box if the course is an elective (otherwise it&apos;s a core course)
                </p>
            </div>

            {/* Active Status Toggle - Only show when editing */}
            {isEditing && (
                <div>
                    <label className="flex items-center justify-between">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Active Status
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                const newStatus = isActive ? 'inactive' : 'active';
                                setValue('status', newStatus);
                                setIsActive(!isActive);
                            }}
                            className={`${isActive ? 'bg-primary-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            role="switch"
                            aria-checked={isActive}
                        >
                            <span
                                className={`${isActive ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                        </button>
                    </label>
                    <p className="mt-1 text-sm text-gray-500">
                        {isActive ? 'Course is active' : 'Course is inactive'}
                    </p>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="btn-secondary"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        <>{isEditing ? 'Update Course' : 'Create Course'}</>
                    )}
                </button>
            </div>
        </form>
    );
}
