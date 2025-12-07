import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useCourses, useDeleteCourse, useFaculties, useDepartments, usePrograms } from '@/lib/queries';
import { formatDate } from '@/utils/date';
import type { Course } from '@/types/api';

export default function CoursesListPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [facultyFilter, setFacultyFilter] = useState<number | undefined>();
    const [departmentFilter, setDepartmentFilter] = useState<number | undefined>();
    const [programFilter, setProgramFilter] = useState<number | undefined>();
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | undefined>();
    const [levelFilter, setLevelFilter] = useState<string | undefined>();
    const [semesterFilter, setSemesterFilter] = useState<'first' | 'second' | undefined>();
    const [electiveFilter, setElectiveFilter] = useState<boolean | undefined>();
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; course: Course | null }>({
        open: false,
        course: null,
    });

    const { data, isLoading } = useCourses({
        page,
        per_page: perPage,
        search,
        faculty_id: facultyFilter,
        department_id: departmentFilter,
        program_id: programFilter,
        status: statusFilter,
        level: levelFilter as '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | undefined,
        semester: semesterFilter,
        is_elective: electiveFilter,
    });
    const deleteMutation = useDeleteCourse();

    const { data: facultiesData } = useFaculties();
    const { data: departmentsData } = useDepartments({ faculty_id: facultyFilter });
    const { data: programsData } = usePrograms({ department_id: departmentFilter });

    const handleDelete = async () => {
        if (!deleteModal.course) return;

        try {
            await deleteMutation.mutateAsync(deleteModal.course.id);
            setDeleteModal({ open: false, course: null });
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setFacultyFilter(undefined);
        setDepartmentFilter(undefined);
        setProgramFilter(undefined);
        setStatusFilter(undefined);
        setLevelFilter(undefined);
        setSemesterFilter(undefined);
        setElectiveFilter(undefined);
        setPage(1);
    };

    const columns = [
        {
            key: 'code',
            header: 'Course Code',
            render: (course: Course) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{course.code}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {course.level} Level - {course.semester === 'first' ? 'First' : 'Second'} Semester
                    </div>
                </div>
            ),
        },
        {
            key: 'title',
            header: 'Course Title',
            render: (course: Course) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{course.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{course.unit} {course.unit === 1 ? 'Unit' : 'Units'}</div>
                </div>
            ),
        },
        {
            key: 'program',
            header: 'Program',
            render: (course: Course) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {course.program?.name || 'N/A'}
                </span>
            ),
        },
        {
            key: 'department',
            header: 'Department',
            render: (course: Course) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {course.department?.name || 'N/A'}
                </span>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            render: (course: Course) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.is_elective
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}
                >
                    {course.is_elective ? 'Elective' : 'Core'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (course: Course) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                >
                    {course.status === 'active' ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Created',
            render: (course: Course) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(course.created_at)}</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (course: Course) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/courses/${course.id}`}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => setDeleteModal({ open: true, course })}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Courses</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Manage course catalog
                            </p>
                        </div>
                        <Link href="/admin/courses/create" className="btn-primary">
                            Create Course
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                        {/* Search Bar */}
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search Courses
                            </label>
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by course code, title, or description..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="input w-full"
                            />
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Faculty Filter */}
                            <div>
                                <label htmlFor="faculty-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    College
                                </label>
                                <select
                                    id="faculty-filter"
                                    value={facultyFilter || ''}
                                    onChange={(e) => {
                                        setFacultyFilter(e.target.value ? Number(e.target.value) : undefined);
                                        setDepartmentFilter(undefined);
                                        setProgramFilter(undefined);
                                        setPage(1);
                                    }}
                                    className="input w-full"
                                >
                                    <option value="">All Colleges</option>
                                    {facultiesData?.data.map((faculty) => (
                                        <option key={faculty.id} value={faculty.id}>
                                            {faculty.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Department Filter */}
                            <div>
                                <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Department
                                </label>
                                <select
                                    id="department-filter"
                                    value={departmentFilter || ''}
                                    onChange={(e) => {
                                        setDepartmentFilter(e.target.value ? Number(e.target.value) : undefined);
                                        setProgramFilter(undefined);
                                        setPage(1);
                                    }}
                                    className="input w-full"
                                    disabled={!facultyFilter}
                                >
                                    <option value="">All Departments</option>
                                    {departmentsData?.data.map((department) => (
                                        <option key={department.id} value={department.id}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Program Filter */}
                            <div>
                                <label htmlFor="program-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Program
                                </label>
                                <select
                                    id="program-filter"
                                    value={programFilter || ''}
                                    onChange={(e) => {
                                        setProgramFilter(e.target.value ? Number(e.target.value) : undefined);
                                        setPage(1);
                                    }}
                                    className="input w-full"
                                    disabled={!departmentFilter}
                                >
                                    <option value="">All Programs</option>
                                    {programsData?.data.map((program) => (
                                        <option key={program.id} value={program.id}>
                                            {program.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    id="status-filter"
                                    value={statusFilter || ''}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value ? e.target.value as 'active' | 'inactive' : undefined);
                                        setPage(1);
                                    }}
                                    className="input w-full"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Level Filter */}
                            <div>
                                <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Level
                                </label>
                                <select
                                    id="level-filter"
                                    value={levelFilter || ''}
                                    onChange={(e) => {
                                        setLevelFilter(e.target.value || undefined);
                                        setPage(1);
                                    }}
                                    className="input w-full"
                                >
                                    <option value="">All Levels</option>
                                    <option value="100">100 Level</option>
                                    <option value="200">200 Level</option>
                                    <option value="300">300 Level</option>
                                    <option value="400">400 Level</option>
                                    <option value="500">500 Level</option>
                                    <option value="600">600 Level</option>
                                    <option value="700">700 Level</option>
                                    <option value="800">800 Level</option>
                                </select>
                            </div>

                            {/* Semester Filter */}
                            <div>
                                <label htmlFor="semester-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Semester
                                </label>
                                <select
                                    id="semester-filter"
                                    value={semesterFilter || ''}
                                    onChange={(e) => {
                                        setSemesterFilter(e.target.value ? e.target.value as 'first' | 'second' : undefined);
                                        setPage(1);
                                    }}
                                    className="input w-full"
                                >
                                    <option value="">All Semesters</option>
                                    <option value="first">First Semester</option>
                                    <option value="second">Second Semester</option>
                                </select>
                            </div>

                            {/* Course Type Filter */}
                            <div>
                                <label htmlFor="elective-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Course Type
                                </label>
                                <select
                                    id="elective-filter"
                                    value={electiveFilter === undefined ? '' : electiveFilter ? 'true' : 'false'}
                                    onChange={(e) => {
                                        setElectiveFilter(e.target.value === '' ? undefined : e.target.value === 'true');
                                        setPage(1);
                                    }}
                                    className="input w-full"
                                >
                                    <option value="">All Types</option>
                                    <option value="false">Core</option>
                                    <option value="true">Elective</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        {(search || facultyFilter || departmentFilter || programFilter || statusFilter || levelFilter || semesterFilter || electiveFilter !== undefined) && (
                            <div className="flex justify-end">
                                <button
                                    onClick={handleClearFilters}
                                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <Table columns={columns} data={data?.data || []} isLoading={isLoading} />

                        {/* Pagination */}
                        {data && data.data.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <Pagination
                                    currentPage={data.current_page}
                                    totalPages={data.last_page}
                                    perPage={perPage}
                                    total={data.total}
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

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={deleteModal.open}
                    onClose={() => setDeleteModal({ open: false, course: null })}
                    title="Delete Course"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete the course <strong>{deleteModal.course?.code} - {deleteModal.course?.title}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, course: null })}
                                className="btn-secondary"
                                disabled={deleteMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn-danger"
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </Layout>
        </ProtectedRoute>
    );
}
