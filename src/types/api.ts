// API Response wrapper types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: true;
    message: string;
    data: {
        admin: AuthUser;
        token: string;
        token_type: string;
    };
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    permissions?: Permission[];
}

// User Management types
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    roles?: Role[];
}

export interface CreateUserRequest {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    roles?: string[];
    is_active?: boolean;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    password_confirmation?: string;
    roles?: string[];
    is_active?: boolean;
}

export interface AssignRoleRequest {
    role_id: number;
}

// Role & Permission types
export interface Role {
    id: number;
    name: string;
    guard_name?: string;
    description?: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    guard_name?: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateRoleRequest {
    name: string;
    description?: string;
    permissions?: number[];
}

export interface UpdateRoleRequest {
    name?: string;
    description?: string;
    permissions?: number[];
}

// Recruitment Application types
export interface Application {
    id: number;
    email: string;
    phone: string;
    applicant_id?: string | null;
    position_applied_for: string;
    form_of_address: 'Mr' | 'Mrs' | 'Miss' | 'Dr' | 'Prof';
    first_name: string;
    last_name: string;
    other_name?: string | null;
    gender: 'Male' | 'Female' | 'Other';
    date_of_birth: string;
    nationality: string;
    marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    state_of_origin: string;
    home_town: string;
    lga: string;
    residential_address: string;
    position_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Academic' | 'Non-Academic' | 'Volunteer';
    preferred_start_date: string;
    how_did_you_hear?: string | null;
    college?: string | null;
    department?: string | null;
    status?: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
    created_at: string;
    updated_at: string;
    educational_backgrounds?: Education[];
    work_experiences?: Experience[];
    references?: Reference[];
    professional_certifications?: Certification[];
    documents?: ApplicationDocument[];
}

export interface Education {
    id?: number;
    institution_name: string;
    certificate_obtained?: string | null;
    class_of_degree?: string | null;
    year_attained?: string | null;
    document_path?: string | null;
}

export interface Experience {
    id?: number;
    organization_name: string;
    job_title: string;
    start_date: string; // ISO string
    end_date?: string | null; // ISO string or null
    responsibility?: string | null;
}

export interface Reference {
    id?: number;
    full_name: string;
    referee_name?: string | null;
    email?: string | null;
    professional_email?: string | null;
    job_title?: string | null;
    referee_institution?: string | null;
    relationship: string;
    phone: string;
    contact_address?: string | null;
    how_long_known?: string | null;
    assessment?: string | null;
    professional_competence?: string | null;
    reliability_integrity?: string | null;
    communication_skills?: string | null;
    applicant_strength?: string | null;
    confidentiality_consent?: boolean | null;
    recommendation?: string | null;
    optional_letter?: string | null;
    submitted_at?: string | null;
}

export interface Certification {
    id?: number;
    certification_name: string;
    issuing_organization: string;
    issuing_body: string;
    certificate_title: string;
    certificate?: string | null; // file path or URL
    date_obtained?: string | null;
    expiry_date?: string | null;
}

export interface ApplicationDocument {
    id: number;
    application_id: number;
    document_type: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    size: number;
    file_size?: string | null;
    created_at: string;
    updated_at: string;
}

// Application submission (multipart/form-data)
export interface CreateApplicationRequest {
    // Personal Information
    email: string;
    phone: string;
    position_applied_for: string;
    form_of_address: string;
    first_name: string;
    last_name: string;
    other_name?: string;
    gender: string;
    date_of_birth: string;
    nationality: string;
    marital_status: string;
    state_of_origin: string;
    home_town: string;
    lga: string;
    residential_address: string;
    position_type: string;
    preferred_start_date: string;
    how_did_you_hear?: string;
    college?: string;
    department?: string;

    // Documents (files)
    passport_photograph?: File;
    cv?: File;
    cover_letter?: File;
    birth_certificate?: File;

    // Educational backgrounds (JSON string or array)
    educational_backgrounds?: string | Education[];
    work_experiences?: string | Experience[];
    references?: string | Reference[];
    professional_certifications?: string | Certification[];
}

// Admin update (can change status)
export interface UpdateApplicationAdminRequest {
    status?: 'pending' | 'reviewing' | 'accepted' | 'rejected';
    email?: string;
    phone?: string;
    position_applied_for?: string;
    college?: string | null;
    department?: string | null;
    college_id?: number | null;
    department_id?: number | null;
    [key: string]: unknown;
}

// Owner update (cannot change status)
export interface UpdateApplicationOwnerRequest {
    email?: string;
    phone?: string;
    position_applied_for?: string;
    first_name?: string;
    last_name?: string;
    other_name?: string;
    // ... other fields except status
    [key: string]: unknown;
}

// Query parameters
export interface ApplicationQueryParams {
    status?: string;
    position_type?: string;
    search?: string;
    per_page?: number;
    page?: number;
}

// Normalized response for handling both paginated and non-paginated API responses
export interface NormalizedApplicationResponse {
    data: Application[];
    meta?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export interface UserQueryParams {
    search?: string;
    status?: string;
    per_page?: number;
    page?: number;
}

export interface RoleQueryParams {
    search?: string;
    per_page?: number;
    page?: number;
}

// Error response
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}

// ============================================
// FUNATO API TYPES (SMS, Email, Communication)
// ============================================

// SMS Types
export interface FunatoSendSmsRequest {
    phone_number: string;
    message: string;
    sender_id?: string;
    schedule_time?: string; // ISO 8601 format
}

export interface FunatoSmsResponse {
    id: string;
    status: 'sent' | 'pending' | 'failed' | 'delivered';
    phone_number: string;
    message: string;
    sender_id?: string;
    timestamp: string;
    cost?: number;
}

export interface FunatoSmsStatusResponse {
    id: string;
    status: 'sent' | 'pending' | 'failed' | 'delivered';
    phone_number: string;
    timestamp: string;
    delivered_at?: string;
}

export type FunatoSmsHistoryResponse = PaginatedResponse<FunatoSmsResponse>;

// Email Types
export interface FunatoSendEmailRequest {
    to: string | string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
    reply_to?: string;
    html?: boolean;
    attachments?: Array<{
        filename: string;
        content: string; // base64
        content_type?: string;
    }>;
}

export interface FunatoEmailResponse {
    id: string;
    status: 'sent' | 'pending' | 'failed' | 'delivered';
    to: string[];
    subject: string;
    timestamp: string;
}

export interface FunatoEmailStatusResponse {
    id: string;
    status: 'sent' | 'pending' | 'failed' | 'delivered' | 'opened' | 'clicked';
    to: string;
    timestamp: string;
    opened_at?: string;
    clicked_at?: string;
}

// Voice/Call Types
export interface FunatoMakeCallRequest {
    phone_number: string;
    message?: string; // TTS message
    voice?: 'male' | 'female';
    language?: string;
    schedule_time?: string;
}

export interface FunatoCallResponse {
    id: string;
    status: 'initiated' | 'ringing' | 'connected' | 'completed' | 'failed';
    phone_number: string;
    timestamp: string;
    duration?: number;
}

// Account/Balance Types
export interface FunatoBalanceResponse {
    balance: number;
    currency: string;
    credits: number;
    status: 'active' | 'suspended' | 'inactive';
}

export interface FunatoAccountInfoResponse {
    account_id: string;
    account_name: string;
    email: string;
    phone: string;
    country: string;
    timezone: string;
    created_at: string;
}

// Contact Management
export interface FunatoContact {
    id: string;
    name: string;
    phone_number: string;
    email?: string;
    group?: string;
    custom_fields?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface FunatoCreateContactRequest {
    name: string;
    phone_number: string;
    email?: string;
    group?: string;
    custom_fields?: Record<string, unknown>;
}

export interface FunatoUpdateContactRequest {
    name?: string;
    email?: string;
    group?: string;
    custom_fields?: Record<string, unknown>;
}

export type FunatoContactListResponse = PaginatedResponse<FunatoContact>;

// Campaign Types
export interface FunatoCampaign {
    id: string;
    name: string;
    type: 'sms' | 'email' | 'voice';
    status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
    recipients: number;
    sent: number;
    delivered: number;
    failed: number;
    scheduled_at?: string;
    started_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface FunatoCreateCampaignRequest {
    name: string;
    type: 'sms' | 'email' | 'voice';
    message: string;
    recipients: string[]; // phone numbers or emails
    sender_id?: string;
    scheduled_at?: string;
    template_id?: string;
}

export interface FunatoCampaignStatsResponse {
    campaign_id: string;
    name: string;
    type: string;
    total_recipients: number;
    sent: number;
    delivered: number;
    failed: number;
    bounced?: number;
    clicked?: number;
    opened?: number;
    unsubscribed?: number;
    success_rate: number;
    error_rate: number;
}

// Template Types
export interface FunatoTemplate {
    id: string;
    name: string;
    type: 'sms' | 'email';
    content: string;
    variables?: string[];
    created_at: string;
    updated_at: string;
}

export interface FunatoCreateTemplateRequest {
    name: string;
    type: 'sms' | 'email';
    content: string;
}

// Webhook/Callback Types
export interface FunatoSmsWebhook {
    message_id: string;
    phone_number: string;
    status: string;
    timestamp: string;
    cost?: number;
    error_code?: string;
    error_message?: string;
}

export interface FunatoEmailWebhook {
    message_id: string;
    email: string;
    event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
    timestamp: string;
    data?: Record<string, unknown>;
}

// Query parameters
export interface FunatoSmsQueryParams {
    status?: string;
    from_date?: string;
    to_date?: string;
    phone_number?: string;
    per_page?: number;
    page?: number;
}

export interface FunataContactQueryParams {
    group?: string;
    search?: string;
    per_page?: number;
    page?: number;
}

export interface FunatoCampaignQueryParams {
    status?: string;
    type?: string;
    per_page?: number;
    page?: number;
}

// ============================================
// ADMISSION MANAGEMENT TYPES
// ============================================

// Screening Types
export interface Screening {
    id: number;
    admission_application_id: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    notes?: string | null;
    screening_data: {
        scheduled_date: string;
        venue: string;
    };
    created_at: string;
    updated_at: string;
    admission_application: {
        id: number;
        application_number: string;
        student: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
            jamb_registration: string;
        };
        programme: {
            id: number;
            name: string;
        };
        faculty: {
            id: number;
            name: string;
        };
        department: {
            id: number;
            name: string;
        };
    };
    admin?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface CreateScreeningRequest {
    admission_application_id: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    notes?: string;
    screening_data: {
        scheduled_date: string;
        venue: string;
    };
}

export interface UpdateScreeningRequest {
    status?: 'pending' | 'in_progress' | 'completed' | 'failed';
    notes?: string;
    screening_data?: {
        scheduled_date?: string;
        venue?: string;
    };
}

export interface ScreeningQueryParams {
    status?: 'pending' | 'in_progress' | 'completed' | 'failed';
    search?: string;
    per_page?: number;
    page?: number;
}

// Admission Decision Types
export interface Admission {
    id: number;
    admission_application_id: string;
    admin_id: string;
    decision: 'admitted' | 'not_admitted' | 'pending';
    notes: string;
    offer_accepted: boolean;
    offer_accepted_at: string | null;
    decision_made_at: string;
    created_at: string;
    updated_at: string;
    // Form fields
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string;
    programme: string;
    admission_status: 'pending' | 'admitted' | 'rejected' | 'waitlisted';
    screening_score?: number | null;
    interview_date?: string | null;
    remarks?: string | null;
    faculty_id?: number | null;
    department_id?: number | null;
    mode_of_entry_id?: number | null;
    admission_application: {
        id: number;
        student_id: string;
        application_number: string;
        first_name: string;
        last_name: string;
        other_name?: string | null;
        email: string;
        phone: string;
        preferred_course?: string | null;
        faculty?: string | null;
        department?: string | null;
        mode_of_entry?: string | null;
        year_of_entry?: string | null;
        status: string;
        student: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
            jamb_registration: string;
        };
    };
    admin: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    };
}

export interface CreateAdmissionRequest {
    admission_application_id: number;
    decision: 'admitted' | 'not_admitted' | 'pending';
    notes?: string;
}

export interface UpdateAdmissionRequest {
    applicant_name?: string;
    applicant_email?: string;
    applicant_phone?: string;
    programme?: string;
    admission_status?: 'pending' | 'admitted' | 'rejected' | 'waitlisted';
    screening_score?: number;
    interview_date?: string;
    remarks?: string;
    faculty_id?: number;
    department_id?: number;
    mode_of_entry_id?: number;
}

export interface AdmissionQueryParams {
    decision?: 'pending' | 'admitted' | 'rejected' | 'waitlisted';
    search?: string;
    per_page?: number;
    page?: number;
}

// Admission Application Types (Student Applications)
export interface AdmissionApplication {
    id: number;
    student_id: number;
    application_number: string;
    first_name: string;
    last_name: string;
    other_name?: string | null;
    email: string;
    phone: string;
    preferred_course?: string | null;
    faculty?: string | null;
    department?: string | null;
    mode_of_entry?: string | null;
    year_of_entry?: string | null;
    status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
    application_fee_paid: boolean;
    acceptance_fee_paid: boolean;
    registration_fee_paid: boolean;
    created_at: string;
    updated_at: string;
    jamb_information?: {
        id: number;
        admission_application_id: string;
        jamb_registration_number: string;
        utme_score?: string | null;
        utme_subjects_scores?: Record<string, number> | null;
        first_choice_institution?: string | null;
        first_choice_course?: string | null;
        jamb_result_path?: string | null;
        created_at: string;
        updated_at: string;
    } | null;
}

export interface AdmissionApplicationQueryParams {
    status?: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
    application_fee_paid?: boolean;
    acceptance_fee_paid?: boolean;
    registration_fee_paid?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
}

// ============================================
// NEWS MANAGEMENT TYPES
// ============================================

export interface News {
    id: number;
    news_heading: string;
    news_description: string;
    news_date: string; // ISO date
    news_image?: string | null; // URL
    created_at: string;
    updated_at: string;
}

export interface CreateNewsRequest {
    news_heading: string;
    news_description: string;
    news_date: string;
    news_image?: File | null;
}

export interface UpdateNewsRequest {
    news_heading?: string;
    news_description?: string;
    news_date?: string;
    news_image?: File | null | string; // allow keeping existing URL
}

// ============================================
// CANDIDATE DATA TYPES
// ============================================

export interface CandidateRecord {
    id?: number;
    rg_num: string;
    rg_candname: string;
    rg_sex?: string;
    state_name?: string;
    lga_name?: string;
    rg_aggr?: string | number;
    co_name?: string;
    Subject1?: string;
    Subject2?: string;
    Subject3?: string;
    subject1?: string;
    subject2?: string;
    subject3?: string;
    rg_sub1scor?: string | number;
    rg_sub2scor?: string | number;
    rg_sub3scor?: string | number;
    eng_score?: string | number;
    subj?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface CandidateUploadResponse {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface CandidateDataQueryParams {
    per_page?: number;
    registration_number?: string;
    candidate_name?: string;
    state_name?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}


// Faculty Types
export interface Faculty {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    established_date?: string | null;
    is_active?: boolean;
    created_at: string;
    updated_at: string;
    departments?: Department[];
}

export interface CreateFacultyRequest {
    name: string;
    code: string;
    description?: string;
    is_active?: boolean;
}

export interface UpdateFacultyRequest {
    name?: string;
    code?: string;
    description?: string;
    is_active?: boolean;
}

export interface FacultyQueryParams {
    is_active?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
}

// Department Types
export interface Department {
    id: number;
    faculty_id: number;
    name: string;
    code: string;
    description?: string | null;
    is_active?: boolean;
    created_at: string;
    updated_at: string;
    faculty?: Faculty;
}

export interface CreateDepartmentRequest {
    faculty_id: number;
    name: string;
    code: string;
    description?: string;
    is_active?: boolean;
}

export interface UpdateDepartmentRequest {
    faculty_id?: number;
    name?: string;
    code?: string;
    description?: string;
    is_active?: boolean;
}

export interface DepartmentQueryParams {
    faculty_id?: number;
    is_active?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
}

// Mode of Entry Types
export interface ModeOfEntry {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    is_active?: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateModeOfEntryRequest {
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
}

export interface UpdateModeOfEntryRequest {
    name?: string;
    code?: string;
    description?: string;
    is_active?: boolean;
}

export interface ModeOfEntryQueryParams {
    is_active?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
}

// Program Types
export interface Program {
    id: number;
    department_id: number;
    name: string;
    code: string;
    description?: string | null;
    duration: number;
    degree_type: string;
    is_active?: boolean;
    created_at: string;
    updated_at: string;
    department?: Department;
}

export interface CreateProgramRequest {
    department_id: number;
    name: string;
    code: string;
    description?: string;
    duration: number;
    degree_type: string;
    is_active?: boolean;
}

export interface UpdateProgramRequest {
    department_id?: number;
    name?: string;
    code?: string;
    description?: string;
    duration?: number;
    degree_type?: string;
    is_active?: boolean;
}

export interface ProgramQueryParams {
    department_id?: number;
    is_active?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
}

// Student Types
export interface Student {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    jamb_registration: string;
    matriculation_number?: string | null;
    is_active: boolean;
    registration_completed: boolean;
    created_at: string;
    updated_at: string;
}

// Registration Document Types
export interface RegistrationDocument {
    id: number;
    registration_id: number;
    document_type: 'birth_certificate' | 'local_government_id' | 'passport_photograph';
    file_path: string;
    file_name: string;
    mime_type: string;
    file_size: number;
    created_at: string;
    updated_at: string;
}

// Registration Types
export interface Registration {
    id: number;
    admission_application_id: number;
    student_id: number;
    matriculation_number?: string | null;
    program_id: number;
    level: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';
    course_confirmed: boolean;
    enrollment_form_completed: boolean;
    acceptance_fee_paid: boolean;
    registration_fee_paid: boolean;
    credentials_uploaded: boolean;
    clearance_status: 'pending' | 'approved' | 'rejected';
    clearance_notes?: string | null;
    cleared_by?: number | null;
    cleared_at?: string | null;
    matriculated: boolean;
    matriculated_at?: string | null;
    status: 'pending' | 'cleared' | 'rejected' | 'matriculated';
    created_at: string;
    updated_at: string;
    admission_application?: AdmissionApplication;
    student?: Student;
    program?: Program;
    clearedBy?: User;
    documents?: RegistrationDocument[];
}

export interface RegistrationQueryParams {
    status?: 'pending' | 'cleared' | 'rejected' | 'matriculated';
    clearance_status?: 'pending' | 'approved' | 'rejected';
    matriculated?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
}

export interface ClearRegistrationRequest {
    clearance_status: 'approved' | 'rejected';
    clearance_notes?: string;
}

// Registration Fee Item Types
export interface RegistrationFeeItem {
    id: number;
    name: string;
    description?: string | null;
    amount: number;
    category: string;
    is_required: boolean;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreateRegistrationFeeItemRequest {
    name: string;
    description?: string;
    amount: number;
    category: string;
    is_required: boolean;
    is_active: boolean;
    display_order: number;
}

export interface UpdateRegistrationFeeItemRequest {
    name?: string;
    description?: string;
    amount?: number;
    category?: string;
    is_required?: boolean;
    is_active?: boolean;
    display_order?: number;
}

export interface RegistrationFeeItemQueryParams {
    is_active?: boolean;
    is_required?: boolean;
    category?: string;
    search?: string;
    per_page?: number;
    page?: number;
}

// Sundry Payment Item Types
export interface SundryPaymentItem {
    id: number;
    name: string;
    description?: string | null;
    amount: number;
    category: string;
    is_active: boolean;
    display_order: number;
    due_date?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateSundryPaymentItemRequest {
    name: string;
    description?: string;
    amount: number;
    category: string;
    is_active: boolean;
    display_order: number;
    due_date?: string;
}

export interface UpdateSundryPaymentItemRequest {
    name?: string;
    description?: string;
    amount?: number;
    category?: string;
    is_active?: boolean;
    display_order?: number;
    due_date?: string;
}

export interface SundryPaymentItemQueryParams {
    is_active?: boolean;
    category?: string;
    search?: string;
    per_page?: number;
    page?: number;
}

// Course Types
export interface Course {
    id: number;
    code: string;
    title: string;
    unit: number;
    status: 'active' | 'inactive';
    level: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';
    semester: 'first' | 'second';
    description?: string | null;
    is_elective: boolean;
    program_id: number;
    department_id: number;
    faculty_id: number;
    created_at: string;
    updated_at: string;
    program?: Program;
    department?: Department;
    faculty?: Faculty;
}

export interface CreateCourseRequest {
    code: string;
    title: string;
    unit: number;
    status: 'active' | 'inactive';
    level: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';
    semester: 'first' | 'second';
    description?: string;
    is_elective: boolean;
    program_id: number;
    department_id: number;
    faculty_id: number;
}

export interface UpdateCourseRequest {
    code?: string;
    title?: string;
    unit?: number;
    status?: 'active' | 'inactive';
    level?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';
    semester?: 'first' | 'second';
    description?: string;
    is_elective?: boolean;
    program_id?: number;
    department_id?: number;
    faculty_id?: number;
}

export interface CourseQueryParams {
    program_id?: number;
    department_id?: number;
    faculty_id?: number;
    status?: 'active' | 'inactive';
    level?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';
    semester?: 'first' | 'second';
    is_elective?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
}
