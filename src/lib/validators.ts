import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// User schemas
export const createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
    roles: z.array(z.string()).optional(),
    is_active: z.boolean().optional(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
    password_confirmation: z.string().optional().or(z.literal('')),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
    roles: z.array(z.string()).optional(),
    is_active: z.boolean().optional(),
}).refine((data) => {
    if (data.password && data.password !== '') {
        return data.password === data.password_confirmation;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
});


export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// Role schemas
export const createRoleSchema = z.object({
    name: z.string().min(2, 'Role name must be at least 2 characters'),
    description: z.string().optional(),
    permissions: z.array(z.number()).optional(),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
    name: z.string().min(2, 'Role name must be at least 2 characters').optional(),
    description: z.string().optional(),
    permissions: z.array(z.number()).optional(),
});

export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

// Application schemas
export const educationSchema = z.object({
    id: z.number().optional(),
    institution_name: z.string().min(1, 'Institution name is required'),
    degree_type: z.string().min(1, 'Degree type is required'),
    field_of_study: z.string().min(1, 'Field of study is required'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional().nullable(),
    grade: z.string().optional().nullable(),
    certificate: z.string().optional().nullable(),
});

export type EducationFormData = z.infer<typeof educationSchema>;

export const experienceSchema = z.object({
    id: z.number().optional(),
    company_name: z.string().min(1, 'Company name is required'),
    job_title: z.string().min(1, 'Job title is required'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional().nullable(),
    is_current: z.boolean().optional(),
    responsibilities: z.string().optional().nullable(),
    reference_letter: z.string().optional().nullable(),
});

export type ExperienceFormData = z.infer<typeof experienceSchema>;

export const referenceSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    company_organization: z.string().min(1, 'Company/Organization is required'),
    position: z.string().min(1, 'Position is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone is required'),
    reference_letter: z.string().optional().nullable(),
});

export type ReferenceFormData = z.infer<typeof referenceSchema>;

export const certificationSchema = z.object({
    id: z.number().optional(),
    certification_name: z.string().min(1, 'Certification name is required'),
    issuing_organization: z.string().min(1, 'Issuing organization is required'),
    issue_date: z.string().min(1, 'Issue date is required'),
    expiry_date: z.string().optional().nullable(),
    certificate: z.string().optional().nullable(),
});

export type CertificationFormData = z.infer<typeof certificationSchema>;

export const createApplicationSchema = z.object({
    // Personal Information
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone is required'),
    position_applied_for: z.string().min(1, 'Position is required'),
    form_of_address: z.enum(['Mr', 'Mrs', 'Miss', 'Dr', 'Prof']),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    other_name: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other']),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    nationality: z.string().min(1, 'Nationality is required'),
    marital_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
    state_of_origin: z.string().min(1, 'State of origin is required'),
    home_town: z.string().min(1, 'Home town is required'),
    lga: z.string().min(1, 'LGA is required'),
    residential_address: z.string().min(1, 'Residential address is required'),
    position_type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
    preferred_start_date: z.string().min(1, 'Preferred start date is required'),
    how_did_you_hear: z.string().optional(),

    // Arrays
    educational_backgrounds: z.array(educationSchema).min(1, 'At least one education entry is required'),
    work_experiences: z.array(experienceSchema).optional(),
    references: z.array(referenceSchema).min(1, 'At least one reference is required'),
    professional_certifications: z.array(certificationSchema).optional(),
});

export type CreateApplicationFormData = z.infer<typeof createApplicationSchema>;

export const updateApplicationAdminSchema = z.object({
    status: z.enum(['pending', 'reviewing', 'accepted', 'rejected']).optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    position_applied_for: z.string().optional(),
    // Add other fields as needed
});

export type UpdateApplicationAdminFormData = z.infer<typeof updateApplicationAdminSchema>;

export const updateApplicationOwnerSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    position_applied_for: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    other_name: z.string().optional(),
    // Cannot update status
});

export type UpdateApplicationOwnerFormData = z.infer<typeof updateApplicationOwnerSchema>;

// ============================================
// ADMISSION MANAGEMENT SCHEMAS
// ============================================

// Screening schemas
export const createScreeningSchema = z.object({
    screening_type: z.string().min(1, 'Screening type is required'),
    screening_date: z.string().min(1, 'Screening date is required'),
    venue: z.string().min(1, 'Venue is required'),
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
    description: z.string().optional(),
    max_participants: z.number().min(1, 'Maximum participants must be at least 1').optional(),
});

export type CreateScreeningFormData = z.infer<typeof createScreeningSchema>;

export const updateScreeningSchema = z.object({
    screening_type: z.string().min(1, 'Screening type is required').optional(),
    screening_date: z.string().optional(),
    venue: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
    description: z.string().optional(),
    max_participants: z.number().min(1, 'Maximum participants must be at least 1').optional(),
});

export type UpdateScreeningFormData = z.infer<typeof updateScreeningSchema>;

// Admission schemas
export const createAdmissionSchema = z.object({
    applicant_name: z.string().min(1, 'Applicant name is required'),
    applicant_email: z.string().email('Invalid email address'),
    applicant_phone: z.string().min(1, 'Phone is required'),
    programme: z.string().min(1, 'Programme is required'),
    admission_status: z.enum(['pending', 'admitted', 'rejected', 'waitlisted']).optional(),
    screening_score: z.number().min(0, 'Score must be 0 or greater').optional(),
    interview_date: z.string().optional(),
    remarks: z.string().optional(),
    faculty_id: z.number().min(1, 'Faculty is required').optional(),
    department_id: z.number().min(1, 'Department is required').optional(),
    mode_of_entry_id: z.number().min(1, 'Mode of entry is required').optional(),
});

export type CreateAdmissionFormData = z.infer<typeof createAdmissionSchema>;

export const updateAdmissionSchema = z.object({
    applicant_name: z.string().min(1, 'Applicant name is required').optional(),
    applicant_email: z.string().email('Invalid email address').optional(),
    applicant_phone: z.string().optional(),
    programme: z.string().optional(),
    admission_status: z.enum(['pending', 'admitted', 'rejected', 'waitlisted']).optional(),
    screening_score: z.number().min(0, 'Score must be 0 or greater').optional(),
    interview_date: z.string().optional(),
    remarks: z.string().optional(),
    faculty_id: z.number().min(1, 'Faculty is required').optional(),
    department_id: z.number().min(1, 'Department is required').optional(),
    mode_of_entry_id: z.number().min(1, 'Mode of entry is required').optional(),
});

export type UpdateAdmissionFormData = z.infer<typeof updateAdmissionSchema>;

// Faculty schemas
export const createFacultySchema = z.object({
    name: z.string().min(2, 'Faculty name must be at least 2 characters'),
    code: z.string().min(1, 'Faculty code is required'),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
});

export type CreateFacultyFormData = z.infer<typeof createFacultySchema>;

export const updateFacultySchema = z.object({
    name: z.string().min(2, 'Faculty name must be at least 2 characters').optional(),
    code: z.string().min(1, 'Faculty code is required').optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
});

export type UpdateFacultyFormData = z.infer<typeof updateFacultySchema>;

// Department schemas
export const createDepartmentSchema = z.object({
    name: z.string().min(2, 'Department name must be at least 2 characters'),
    code: z.string().min(1, 'Department code is required'),
    faculty_id: z.number().min(1, 'Faculty is required'),
    description: z.string().optional(),
});

export type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = z.object({
    name: z.string().min(2, 'Department name must be at least 2 characters').optional(),
    code: z.string().min(1, 'Department code is required').optional(),
    faculty_id: z.number().min(1, 'Faculty is required').optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
});

export type UpdateDepartmentFormData = z.infer<typeof updateDepartmentSchema>;

// Mode of Entry schemas
export const createModeOfEntrySchema = z.object({
    name: z.string().min(2, 'Mode of entry name must be at least 2 characters'),
    code: z.string().min(1, 'Mode of entry code is required'),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
});

export type CreateModeOfEntryFormData = z.infer<typeof createModeOfEntrySchema>;

export const updateModeOfEntrySchema = z.object({
    name: z.string().min(2, 'Mode of entry name must be at least 2 characters').optional(),
    code: z.string().min(1, 'Mode of entry code is required').optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
});

export type UpdateModeOfEntryFormData = z.infer<typeof updateModeOfEntrySchema>;

// Program schemas
export const createProgramSchema = z.object({
    department_id: z.number().min(1, 'Department is required'),
    name: z.string().min(2, 'Program name must be at least 2 characters'),
    code: z.string().min(1, 'Program code is required'),
    description: z.string().optional(),
    duration: z.number().min(1, 'Duration must be at least 1 year'),
    degree_type: z.string().min(1, 'Degree type is required'),
    is_active: z.boolean().optional(),
});

export type CreateProgramFormData = z.infer<typeof createProgramSchema>;

export const updateProgramSchema = z.object({
    department_id: z.number().min(1, 'Department is required').optional(),
    name: z.string().min(2, 'Program name must be at least 2 characters').optional(),
    code: z.string().min(1, 'Program code is required').optional(),
    description: z.string().optional(),
    duration: z.number().min(1, 'Duration must be at least 1 year').optional(),
    degree_type: z.string().min(1, 'Degree type is required').optional(),
    is_active: z.boolean().optional(),
});

export type UpdateProgramFormData = z.infer<typeof updateProgramSchema>;
