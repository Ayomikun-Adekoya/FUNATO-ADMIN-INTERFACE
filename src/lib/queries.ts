import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import {
    usersApi,
    rolesApi,
    permissionsApi,
    applicationsApi,
    authApi,
    funatoApi,
    screeningsApi,
    admissionsApi,
    admissionApplicationsApi,
    facultiesApi,
    departmentsApi,
    modeOfEntriesApi,
    programsApi,
    registrationsApi,
    registrationFeeItemsApi,
    sundryPaymentItemsApi,
    coursesApi,
} from './api';
import type {
    User,
    Role,
    Permission,
    Application,
    ApplicationDocument,
    PaginatedResponse,
    CreateUserRequest,
    UpdateUserRequest,
    AssignRoleRequest,
    CreateRoleRequest,
    UpdateRoleRequest,
    UpdateApplicationAdminRequest,
    UpdateApplicationOwnerRequest,
    ApplicationQueryParams,
    UserQueryParams,
    RoleQueryParams,
    AuthUser,
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
} from '@/types/api';

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const response = error.response;
        const errorData = response?.data as Record<string, unknown>;

        // Try different error message locations
        return String(errorData?.message) ||
            String(errorData?.error) ||
            error.message ||
            'An unexpected error occurred';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

/**
 * Default query error handler
 */
export const handleQueryError = (error: unknown, context?: string) => {
    // Don't show toast for 403 errors as they're handled by the interceptor
    if (error instanceof AxiosError && error.response?.status === 403) {
        return;
    }

    // Don't show toast for 401 errors as they're handled by the interceptor
    if (error instanceof AxiosError && error.response?.status === 401) {
        return;
    }

    console.error(`Query Error${context ? ` (${context})` : ''}:`, error);
};

// ============================================
// AUTH QUERIES
// ============================================

export const useCurrentUser = (): UseQueryResult<AuthUser, Error> => {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: () => authApi.me(),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// ============================================
// USER QUERIES
// ============================================

export const useUsers = (params?: UserQueryParams): UseQueryResult<PaginatedResponse<User>, Error> => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            const result = await usersApi.getAll(params);
            if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                console.log('useUsers API response:', result);
            }
            return result;
        },
    });
};

export const useUser = (id: number): UseQueryResult<User, Error> => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => usersApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateUser = (): UseMutationResult<User, Error, CreateUserRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: CreateUserRequest) => usersApi.create(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUser = (): UseMutationResult<User, Error, { id: number; data: UpdateUserRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) => usersApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
        },
    });
};

export const useDeleteUser = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => usersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useAssignRole = (): UseMutationResult<User, Error, { userId: number; roleData: AssignRoleRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, roleData }: { userId: number; roleData: AssignRoleRequest }) =>
            usersApi.assignRole(userId, roleData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
        },
    });
};

export const useRevokeRole = (): UseMutationResult<User, Error, { userId: number; roleData: AssignRoleRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, roleData }: { userId: number; roleData: AssignRoleRequest }) =>
            usersApi.revokeRole(userId, roleData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
        },
    });
};

// ============================================
// ROLE QUERIES
// ============================================

export const useRoles = (params?: RoleQueryParams): UseQueryResult<PaginatedResponse<Role>, Error> => {
    return useQuery({
        queryKey: ['roles', params],
        queryFn: () => rolesApi.getAll(params),
    });
};

export const useRole = (id: number): UseQueryResult<Role, Error> => {
    return useQuery({
        queryKey: ['roles', id],
        queryFn: () => rolesApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateRole = (): UseMutationResult<Role, Error, CreateRoleRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roleData: CreateRoleRequest) => rolesApi.create(roleData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
    });
};

export const useUpdateRole = (): UseMutationResult<Role, Error, { id: number; data: UpdateRoleRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateRoleRequest }) => rolesApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
        },
    });
};

export const useDeleteRole = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => rolesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
    });
};

// ============================================
// PERMISSION QUERIES
// ============================================

export const usePermissions = (): UseQueryResult<Permission[], Error> => {
    return useQuery({
        queryKey: ['permissions'],
        queryFn: () => permissionsApi.getAll(),
        staleTime: 10 * 60 * 1000, // 10 minutes - permissions don't change often
    });
};

// ============================================
// APPLICATION QUERIES
// ============================================

export const useApplications = (params?: ApplicationQueryParams): UseQueryResult<PaginatedResponse<Application>, Error> => {
    return useQuery({
        queryKey: ['applications', params],
        queryFn: () => applicationsApi.getAll(params),
    });
};

export const useApplication = (id: number): UseQueryResult<Application, Error> => {
    return useQuery({
        queryKey: ['applications', id],
        queryFn: () => applicationsApi.getById(id),
        enabled: !!id,
    });
};

export const useApplicationDocuments = (id: number): UseQueryResult<ApplicationDocument[], Error> => {
    return useQuery({
        queryKey: ['applications', id, 'documents'],
        queryFn: () => applicationsApi.getDocuments(id),
        enabled: !!id,
    });
};

export const useUpdateApplicationAdmin = (): UseMutationResult<Application, Error, { id: number; data: UpdateApplicationAdminRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateApplicationAdminRequest }) =>
            applicationsApi.updateAdmin(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['applications', variables.id] });
        },
    });
};

export const useUpdateApplicationOwner = (): UseMutationResult<Application, Error, { id: number; data: UpdateApplicationOwnerRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateApplicationOwnerRequest }) =>
            applicationsApi.updateOwner(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['applications', variables.id] });
        },
    });
};

export const useDeleteApplication = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => applicationsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
};

// ============================================
// FUNATO SMS QUERIES
// ============================================

export const useSendSms = (): UseMutationResult<FunatoSmsResponse, Error, FunatoSendSmsRequest> => {
    return useMutation({
        mutationFn: (smsData: FunatoSendSmsRequest) => funatoApi.sendSms(smsData),
        onSuccess: () => {
            console.log('SMS sent successfully');
        },
        onError: (error) => {
            console.error('Failed to send SMS:', error);
        },
    });
};

export const useSmsStatus = (messageId: string): UseQueryResult<FunatoSmsStatusResponse, Error> => {
    return useQuery({
        queryKey: ['smsStatus', messageId],
        queryFn: () => funatoApi.getSmsStatus(messageId),
        enabled: !!messageId,
        refetchInterval: 5000, // Poll every 5 seconds
    });
};

export const useSmsHistory = (params?: FunatoSmsQueryParams): UseQueryResult<FunatoSmsHistoryResponse, Error> => {
    return useQuery({
        queryKey: ['smsHistory', params],
        queryFn: () => funatoApi.getSmsHistory(params),
    });
};

// ============================================
// FUNATO EMAIL QUERIES
// ============================================

export const useSendEmail = (): UseMutationResult<FunatoEmailResponse, Error, FunatoSendEmailRequest> => {
    return useMutation({
        mutationFn: (emailData: FunatoSendEmailRequest) => funatoApi.sendEmail(emailData),
        onSuccess: () => {
            console.log('Email sent successfully');
        },
        onError: (error) => {
            console.error('Failed to send email:', error);
        },
    });
};

export const useEmailStatus = (messageId: string): UseQueryResult<FunatoEmailStatusResponse, Error> => {
    return useQuery({
        queryKey: ['emailStatus', messageId],
        queryFn: () => funatoApi.getEmailStatus(messageId),
        enabled: !!messageId,
        refetchInterval: 5000,
    });
};

// ============================================
// FUNATO VOICE/CALL QUERIES
// ============================================

export const useMakeCall = (): UseMutationResult<FunatoCallResponse, Error, FunatoMakeCallRequest> => {
    return useMutation({
        mutationFn: (callData: FunatoMakeCallRequest) => funatoApi.makeCall(callData),
        onSuccess: () => {
            console.log('Call initiated successfully');
        },
        onError: (error) => {
            console.error('Failed to initiate call:', error);
        },
    });
};

export const useCallStatus = (callId: string): UseQueryResult<FunatoCallResponse, Error> => {
    return useQuery({
        queryKey: ['callStatus', callId],
        queryFn: () => funatoApi.getCallStatus(callId),
        enabled: !!callId,
        refetchInterval: 3000,
    });
};

// ============================================
// FUNATO ACCOUNT QUERIES
// ============================================

export const useBalance = (): UseQueryResult<FunatoBalanceResponse, Error> => {
    return useQuery({
        queryKey: ['funatoBalance'],
        queryFn: () => funatoApi.getBalance(),
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    });
};

export const useAccountInfo = (): UseQueryResult<FunatoAccountInfoResponse, Error> => {
    return useQuery({
        queryKey: ['funatoAccountInfo'],
        queryFn: () => funatoApi.getAccountInfo(),
        staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    });
};

// ============================================
// FUNATO CONTACT QUERIES
// ============================================

export const useContacts = (params?: FunataContactQueryParams): UseQueryResult<FunatoContactListResponse, Error> => {
    return useQuery({
        queryKey: ['funatoContacts', params],
        queryFn: () => funatoApi.getContacts(params),
    });
};

export const useContact = (contactId: string): UseQueryResult<FunatoContact, Error> => {
    return useQuery({
        queryKey: ['funatoContact', contactId],
        queryFn: () => funatoApi.getContact(contactId),
        enabled: !!contactId,
    });
};

export const useCreateContact = (): UseMutationResult<FunatoContact, Error, FunatoCreateContactRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contactData: FunatoCreateContactRequest) => funatoApi.createContact(contactData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funatoContacts'] });
        },
    });
};

export const useUpdateContact = (): UseMutationResult<FunatoContact, Error, { contactId: string; data: FunatoUpdateContactRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contactId, data }: { contactId: string; data: FunatoUpdateContactRequest }) =>
            funatoApi.updateContact(contactId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['funatoContacts'] });
            queryClient.invalidateQueries({ queryKey: ['funatoContact', variables.contactId] });
        },
    });
};

export const useDeleteContact = (): UseMutationResult<void, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contactId: string) => funatoApi.deleteContact(contactId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funatoContacts'] });
        },
    });
};

// ============================================
// FUNATO CAMPAIGN QUERIES
// ============================================

export const useCampaigns = (params?: FunatoCampaignQueryParams): UseQueryResult<PaginatedResponse<FunatoCampaign>, Error> => {
    return useQuery({
        queryKey: ['funatoCampaigns', params],
        queryFn: () => funatoApi.getCampaigns(params),
    });
};

export const useCampaign = (campaignId: string): UseQueryResult<FunatoCampaign, Error> => {
    return useQuery({
        queryKey: ['funatoCampaign', campaignId],
        queryFn: () => funatoApi.getCampaign(campaignId),
        enabled: !!campaignId,
    });
};

export const useCreateCampaign = (): UseMutationResult<FunatoCampaign, Error, FunatoCreateCampaignRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (campaignData: FunatoCreateCampaignRequest) => funatoApi.createCampaign(campaignData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funatoCampaigns'] });
        },
    });
};

export const useCampaignStats = (campaignId: string): UseQueryResult<FunatoCampaignStatsResponse, Error> => {
    return useQuery({
        queryKey: ['funatoCampaignStats', campaignId],
        queryFn: () => funatoApi.getCampaignStats(campaignId),
        enabled: !!campaignId,
        refetchInterval: 10000, // Poll every 10 seconds
    });
};

export const usePauseCampaign = (): UseMutationResult<FunatoCampaign, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (campaignId: string) => funatoApi.pauseCampaign(campaignId),
        onSuccess: (_, campaignId) => {
            queryClient.invalidateQueries({ queryKey: ['funatoCampaigns'] });
            queryClient.invalidateQueries({ queryKey: ['funatoCampaign', campaignId] });
        },
    });
};

export const useResumeCampaign = (): UseMutationResult<FunatoCampaign, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (campaignId: string) => funatoApi.resumeCampaign(campaignId),
        onSuccess: (_, campaignId) => {
            queryClient.invalidateQueries({ queryKey: ['funatoCampaigns'] });
            queryClient.invalidateQueries({ queryKey: ['funatoCampaign', campaignId] });
        },
    });
};

export const useDeleteCampaign = (): UseMutationResult<void, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (campaignId: string) => funatoApi.deleteCampaign(campaignId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funatoCampaigns'] });
        },
    });
};

// ============================================
// FUNATO TEMPLATE QUERIES
// ============================================

export const useTemplates = (): UseQueryResult<FunatoTemplate[], Error> => {
    return useQuery({
        queryKey: ['funatoTemplates'],
        queryFn: () => funatoApi.getTemplates(),
        staleTime: 15 * 60 * 1000, // Cache for 15 minutes
    });
};

export const useTemplate = (templateId: string): UseQueryResult<FunatoTemplate, Error> => {
    return useQuery({
        queryKey: ['funatoTemplate', templateId],
        queryFn: () => funatoApi.getTemplate(templateId),
        enabled: !!templateId,
    });
};

export const useCreateTemplate = (): UseMutationResult<FunatoTemplate, Error, FunatoCreateTemplateRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateData: FunatoCreateTemplateRequest) => funatoApi.createTemplate(templateData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funatoTemplates'] });
        },
    });
};

export const useUpdateTemplate = (): UseMutationResult<FunatoTemplate, Error, { templateId: string; data: FunatoCreateTemplateRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, data }: { templateId: string; data: FunatoCreateTemplateRequest }) =>
            funatoApi.updateTemplate(templateId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['funatoTemplates'] });
            queryClient.invalidateQueries({ queryKey: ['funatoTemplate', variables.templateId] });
        },
    });
};

export const useDeleteTemplate = (): UseMutationResult<void, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateId: string) => funatoApi.deleteTemplate(templateId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funatoTemplates'] });
        },
    });
};

// ============================================
// SCREENING QUERIES (Admin)
// ============================================

export const useScreenings = (params?: ScreeningQueryParams): UseQueryResult<PaginatedResponse<Screening>, Error> => {
    return useQuery({
        queryKey: ['screenings', params],
        queryFn: () => screeningsApi.getAll(params),
        retry: (failureCount, error) => {
            // Don't retry on 403 (permission) or 401 (auth) errors
            if (error instanceof AxiosError) {
                const status = error.response?.status;
                if (status === 403 || status === 401) {
                    return false;
                }
            }
            return failureCount < 2;
        },
    });
};

// Note: No GET single screening endpoint available in API
// export const useScreening = (id: number): UseQueryResult<Screening, Error> => {
//     return useQuery({
//         queryKey: ['screenings', id],
//         queryFn: () => screeningsApi.getById(id),
//         enabled: !!id,
//     });
// };

export const useCreateScreening = (): UseMutationResult<Screening, Error, CreateScreeningRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (screeningData: CreateScreeningRequest) => screeningsApi.create(screeningData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['screenings'] });
        },
    });
};

export const useUpdateScreening = (): UseMutationResult<Screening, Error, { id: number; data: UpdateScreeningRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateScreeningRequest }) => screeningsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['screenings'] });
            queryClient.invalidateQueries({ queryKey: ['screenings', variables.id] });
        },
    });
};

// ============================================
// ADMISSION QUERIES (Admin)
// ============================================

export const useAdmissions = (params?: AdmissionQueryParams): UseQueryResult<PaginatedResponse<Admission>, Error> => {
    return useQuery({
        queryKey: ['admissions', params],
        queryFn: () => admissionsApi.getAll(params),
    });
};

export const useAdmission = (id: number): UseQueryResult<Admission, Error> => {
    return useQuery({
        queryKey: ['admissions', id],
        queryFn: () => Promise.reject(new Error('GET single admission not supported by API')),
        enabled: false, // Disabled since endpoint doesn't exist
    });
};

export const useCreateAdmission = (): UseMutationResult<Admission, Error, CreateAdmissionRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (admissionData: CreateAdmissionRequest) => admissionsApi.create(admissionData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
        },
    });
};

export const useUpdateAdmission = (): UseMutationResult<Admission, Error, { id: number; data: { decision: 'admitted' | 'not_admitted' | 'pending'; notes: string } }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { decision: 'admitted' | 'not_admitted' | 'pending'; notes: string } }) => admissionsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            queryClient.invalidateQueries({ queryKey: ['admissions', variables.id] });
        },
    });
};

// ============================================
// ADMISSION APPLICATIONS QUERIES (Student Applications)
// ============================================

export const useAdmissionApplications = (params?: AdmissionApplicationQueryParams): UseQueryResult<PaginatedResponse<AdmissionApplication>, Error> => {
    return useQuery({
        queryKey: ['admissionApplications', params],
        queryFn: () => admissionApplicationsApi.getAll(params),
    });
};

export const useAdmissionApplication = (id: number): UseQueryResult<AdmissionApplication, Error> => {
    return useQuery({
        queryKey: ['admissionApplications', id],
        queryFn: () => admissionApplicationsApi.getById(id),
        enabled: !!id,
    });
};

export const useAdmissionApplicationByStudent = (studentId: number, params?: AdmissionApplicationQueryParams): UseQueryResult<AdmissionApplication, Error> => {
    return useQuery({
        queryKey: ['admissionApplications', 'student', studentId, params],
        queryFn: () => admissionApplicationsApi.getByStudentId(studentId, params),
        enabled: !!studentId,
    });
};

// ============================================
// FACULTY QUERIES (Admin)
// ============================================

export const useFaculties = (params?: FacultyQueryParams): UseQueryResult<PaginatedResponse<Faculty>, Error> => {
    return useQuery({
        queryKey: ['faculties', params],
        queryFn: () => facultiesApi.getAll(params),
    });
};

export const useFaculty = (id: number): UseQueryResult<Faculty, Error> => {
    return useQuery({
        queryKey: ['faculties', id],
        queryFn: () => facultiesApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateFaculty = (): UseMutationResult<Faculty, Error, CreateFacultyRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (facultyData: CreateFacultyRequest) => facultiesApi.create(facultyData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faculties'] });
        },
    });
};

export const useUpdateFaculty = (): UseMutationResult<Faculty, Error, { id: number; data: UpdateFacultyRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateFacultyRequest }) => facultiesApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['faculties'] });
            queryClient.invalidateQueries({ queryKey: ['faculties', variables.id] });
        },
    });
};

export const useDeleteFaculty = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => facultiesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faculties'] });
        },
    });
};

// ============================================
// DEPARTMENT QUERIES (Admin)
// ============================================

export const useDepartments = (params?: DepartmentQueryParams): UseQueryResult<PaginatedResponse<Department>, Error> => {
    return useQuery({
        queryKey: ['departments', params],
        queryFn: () => departmentsApi.getAll(params),
    });
};

export const useDepartment = (id: number): UseQueryResult<Department, Error> => {
    return useQuery({
        queryKey: ['departments', id],
        queryFn: () => departmentsApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateDepartment = (): UseMutationResult<Department, Error, CreateDepartmentRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (departmentData: CreateDepartmentRequest) => departmentsApi.create(departmentData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });
};

export const useUpdateDepartment = (): UseMutationResult<Department, Error, { id: number; data: UpdateDepartmentRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentRequest }) => departmentsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            queryClient.invalidateQueries({ queryKey: ['departments', variables.id] });
        },
    });
};

export const useDeleteDepartment = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => departmentsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });
};

// ============================================
// MODE OF ENTRY QUERIES (Admin)
// ============================================

export const useModeOfEntries = (params?: ModeOfEntryQueryParams): UseQueryResult<PaginatedResponse<ModeOfEntry>, Error> => {
    return useQuery({
        queryKey: ['modeOfEntries', params],
        queryFn: () => modeOfEntriesApi.getAll(params),
    });
};

export const useModeOfEntry = (id: number): UseQueryResult<ModeOfEntry, Error> => {
    return useQuery({
        queryKey: ['modeOfEntries', id],
        queryFn: () => modeOfEntriesApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateModeOfEntry = (): UseMutationResult<ModeOfEntry, Error, CreateModeOfEntryRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (modeOfEntryData: CreateModeOfEntryRequest) => modeOfEntriesApi.create(modeOfEntryData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modeOfEntries'] });
        },
    });
};

export const useUpdateModeOfEntry = (): UseMutationResult<ModeOfEntry, Error, { id: number; data: UpdateModeOfEntryRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateModeOfEntryRequest }) => modeOfEntriesApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['modeOfEntries'] });
            queryClient.invalidateQueries({ queryKey: ['modeOfEntries', variables.id] });
        },
    });
};

export const useDeleteModeOfEntry = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => modeOfEntriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modeOfEntries'] });
        },
    });
};

// ============================================
// PROGRAM QUERIES (Admin)
// ============================================

export const usePrograms = (params?: ProgramQueryParams): UseQueryResult<PaginatedResponse<Program>, Error> => {
    return useQuery({
        queryKey: ['programs', params],
        queryFn: () => programsApi.getAll(params),
    });
};

export const useProgram = (id: number): UseQueryResult<Program, Error> => {
    return useQuery({
        queryKey: ['programs', id],
        queryFn: () => programsApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateProgram = (): UseMutationResult<Program, Error, CreateProgramRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (programData: CreateProgramRequest) => programsApi.create(programData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
        },
    });
};

export const useUpdateProgram = (): UseMutationResult<Program, Error, { id: number; data: UpdateProgramRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProgramRequest }) => programsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['programs', variables.id] });
        },
    });
};

export const useDeleteProgram = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => programsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
        },
    });
};

// ============================================
// REGISTRATIONS
// ============================================

export const useRegistrations = (params?: RegistrationQueryParams): UseQueryResult<PaginatedResponse<Registration>, Error> => {
    return useQuery({
        queryKey: ['registrations', params],
        queryFn: () => registrationsApi.getAll(params),
    });
};

export const useRegistration = (id: number): UseQueryResult<Registration, Error> => {
    return useQuery({
        queryKey: ['registrations', id],
        queryFn: () => registrationsApi.getById(id),
        enabled: !!id,
    });
};

export const useClearRegistration = (): UseMutationResult<Registration, Error, { id: number; data: ClearRegistrationRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ClearRegistrationRequest }) => registrationsApi.clearRegistration(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            queryClient.invalidateQueries({ queryKey: ['registrations', variables.id] });
            toast.success('Registration clearance updated successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
};

// ============================================
// REGISTRATION FEE ITEMS
// ============================================

export const useRegistrationFeeItems = (params?: RegistrationFeeItemQueryParams): UseQueryResult<PaginatedResponse<RegistrationFeeItem>, Error> => {
    return useQuery({
        queryKey: ['registration-fee-items', params],
        queryFn: () => registrationFeeItemsApi.getAll(params),
    });
};

export const useRegistrationFeeItem = (id: number): UseQueryResult<RegistrationFeeItem, Error> => {
    return useQuery({
        queryKey: ['registration-fee-items', id],
        queryFn: () => registrationFeeItemsApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateRegistrationFeeItem = (): UseMutationResult<RegistrationFeeItem, Error, CreateRegistrationFeeItemRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemData: CreateRegistrationFeeItemRequest) => registrationFeeItemsApi.create(itemData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registration-fee-items'] });
            toast.success('Registration fee item created successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
};

export const useUpdateRegistrationFeeItem = (): UseMutationResult<RegistrationFeeItem, Error, { id: number; data: UpdateRegistrationFeeItemRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateRegistrationFeeItemRequest }) => registrationFeeItemsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['registration-fee-items'] });
            queryClient.invalidateQueries({ queryKey: ['registration-fee-items', variables.id] });
            toast.success('Registration fee item updated successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
};

export const useDeleteRegistrationFeeItem = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => registrationFeeItemsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registration-fee-items'] });
            toast.success('Registration fee item deleted successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
};

// ============================================
// SUNDRY PAYMENT ITEMS
// ============================================

export const useSundryPaymentItems = (params?: SundryPaymentItemQueryParams): UseQueryResult<PaginatedResponse<SundryPaymentItem>, Error> => {
    return useQuery({
        queryKey: ['sundry-payment-items', params],
        queryFn: () => sundryPaymentItemsApi.getAll(params),
    });
};

export const useSundryPaymentItem = (id: number): UseQueryResult<SundryPaymentItem, Error> => {
    return useQuery({
        queryKey: ['sundry-payment-items', id],
        queryFn: () => sundryPaymentItemsApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateSundryPaymentItem = (): UseMutationResult<SundryPaymentItem, Error, CreateSundryPaymentItemRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemData: CreateSundryPaymentItemRequest) => sundryPaymentItemsApi.create(itemData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sundry-payment-items'] });
            toast.success('Sundry payment item created successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
};

export const useUpdateSundryPaymentItem = (): UseMutationResult<SundryPaymentItem, Error, { id: number; data: UpdateSundryPaymentItemRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateSundryPaymentItemRequest }) => sundryPaymentItemsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sundry-payment-items'] });
            queryClient.invalidateQueries({ queryKey: ['sundry-payment-items', variables.id] });
            toast.success('Sundry payment item updated successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
};

export const useDeleteSundryPaymentItem = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => sundryPaymentItemsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sundry-payment-items'] });
            toast.success('Sundry payment item deleted successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
};

// ============================================
// COURSES
// ============================================

export const useCourses = (params?: CourseQueryParams): UseQueryResult<PaginatedResponse<Course>, Error> => {
    return useQuery({
        queryKey: ['courses', params],
        queryFn: () => coursesApi.getAll(params),
    });
};

export const useCourse = (id: number): UseQueryResult<Course, Error> => {
    return useQuery({
        queryKey: ['courses', id],
        queryFn: () => coursesApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateCourse = (): UseMutationResult<Course, Error, CreateCourseRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (courseData: CreateCourseRequest) => coursesApi.create(courseData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success('Course created successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
};

export const useUpdateCourse = (): UseMutationResult<Course, Error, { id: number; data: UpdateCourseRequest }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCourseRequest }) => coursesApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
            toast.success('Course updated successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
};

export const useDeleteCourse = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => coursesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success('Course deleted successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
};

export function useCustomQuery<T>(queryKey: unknown[], queryFn: () => Promise<T>, options?: unknown) {
    return useQuery({
        queryKey,
        queryFn: async () => {
            try {
                const data = await queryFn();
                toast.success('Data fetched successfully!');
                return data;
            } catch (error) {
                toast.error('Failed to fetch data. Please try again.');
                throw error;
            }
        },
        ...((options as object) || {}),
    });
}

export function useCustomMutation<T, V>(mutationFn: (variables: V) => Promise<T>, options?: unknown) {
    return useMutation({
        mutationFn: async (variables: V) => {
            try {
                const data = await mutationFn(variables);
                toast.success('Operation completed successfully!');
                return data;
            } catch (error) {
                toast.error('Operation failed. Please try again.');
                throw error;
            }
        },
        ...((options as object) || {}),
    });
}
