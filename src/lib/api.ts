import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosProgressEvent } from 'axios';
import type {
    ApiResponse,
    PaginatedResponse,
    LoginRequest,
    LoginResponse,
    AuthUser,
    User,
    CreateUserRequest,
    UpdateUserRequest,
    AssignRoleRequest,
    Role,
    CreateRoleRequest,
    UpdateRoleRequest,
    Permission,
    Application,
    ApplicationDocument,
    CreateApplicationRequest,
    UpdateApplicationAdminRequest,
    UpdateApplicationOwnerRequest,
    ApplicationQueryParams,
    UserQueryParams,
    RoleQueryParams,
    FunatoSendSmsRequest,
    FunatoSmsResponse,
    FunatoSmsStatusResponse,
    FunatoSmsHistoryResponse,
    FunatoSmsQueryParams,
    FunatoSendEmailRequest,
    FunatoEmailResponse,
    FunatoEmailStatusResponse,
    FunatoMakeCallRequest,
    FunatoCallResponse,
    FunatoBalanceResponse,
    FunatoAccountInfoResponse,
    FunatoContact,
    FunatoCreateContactRequest,
    FunatoUpdateContactRequest,
    FunatoContactListResponse,
    FunataContactQueryParams,
    FunatoCampaign,
    FunatoCreateCampaignRequest,
    FunatoCampaignStatsResponse,
    FunatoCampaignQueryParams,
    FunatoTemplate,
    FunatoCreateTemplateRequest,
    Screening,
    CreateScreeningRequest,
    UpdateScreeningRequest,
    ScreeningQueryParams,
    Admission,
    CreateAdmissionRequest,
    UpdateAdmissionRequest,
    AdmissionQueryParams,
    AdmissionApplication,
    AdmissionApplicationQueryParams,
    Faculty,
    CreateFacultyRequest,
    UpdateFacultyRequest,
    FacultyQueryParams,
    Department,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    DepartmentQueryParams,
    ModeOfEntry,
    CreateModeOfEntryRequest,
    UpdateModeOfEntryRequest,
    ModeOfEntryQueryParams,
    Program,
    CreateProgramRequest,
    UpdateProgramRequest,
    ProgramQueryParams,
    Registration,
    RegistrationQueryParams,
    ClearRegistrationRequest,
    RegistrationFeeItem,
    CreateRegistrationFeeItemRequest,
    UpdateRegistrationFeeItemRequest,
    RegistrationFeeItemQueryParams,
    SundryPaymentItem,
    CreateSundryPaymentItemRequest,
    UpdateSundryPaymentItemRequest,
    SundryPaymentItemQueryParams,
    Course,
    CreateCourseRequest,
    UpdateCourseRequest,
    CourseQueryParams,
    CandidateDataQueryParams,
    CandidateRecord,
} from '@/types/api';
import { toast } from 'react-toastify';

// TODO: In production, use HttpOnly cookies instead of localStorage for token storage
// This is a security best practice to prevent XSS attacks
const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
};

const setToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
    }
};

const removeToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }
};

// Create axios instance
const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
    'https://api.funato.edu.ng/api';

export const API_BASE_URL = apiBaseUrl;


// Log API base URL for debugging (always log to help diagnose production issues)
if (typeof window !== 'undefined') {
    console.log('API Base URL:', apiBaseUrl);
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        console.log('Original NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    }
}

export const api: AxiosInstance = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Accept': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - attach Authorization and CSRF headers
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            console.log('API Request:', {
                url: config.url,
                method: config.method,
                hasToken: !!token,
                tokenStart: token ? token.substring(0, 10) : 'NO_TOKEN',
            });
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Check for CORS errors
        if (error.message.includes('CORS') || error.message.includes('Cross-Origin')) {
            const apiUrl = error.config?.baseURL || apiBaseUrl;
            console.error('CORS Error: The API server needs to allow requests from this origin.');
            console.error('API URL:', apiUrl);
            console.error('Request URL:', error.config?.url);
            console.error('Full URL:', `${apiUrl}${error.config?.url}`);
            toast.error('CORS Error: Unable to connect to API server. Please check API configuration.');
        }

        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // Never log sensitive data like passwords or tokens
            const sanitizedResponseData = error.response?.data
                ? (typeof error.response.data === 'object'
                    ? { ...error.response.data, password: '[REDACTED]', token: '[REDACTED]' }
                    : error.response.data)
                : undefined;

            console.error('API Error Details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                method: error.config?.method,
                // Don't log headers as they may contain tokens
                responseData: sanitizedResponseData,
                message: error.message,
            });
        }

        // Handle different error types
        const response = error.response;
        const errorData = response?.data as Record<string, unknown>;

        if (response?.status === 401) {
            // Unauthorized - redirect to login
            toast.error('Session expired. Please login again.');
            removeToken();
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/admin/login';
            }
        } else if (response?.status === 403) {
            // Forbidden - Permission denied
            const message = String(errorData?.message || 'You do not have permission to perform this action.');
            
            // Check if this is an auth endpoint - if so, treat it like 401
            const isAuthEndpoint = error.config?.url?.includes('/auth/');
            if (isAuthEndpoint) {
                // Auth endpoint returned 403 - could be CORS or server issue
                // Don't clear token immediately - might be temporary issue
                // Only clear if it's a 401 (unauthorized), not 403 (forbidden)
                // 403 on auth endpoint might be server configuration issue
                if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                    console.warn('Auth endpoint returned 403 - this might be a CORS or server configuration issue');
                }
                // Don't clear token or redirect - let ProtectedRoute handle it
                // The token is still valid, just the API call failed
            } else {
                // Regular permission error - show message but don't redirect
                toast.error(message);
                
                // Store the error so we can show it on the dashboard
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('permission_error', message);
                }
            }
        } else if (response?.status === 404) {
            // Not found
            const message = String(errorData?.message || 'Resource not found.');
            toast.error(message);
        } else if (response?.status === 422) {
            // Validation error
            const message = String(errorData?.message || 'Validation error. Please check your input.');
            toast.error(message);

            // Show specific validation errors if available
            if (errorData?.errors && typeof errorData.errors === 'object') {
                Object.values(errorData.errors).forEach((error: unknown) => {
                    if (Array.isArray(error)) {
                        error.forEach(msg => toast.error(String(msg)));
                    }
                });
            }
        } else if (response?.status === 500) {
            // Server error
            const message = String(errorData?.message || 'Server error. Please try again later.');
            toast.error(message);
        } else if (error.code === 'ECONNABORTED') {
            // Timeout
            toast.error('Request timeout. Please check your connection and try again.');
        } else if (!response) {
            // Network error
            toast.error('Network error. Please check your internet connection.');
        }

        return Promise.reject(error);
    }
);

// ============================================
// AUTH API
// ============================================

export const authApi = {
    login: async (credentials: LoginRequest): Promise<{ admin: AuthUser; token: string; token_type: string }> => {
        const { data } = await api.post<LoginResponse>('/auth/login', credentials);
        if (data.data.token) {
            setToken(data.data.token);
        }
        return data.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
        removeToken();
    },

    logoutAll: async (): Promise<void> => {
        await api.post('/auth/logout-all');
        removeToken();
    },

    me: async (): Promise<AuthUser> => {
        const { data } = await api.get<LoginResponse>('/auth/me');
        // Funato returns admin user data
        return data.data.admin || (data.data as unknown as AuthUser);
    },
};

// ============================================
// USERS API
// ============================================

export const usersApi = {
    getAll: async (params?: UserQueryParams): Promise<PaginatedResponse<User>> => {
        // Filter out empty string values from params to avoid sending them to the API
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        ) : undefined;

        const { data } = await api.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params: cleanParams });
        return data.data;
    },

    getById: async (id: number): Promise<User> => {
        const { data } = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
        return data.data;
    },

    create: async (userData: CreateUserRequest): Promise<User> => {
        const { data } = await api.post<ApiResponse<User>>('/admin/users', userData);
        return data.data;
    },

    update: async (id: number, userData: UpdateUserRequest): Promise<User> => {
        const { data } = await api.patch<ApiResponse<User>>(`/admin/users/${id}`, userData);
        return data.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    },

    assignRole: async (userId: number, roleData: AssignRoleRequest): Promise<User> => {
        // Funato API expects 'role' field as a string (could be role name or ID)
        // Try to send as-is, converting to string
        const { data } = await api.post<ApiResponse<User>>(`/admin/users/${userId}/assign-role`, {
            role: String(roleData.role_id)
        });
        return data.data;
    },

    revokeRole: async (userId: number, roleData: AssignRoleRequest): Promise<User> => {
        // Funato API expects 'role' field as a string (could be role name or ID)
        const { data } = await api.post<ApiResponse<User>>(`/admin/users/${userId}/revoke-role`, {
            role: String(roleData.role_id)
        });
        return data.data;
    },
};

// ============================================
// ROLES API
// ============================================

export const rolesApi = {
    getAll: async (params?: RoleQueryParams): Promise<PaginatedResponse<Role>> => {
        // Filter out empty string values from params to avoid sending them to the API
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        ) : undefined;

        const { data } = await api.get<ApiResponse<Role[]>>('/admin/roles', { params: cleanParams });

        // API returns array directly in data, convert to paginated format
        const roles = data.data;
        return {
            data: roles,
            current_page: 1,
            per_page: roles.length,
            total: roles.length,
            last_page: 1,
            from: roles.length > 0 ? 1 : 0,
            to: roles.length,
        };
    },

    getById: async (id: number): Promise<Role> => {
        const { data } = await api.get<ApiResponse<Role>>(`/admin/roles/${id}`);
        return data.data;
    },

    create: async (roleData: CreateRoleRequest): Promise<Role> => {
        console.log('API: Creating role with data:', roleData);
        const { data } = await api.post<ApiResponse<Role>>('/admin/roles', roleData);
        console.log('API: Role created response:', data);
        return data.data;
    },

    update: async (id: number, roleData: UpdateRoleRequest): Promise<Role> => {
        console.log('API: Updating role with id:', id);
        console.log('API: Role data:', roleData);
        const { data } = await api.put<ApiResponse<Role>>(`/admin/roles/${id}`, roleData);
        console.log('API: Role updated response:', data);
        return data.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/roles/${id}`);
    },
};

// ============================================
// PERMISSIONS API
// ============================================

export const permissionsApi = {
    getAll: async (): Promise<Permission[]> => {
        const { data } = await api.get<ApiResponse<Permission[]>>('/admin/permissions');
        return data.data;
    },
};

// ============================================
// SCREENINGS API (Admin)
// ============================================

export const screeningsApi = {
    getAll: async (params?: ScreeningQueryParams): Promise<PaginatedResponse<Screening>> => {
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        ) : undefined;
        const { data } = await api.get<ApiResponse<PaginatedResponse<Screening>>>('/admin/admission/screenings', { params: cleanParams });
        return data.data;
    },

    getById: async (id: number): Promise<Screening> => {
        const { data } = await api.get<ApiResponse<Screening>>(`/admin/admission/screenings/${id}`);
        return data.data;
    },

    create: async (screeningData: CreateScreeningRequest): Promise<Screening> => {
        const { data } = await api.post<ApiResponse<Screening>>('/admin/admission/screenings', screeningData);
        return data.data;
    },

    update: async (id: number, screeningData: UpdateScreeningRequest): Promise<Screening> => {
        const { data } = await api.post<ApiResponse<Screening>>(
            `/admin/admission/screenings`,
            { ...screeningData, id }
        );
        return data.data;
    },

};

// ============================================
// ADMISSIONS API (Admin)
// ============================================

export const admissionsApi = {
    getAll: async (params?: AdmissionQueryParams): Promise<PaginatedResponse<Admission>> => {
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        ) : undefined;
        const { data } = await api.get<ApiResponse<PaginatedResponse<Admission>>>('/admin/admission/admissions', { params: cleanParams });
        return data.data;
    },

    create: async (admissionData: CreateAdmissionRequest): Promise<Admission> => {
        const { data } = await api.post<ApiResponse<Admission>>('/admin/admission/admissions', admissionData);
        return data.data;
    },

    update: async (id: number, admissionData: { decision: 'admitted' | 'not_admitted' | 'pending'; notes: string }): Promise<Admission> => {
        const { data } = await api.put<ApiResponse<Admission>>(`/admin/admission/admissions/${id}`, admissionData);
        return data.data;
    },

    bulkUpdateStatus: async (file: File, status: string): Promise<{ message: string; success: boolean }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('status', status);
        const { data } = await api.post<ApiResponse<{ message: string; success: boolean }>>('/admin/admission/admissions/bulk-update-status', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data.data;
    },
};

// ============================================
// ADMISSION APPLICATIONS API (Student Applications)
// ============================================

export const admissionApplicationsApi = {
    getAll: async (params?: AdmissionApplicationQueryParams): Promise<PaginatedResponse<AdmissionApplication>> => {
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        ) : undefined;
        const { data } = await api.get<{ success: boolean; data: PaginatedResponse<AdmissionApplication> }>('/admission/applications', { params: cleanParams });
        return data.data;
    },

    getById: async (id: number): Promise<AdmissionApplication> => {
        const { data } = await api.get<ApiResponse<AdmissionApplication>>(`/admission/applications/${id}`);
        return data.data;
    },

    getByStudentId: async (studentId: number, params?: AdmissionApplicationQueryParams): Promise<AdmissionApplication> => {
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        ) : undefined;
        const { data } = await api.get<ApiResponse<AdmissionApplication>>(`/admission/applications/student/${studentId}`, { params: cleanParams });
        return data.data;
    },
};

// ============================================
// FACULTIES API (Admin)
// ============================================

export const facultiesApi = {
    getAll: async (params?: FacultyQueryParams): Promise<PaginatedResponse<Faculty>> => {
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        ) : undefined;
        const { data } = await api.get<ApiResponse<PaginatedResponse<Faculty>>>('/admin/faculties', { params: cleanParams });
        return data.data;
    },

    getById: async (id: number): Promise<Faculty> => {
        const { data } = await api.get<ApiResponse<Faculty>>(`/admin/faculties/${id}`);
        return data.data;
    },

    create: async (facultyData: CreateFacultyRequest): Promise<Faculty> => {
        const { data } = await api.post<ApiResponse<Faculty>>('/admin/faculties', facultyData);
        return data.data;
    },

    update: async (id: number, facultyData: UpdateFacultyRequest): Promise<Faculty> => {
        console.log('Faculties API - Updating faculty:', id, 'with data:', facultyData);
        const { data } = await api.put<ApiResponse<Faculty>>(`/admin/faculties/${id}`, facultyData);
        console.log('Faculties API - Update response:', data);
        return data.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/faculties/${id}`);
    },
};

// ============================================
// DEPARTMENTS API (Admin)
// ============================================

export const departmentsApi = {
    getAll: async (params?: DepartmentQueryParams): Promise<PaginatedResponse<Department>> => {
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        ) : undefined;
        const { data } = await api.get<ApiResponse<PaginatedResponse<Department>>>('/admin/departments', { params: cleanParams });
        return data.data;
    },

    getById: async (id: number): Promise<Department> => {
        const { data } = await api.get<ApiResponse<Department>>(`/admin/departments/${id}`);
        return data.data;
    },

    create: async (departmentData: CreateDepartmentRequest): Promise<Department> => {
        const { data } = await api.post<ApiResponse<Department>>('/admin/departments', departmentData);
        return data.data;
    },

    update: async (id: number, departmentData: UpdateDepartmentRequest): Promise<Department> => {
        const { data } = await api.put<ApiResponse<Department>>(`/admin/departments/${id}`, departmentData);
        return data.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/departments/${id}`);
    },
};

// ============================================
// REPORTS API (Admin)
// ============================================

export const reportsApi = {
    // Department: GET /admin/admission/students/department/{departmentId}
    getStudentsByDepartment: async (
        departmentId: number,
        yearOfEntry?: number,
        per_page?: number,
        page?: number,
    ): Promise<ApiResponse<PaginatedResponse<any>>> => {
        const params: Record<string, unknown> = {};
        if (yearOfEntry) params.year_of_entry = yearOfEntry;
        if (per_page) params.per_page = per_page;
        if (page) params.page = page;

        const { data } = await api.get<ApiResponse<PaginatedResponse<any>>>(`/admin/admission/students/department/${departmentId}`, { params });
        return data;
    },

    // Faculty: GET /admin/admission/students/faculty/{facultyId}
    getStudentsByFaculty: async (
        facultyId: number,
        yearOfEntry?: number,
        per_page?: number,
        page?: number,
    ): Promise<ApiResponse<PaginatedResponse<any>>> => {
        const params: Record<string, unknown> = {};
        if (yearOfEntry) params.year_of_entry = yearOfEntry;
        if (per_page) params.per_page = per_page;
        if (page) params.page = page;

        const { data } = await api.get<ApiResponse<PaginatedResponse<any>>>(`/admin/admission/students/faculty/${facultyId}`, { params });
        return data;
    },

    // Program: GET /admin/admission/students/program/{programId}
    getStudentsByProgram: async (
        programId: number,
        yearOfEntry?: number,
        per_page?: number,
        page?: number,
    ): Promise<ApiResponse<PaginatedResponse<any>>> => {
        const params: Record<string, unknown> = {};
        if (yearOfEntry) params.year_of_entry = yearOfEntry;
        if (per_page) params.per_page = per_page;
        if (page) params.page = page;

        const { data } = await api.get<ApiResponse<PaginatedResponse<any>>>(`/admin/admission/students/program/${programId}`, { params });
        return data;
    },
};

// ============================================
// MODE OF ENTRIES API (Admin)
// ============================================

export const modeOfEntriesApi = {
    getAll: async (params?: ModeOfEntryQueryParams): Promise<PaginatedResponse<ModeOfEntry>> => {
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        ) : undefined;
        const { data } = await api.get<ApiResponse<PaginatedResponse<ModeOfEntry>>>('/admin/mode-of-entries', { params: cleanParams });
        return data.data;
    },

    getById: async (id: number): Promise<ModeOfEntry> => {
        const { data } = await api.get<ApiResponse<ModeOfEntry>>(`/admin/mode-of-entries/${id}`);
        return data.data;
    },

    create: async (modeOfEntryData: CreateModeOfEntryRequest): Promise<ModeOfEntry> => {
        const { data } = await api.post<ApiResponse<ModeOfEntry>>('/admin/mode-of-entries', modeOfEntryData);
        return data.data;
    },

    update: async (id: number, modeOfEntryData: UpdateModeOfEntryRequest): Promise<ModeOfEntry> => {
        const { data } = await api.put<ApiResponse<ModeOfEntry>>(`/admin/mode-of-entries/${id}`, modeOfEntryData);
        return data.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/mode-of-entries/${id}`);
    },
};
// ============================================
// APPLICATIONS API (Recruitment)
// ============================================

export const applicationsApi = {
    // Admin: Get all applications with filters
    getAll: async (params?: ApplicationQueryParams): Promise<PaginatedResponse<Application>> => {
        const cleanParams = params
            ? Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value != null))
            : undefined;

        const { data } = await api.get<any>(
            '/recruitment/applications',
            { params: cleanParams }
        );
        
        // Handle API response structure: { success: true, data: [...], pagination: {...} }
        if (data && data.pagination) {
            // Flatten the response to match PaginatedResponse structure
            return {
                data: data.data || [],
                current_page: data.pagination.current_page,
                per_page: data.pagination.per_page,
                total: data.pagination.total,
                last_page: data.pagination.last_page,
                from: data.pagination.from,
                to: data.pagination.to,
            };
        }
        
        // Fallback for other response structures
        return data.data;
    },

    // Get single application by applicant_id (string)
    getByApplicantId: async (applicantId: string): Promise<Application> => {
        const { data } = await api.get<ApiResponse<Application>>(
            `/recruitment/applications/${encodeURIComponent(applicantId)}`
        );
        return data.data;
    },

    // Get application documents by applicant_id
    getDocuments: async (applicantId: string): Promise<ApplicationDocument[]> => {
        const { data } = await api.get<ApiResponse<ApplicationDocument[]>>(
            `/recruitment/applications/${encodeURIComponent(applicantId)}/documents`
        );
        return data.data;
    },

    // Get specific document (returns blob for download/preview) by applicant_id
    getDocument: async (applicantId: string, documentId: number): Promise<Blob> => {
        const { data } = await api.get(
            `/recruitment/applications/${encodeURIComponent(applicantId)}/documents/${documentId}`,
            { responseType: 'blob' }
        );
        return data;
    },

    // Admin: Update application (can change status)
    updateAdmin: async (applicantId: string, applicationData: UpdateApplicationAdminRequest): Promise<Application> => {
        const { data } = await api.put<ApiResponse<Application>>(
            `/recruitment/applications/${encodeURIComponent(applicantId)}`,
            applicationData
        );
        return data.data;
    },


    // Admin: Delete application by applicant_id
    delete: async (applicantId: string): Promise<void> => {
        await api.delete(`/recruitment/applications/${encodeURIComponent(applicantId)}`);
    },

    // Public: Submit application (multipart/form-data)
    create: async (applicationData: CreateApplicationRequest): Promise<Application> => {
        const formData = new FormData();
        Object.entries(applicationData).forEach(([key, value]) => {
            if (value !== undefined && value !== null && !(value instanceof File)) {
                formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
            }
        });

        if (applicationData.passport_photograph) formData.append('passport_photograph', applicationData.passport_photograph);
        if (applicationData.cv) formData.append('cv', applicationData.cv);
        if (applicationData.cover_letter) formData.append('cover_letter', applicationData.cover_letter);
        if (applicationData.birth_certificate) formData.append('birth_certificate', applicationData.birth_certificate);

        const csrfToken = process.env.CSRF_API_KEY;
        const headers: Record<string, string> = { 'Content-Type': 'multipart/form-data' };
        if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;

        const { data } = await api.post<ApiResponse<Application>>('/recruitment/applications', formData, { headers });
        return data.data;
    },

    // Owner: Update own application (cannot change status)
    // TODO: Use X-CSRF-TOKEN for owner updates
    updateOwner: async (applicantId: string, applicationData: UpdateApplicationOwnerRequest): Promise<Application> => {
        const csrfToken = process.env.CSRF_API_KEY;
        const headers: Record<string, string> = {};
        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        const { data } = await api.patch<ApiResponse<Application>>(`/recruitment/applications/${encodeURIComponent(applicantId)}`, applicationData, {
            headers,
        });
        return data.data;
    },

};

// ============================================
// FUNATO API (SMS, Email, Voice, Campaigns)
// ============================================

export const funatoApi = {
    // ========== SMS ENDPOINTS ==========
    sendSms: async (data: FunatoSendSmsRequest): Promise<FunatoSmsResponse> => {
        const { data: response } = await api.post<ApiResponse<FunatoSmsResponse>>(
            '/funato/sms/send',
            data
        );
        return response.data;
    },

    getSmsStatus: async (messageId: string): Promise<FunatoSmsStatusResponse> => {
        const { data: response } = await api.get<ApiResponse<FunatoSmsStatusResponse>>(
            `/funato/sms/${messageId}/status`
        );
        return response.data;
    },

    getSmsHistory: async (params?: FunatoSmsQueryParams): Promise<FunatoSmsHistoryResponse> => {
        const { data } = await api.get<FunatoSmsHistoryResponse>('/funato/sms/history', { params });
        return data;
    },

    // ========== EMAIL ENDPOINTS ==========
    sendEmail: async (data: FunatoSendEmailRequest): Promise<FunatoEmailResponse> => {
        const { data: response } = await api.post<ApiResponse<FunatoEmailResponse>>(
            '/funato/email/send',
            data
        );
        return response.data;
    },

    getEmailStatus: async (messageId: string): Promise<FunatoEmailStatusResponse> => {
        const { data: response } = await api.get<ApiResponse<FunatoEmailStatusResponse>>(
            `/funato/email/${messageId}/status`
        );
        return response.data;
    },

    // ========== VOICE/CALL ENDPOINTS ==========
    makeCall: async (data: FunatoMakeCallRequest): Promise<FunatoCallResponse> => {
        const { data: response } = await api.post<ApiResponse<FunatoCallResponse>>(
            '/funato/voice/call',
            data
        );
        return response.data;
    },

    getCallStatus: async (callId: string): Promise<FunatoCallResponse> => {
        const { data: response } = await api.get<ApiResponse<FunatoCallResponse>>(
            `/funato/voice/call/${callId}`
        );
        return response.data;
    },

    // ========== ACCOUNT/BALANCE ENDPOINTS ==========
    getBalance: async (): Promise<FunatoBalanceResponse> => {
        const { data: response } = await api.get<ApiResponse<FunatoBalanceResponse>>(
            '/funato/account/balance'
        );
        return response.data;
    },

    getAccountInfo: async (): Promise<FunatoAccountInfoResponse> => {
        const { data: response } = await api.get<ApiResponse<FunatoAccountInfoResponse>>(
            '/funato/account/info'
        );
        return response.data;
    },

    // ========== CONTACT MANAGEMENT ENDPOINTS ==========
    getContacts: async (params?: FunataContactQueryParams): Promise<FunatoContactListResponse> => {
        const { data } = await api.get<FunatoContactListResponse>('/funato/contacts', { params });
        return data;
    },

    getContact: async (contactId: string): Promise<FunatoContact> => {
        const { data: response } = await api.get<ApiResponse<FunatoContact>>(
            `/funato/contacts/${contactId}`
        );
        return response.data;
    },

    createContact: async (contactData: FunatoCreateContactRequest): Promise<FunatoContact> => {
        const { data: response } = await api.post<ApiResponse<FunatoContact>>(
            '/funato/contacts',
            contactData
        );
        return response.data;
    },

    updateContact: async (contactId: string, contactData: FunatoUpdateContactRequest): Promise<FunatoContact> => {
        const { data: response } = await api.put<ApiResponse<FunatoContact>>(
            `/funato/contacts/${contactId}`,
            contactData
        );
        return response.data;
    },

    deleteContact: async (contactId: string): Promise<void> => {
        await api.delete(`/funato/contacts/${contactId}`);
    },

    // ========== CAMPAIGN ENDPOINTS ==========
    getCampaigns: async (params?: FunatoCampaignQueryParams): Promise<PaginatedResponse<FunatoCampaign>> => {
        const { data } = await api.get<PaginatedResponse<FunatoCampaign>>('/funato/campaigns', { params });
        return data;
    },

    getCampaign: async (campaignId: string): Promise<FunatoCampaign> => {
        const { data: response } = await api.get<ApiResponse<FunatoCampaign>>(
            `/funato/campaigns/${campaignId}`
        );
        return response.data;
    },

    createCampaign: async (campaignData: FunatoCreateCampaignRequest): Promise<FunatoCampaign> => {
        const { data: response } = await api.post<ApiResponse<FunatoCampaign>>(
            '/funato/campaigns',
            campaignData
        );
        return response.data;
    },

    getCampaignStats: async (campaignId: string): Promise<FunatoCampaignStatsResponse> => {
        const { data: response } = await api.get<ApiResponse<FunatoCampaignStatsResponse>>(
            `/funato/campaigns/${campaignId}/stats`
        );
        return response.data;
    },

    pauseCampaign: async (campaignId: string): Promise<FunatoCampaign> => {
        const { data: response } = await api.post<ApiResponse<FunatoCampaign>>(
            `/funato/campaigns/${campaignId}/pause`
        );
        return response.data;
    },

    resumeCampaign: async (campaignId: string): Promise<FunatoCampaign> => {
        const { data: response } = await api.post<ApiResponse<FunatoCampaign>>(
            `/funato/campaigns/${campaignId}/resume`
        );
        return response.data;
    },

    deleteCampaign: async (campaignId: string): Promise<void> => {
        await api.delete(`/funato/campaigns/${campaignId}`);
    },

    // ========== TEMPLATE ENDPOINTS ==========
    getTemplates: async (): Promise<FunatoTemplate[]> => {
        const { data: response } = await api.get<ApiResponse<FunatoTemplate[]>>(
            '/funato/templates'
        );
        return response.data;
    },

    getTemplate: async (templateId: string): Promise<FunatoTemplate> => {
        const { data: response } = await api.get<ApiResponse<FunatoTemplate>>(
            `/funato/templates/${templateId}`
        );
        return response.data;
    },

    createTemplate: async (templateData: FunatoCreateTemplateRequest): Promise<FunatoTemplate> => {
        const { data: response } = await api.post<ApiResponse<FunatoTemplate>>(
            '/funato/templates',
            templateData
        );
        return response.data;
    },

    updateTemplate: async (templateId: string, templateData: FunatoCreateTemplateRequest): Promise<FunatoTemplate> => {
        const { data: response } = await api.put<ApiResponse<FunatoTemplate>>(
            `/funato/templates/${templateId}`,
            templateData
        );
        return response.data;
    },

    deleteTemplate: async (templateId: string): Promise<void> => {
        await api.delete(`/funato/templates/${templateId}`);
    },
};

// ============================================
// PROGRAMS API
// ============================================
export const programsApi = {
    getAll: async (params?: ProgramQueryParams): Promise<PaginatedResponse<Program>> => {
        const { data: response } = await api.get<ApiResponse<PaginatedResponse<Program>>>('/admin/programs', { params });
        return response.data;
    },

    getById: async (id: number): Promise<Program> => {
        const { data: response } = await api.get<ApiResponse<Program>>(`/admin/programs/${id}`);
        return response.data;
    },

    create: async (programData: CreateProgramRequest): Promise<Program> => {
        const { data: response } = await api.post<ApiResponse<Program>>('/admin/programs', programData);
        return response.data;
    },

    update: async (id: number, programData: UpdateProgramRequest): Promise<Program> => {
        const { data: response } = await api.put<ApiResponse<Program>>(`/admin/programs/${id}`, programData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/programs/${id}`);
    },
};

// ============================================
// REGISTRATIONS API
// ============================================
export const registrationsApi = {
    getAll: async (params?: RegistrationQueryParams): Promise<PaginatedResponse<Registration>> => {
        const { data: response } = await api.get<ApiResponse<PaginatedResponse<Registration>>>('/admin/admission/registrations', { params });
        return response.data;
    },

    getById: async (id: number): Promise<Registration> => {
        const { data: response } = await api.get<ApiResponse<Registration>>(`/admin/admission/registrations/${id}`);
        return response.data;
    },

    clearRegistration: async (id: number, clearanceData: ClearRegistrationRequest): Promise<Registration> => {
        const { data: response } = await api.post<ApiResponse<Registration>>(`/admin/admission/registrations/${id}/clear`, clearanceData);
        return response.data;
    },
};

// ============================================
// REGISTRATION FEE ITEMS API
// ============================================
export const registrationFeeItemsApi = {
    getAll: async (params?: RegistrationFeeItemQueryParams): Promise<PaginatedResponse<RegistrationFeeItem>> => {
        const { data: response } = await api.get<ApiResponse<PaginatedResponse<RegistrationFeeItem>>>('/admin/registration-fee-items', { params });
        return response.data;
    },

    getById: async (id: number): Promise<RegistrationFeeItem> => {
        const { data: response } = await api.get<ApiResponse<RegistrationFeeItem>>(`/admin/registration-fee-items/${id}`);
        return response.data;
    },

    create: async (itemData: CreateRegistrationFeeItemRequest): Promise<RegistrationFeeItem> => {
        const { data: response } = await api.post<ApiResponse<RegistrationFeeItem>>('/admin/registration-fee-items', itemData);
        return response.data;
    },

    update: async (id: number, itemData: UpdateRegistrationFeeItemRequest): Promise<RegistrationFeeItem> => {
        const { data: response } = await api.put<ApiResponse<RegistrationFeeItem>>(`/admin/registration-fee-items/${id}`, itemData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/registration-fee-items/${id}`);
    },
};

// ============================================
// SUNDRY PAYMENT ITEMS API
// ============================================
export const sundryPaymentItemsApi = {
    getAll: async (params?: SundryPaymentItemQueryParams): Promise<PaginatedResponse<SundryPaymentItem>> => {
        const { data: response } = await api.get<ApiResponse<PaginatedResponse<SundryPaymentItem>>>('/admin/sundry-payment-items', { params });
        return response.data;
    },

    getById: async (id: number): Promise<SundryPaymentItem> => {
        const { data: response } = await api.get<ApiResponse<SundryPaymentItem>>(`/admin/sundry-payment-items/${id}`);
        return response.data;
    },

    create: async (itemData: CreateSundryPaymentItemRequest): Promise<SundryPaymentItem> => {
        const { data: response } = await api.post<ApiResponse<SundryPaymentItem>>('/admin/sundry-payment-items', itemData);
        return response.data;
    },

    update: async (id: number, itemData: UpdateSundryPaymentItemRequest): Promise<SundryPaymentItem> => {
        const { data: response } = await api.put<ApiResponse<SundryPaymentItem>>(`/admin/sundry-payment-items/${id}`, itemData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/sundry-payment-items/${id}`);
    },
};

// ============================================
// COURSES API
// ============================================
export const coursesApi = {
    getAll: async (params?: CourseQueryParams): Promise<PaginatedResponse<Course>> => {
        const { data: response } = await api.get<ApiResponse<PaginatedResponse<Course>>>('/admin/courses', { params });
        return response.data;
    },

    getById: async (id: number): Promise<Course> => {
        const { data: response } = await api.get<ApiResponse<Course>>(`/admin/courses/${id}`);
        return response.data;
    },

    create: async (courseData: CreateCourseRequest): Promise<Course> => {
        const { data: response } = await api.post<ApiResponse<Course>>('/admin/courses', courseData);
        return response.data;
    },

    update: async (id: number, courseData: UpdateCourseRequest): Promise<Course> => {
        const { data: response } = await api.put<ApiResponse<Course>>(`/admin/courses/${id}`, courseData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/courses/${id}`);
    },
};

// ============================================
// NEWS API (Admin)
// ============================================

export const newsApi = {
    getAll: async (params?: { per_page?: number; page?: number; search?: string }) => {
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        ) : undefined;
        const { data } = await api.get<ApiResponse<PaginatedResponse<import('@/types/api').News>>>("/admin/news", { params: cleanParams });
        return data.data;
    },

    getById: async (id: number) => {
        const { data } = await api.get<ApiResponse<import('@/types/api').News>>(`/admin/news/${id}`);
        return data.data;
    },

    create: async (newsData: import('@/types/api').CreateNewsRequest) => {
        const formData = new FormData();
        formData.append('news_heading', String(newsData.news_heading));
        formData.append('news_description', String(newsData.news_description));
        formData.append('news_date', String(newsData.news_date));
        if (newsData.news_image instanceof File) formData.append('news_image', newsData.news_image);

        const headers: Record<string, string> = {};
        const csrf = process.env.CSRF_API_KEY;
        if (csrf) headers['X-CSRF-TOKEN'] = csrf;

        const { data } = await api.post<ApiResponse<import('@/types/api').News>>('/admin/news', formData, { headers });
        return data.data;
    },

    update: async (id: number, newsData: import('@/types/api').UpdateNewsRequest) => {
        const formData = new FormData();
        if (newsData.news_heading) formData.append('news_heading', String(newsData.news_heading));
        if (newsData.news_description) formData.append('news_description', String(newsData.news_description));
        if (newsData.news_date) formData.append('news_date', String(newsData.news_date));
        if (newsData.news_image instanceof File) formData.append('news_image', newsData.news_image);

        const headers: Record<string, string> = {};
        const csrf = process.env.CSRF_API_KEY;
        if (csrf) headers['X-CSRF-TOKEN'] = csrf;

        const { data } = await api.patch<ApiResponse<import('@/types/api').News>>(`/admin/news/${id}`, formData, { headers });
        return data.data;
    },

    delete: async (id: number) => {
        await api.delete(`/admin/news/${id}`);
    },
};

// ============================================
// CANDIDATE DATA API (Admin)
// ============================================

export const candidateDataApi = {
    getAll: async (params?: CandidateDataQueryParams): Promise<PaginatedResponse<CandidateRecord>> => {
        try {
            // Build query parameters, excluding undefined/null values
            const queryParams: any = {};
            if (params) {
                if (params.per_page) queryParams.per_page = params.per_page;
                if (params.registration_number) queryParams.registration_number = params.registration_number;
                if (params.candidate_name) queryParams.candidate_name = params.candidate_name;
                if (params.state_name) queryParams.state_name = params.state_name;
                if (params.sort_by) queryParams.sort_by = params.sort_by;
                if (params.sort_order) queryParams.sort_order = params.sort_order;
            }
            
            const { data } = await api.get<any>('/admin/candidate-data', {
                params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
            });
            
            // Handle the response structure which has data and pagination as separate fields
            const candidateData = data.data || [];
            const paginationData = data.pagination || {};
            
            // Return a PaginatedResponse structure
            return {
                data: candidateData,
                current_page: paginationData.current_page || 1,
                per_page: paginationData.per_page || 15,
                total: paginationData.total || 0,
                last_page: paginationData.last_page || 1,
                from: paginationData.from || 1,
                to: paginationData.to || 15,
            };
        } catch (error: any) {
            console.error('Error fetching candidate data:', error);
            throw error;
        }
    },

    upload: async (file: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) => {
        const formData = new FormData();
        // Normalize mime type based on extension to satisfy backend validators
        const name = file.name || '';
        const ext = name.split('.').pop()?.toLowerCase() || '';
        const mimeMap: Record<string, string> = {
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            xls: 'application/vnd.ms-excel',
            csv: 'text/csv',
        };
        const expectedType = mimeMap[ext] || file.type || 'application/octet-stream';
        const normalizedFile = new File([file], name, { type: expectedType });

        // Append only under the expected 'file' key
        formData.append('file', normalizedFile);

        const headers: Record<string, string> = {};
        const csrf = process.env.CSRF_API_KEY;
        if (csrf) headers['X-CSRF-TOKEN'] = csrf;

        try {
            const { data } = await api.post<ApiResponse<import('@/types/api').CandidateUploadResponse>>('/admin/candidate-data/upload', formData, {
                headers,
                onUploadProgress,
            });
            return data.data;
        } catch (error: any) {
            // surface validation details if available
            if (error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    getByRegistrationNumber: async (registrationNumber: string): Promise<import('@/types/api').CandidateRecord | null> => {
        try {
            const { data } = await api.get<ApiResponse<import('@/types/api').CandidateRecord>>(`/admin/candidate-data/${encodeURIComponent(registrationNumber)}`);
            return data.data;
        } catch (err: any) {
            // If not found, return null so UI can show a friendly message
            if (err?.response?.status === 404) return null;
            throw err;
        }
    },
};

// Export token helpers for auth.ts
export { getToken, setToken, removeToken };

export async function apiCall(endpoint: string, options: RequestInit): Promise<unknown> {
    try {
        const response = await fetch(endpoint, options);
        if (!response.ok) {
            const errorMessage = await response.text();
            toast.error(`Error: ${errorMessage}`);
            throw new Error(errorMessage);
        }
        toast.success('Request successful!');
        return await response.json();
    } catch (error) {
        toast.error('An unexpected error occurred. Please try again.');
        throw error;
    }
}
