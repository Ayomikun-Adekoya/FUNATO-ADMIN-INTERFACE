import type { Application } from '@/types/api';
import { formatDate } from './date';

/**
 * Flattens a single recruitment application record into export rows
 * For CSV/Excel: Creates one row per sub-item (education, work experience, document)
 * For summary: Creates a single comprehensive row with all details concatenated
 */

export interface RecruitmentExportRow {
    // Personal Information
    applicant_id: string;
    form_of_address: string;
    first_name: string;
    last_name: string;
    other_name: string;
    full_name: string;

    // Demographics
    gender: string;
    date_of_birth: string;
    nationality: string;
    marital_status: string;
    state_of_origin: string;
    home_town: string;
    lga: string;

    // Contact & Identification
    residential_address: string;
    email: string;
    phone: string;

    // Position & Department
    position_type: string;
    position_applied_for: string;
    college: string;
    department: string;
    preferred_start_date: string;

    // Additional Info
    how_did_you_hear: string;
    status: string;
    created_at: string;
    updated_at: string;

    // Educational Background (concatenated or separate rows)
    education_institution?: string;
    education_certificate?: string;
    education_class?: string;
    education_year?: string;

    // Work Experience (concatenated or separate rows)
    work_organization?: string;
    work_job_title?: string;
    work_start_date?: string;
    work_end_date?: string;
    work_responsibility?: string;

    // Professional Certification (concatenated or separate rows)
    certification_name?: string;
    certification_issuer?: string;
    certification_date?: string;

    // Reference (concatenated or separate rows)
    reference_full_name?: string;
    reference_phone?: string;
    reference_relationship?: string;

    // Document Info (concatenated or separate rows)
    document_type?: string;
    document_file_name?: string;
    document_mime_type?: string;
    document_size?: string;
}

/**
 * Flattens application data for CSV/Excel export
 * If expandDetails is true, creates multiple rows per application (one per nested item)
 * If expandDetails is false, concatenates all nested items into single row
 */
export function flattenApplicationForExport(
    app: Application,
    expandDetails: boolean = false
): RecruitmentExportRow[] {
    const baseRow: RecruitmentExportRow = {
        applicant_id: app.applicant_id || '',
        form_of_address: app.form_of_address || '',
        first_name: app.first_name || '',
        last_name: app.last_name || '',
        other_name: app.other_name || '',
        full_name: `${app.first_name || ''} ${app.last_name || ''}`.trim(),
        gender: app.gender || '',
        date_of_birth: app.date_of_birth ? formatDate(app.date_of_birth) : '',
        nationality: app.nationality || '',
        marital_status: app.marital_status || '',
        state_of_origin: app.state_of_origin || '',
        home_town: app.home_town || '',
        lga: app.lga || '',
        residential_address: app.residential_address || '',
        email: app.email || '',
        phone: app.phone || '',
        position_type: app.position_type || '',
        position_applied_for: app.position_applied_for || '',
        college: app.college || '',
        department: app.department || '',
        preferred_start_date: app.preferred_start_date ? formatDate(app.preferred_start_date) : '',
        how_did_you_hear: app.how_did_you_hear || '',
        status: app.status || '',
        created_at: app.created_at ? formatDate(app.created_at) : '',
        updated_at: app.updated_at ? formatDate(app.updated_at) : '',
    };

    if (!expandDetails) {
        // Concatenate all nested items into single row
        const educationList =
            app.educational_backgrounds?.map((e) => `${e.institution_name} (${e.certificate_obtained}, ${e.class_of_degree}, ${e.year_attained})`).join('; ') ||
            '';

        const workList =
            app.work_experiences?.map((w) => {
                const startDate = w.start_date ? formatDate(w.start_date) : '';
                const endDate = w.end_date ? formatDate(w.end_date) : '';
                return `${w.job_title} at ${w.organization_name} (${startDate} - ${endDate})`;
            }).join('; ') ||
            '';

        const certList = app.professional_certifications?.map((c) => `${c.certification_name}`).join('; ') || '';

        const refList = app.references?.map((r) => `${r.full_name} (${r.phone})`).join('; ') || '';

        const docList = app.documents?.map((d) => `${d.document_type}: ${d.file_name}`).join('; ') || '';

        return [
            {
                ...baseRow,
                education_institution: educationList,
                work_organization: workList,
                certification_name: certList,
                reference_full_name: refList,
                document_type: docList,
            },
        ];
    }

    // Expand details: create multiple rows per application
    // Find the maximum nested items to determine row count
    const maxItems = Math.max(
        app.educational_backgrounds?.length || 0,
        app.work_experiences?.length || 0,
        app.professional_certifications?.length || 0,
        app.references?.length || 0,
        app.documents?.length || 0,
        1 // At least one row even if no nested items
    );

    const rows: RecruitmentExportRow[] = [];

    for (let i = 0; i < maxItems; i++) {
        const row: RecruitmentExportRow = { ...baseRow };

        // Add education details if available
        if (app.educational_backgrounds && i < app.educational_backgrounds.length) {
            const edu = app.educational_backgrounds[i];
            row.education_institution = edu.institution_name || '';
            row.education_certificate = edu.certificate_obtained || '';
            row.education_class = edu.class_of_degree || '';
            row.education_year = edu.year_attained || '';
        }

        // Add work experience details if available
        if (app.work_experiences && i < app.work_experiences.length) {
            const work = app.work_experiences[i];
            row.work_organization = work.organization_name || '';
            row.work_job_title = work.job_title || '';
            row.work_start_date = work.start_date ? formatDate(work.start_date) : '';
            row.work_end_date = work.end_date ? formatDate(work.end_date) : '';
            row.work_responsibility = work.responsibility || '';
        }

        // Add professional certification details if available
        if (app.professional_certifications && i < app.professional_certifications.length) {
            const cert = app.professional_certifications[i];
            row.certification_name = cert.certification_name || '';
            row.certification_issuer = cert.issuing_organization || '';
            row.certification_date = cert.date_obtained ? formatDate(cert.date_obtained) : '';
        }

        // Add reference details if available
        if (app.references && i < app.references.length) {
            const ref = app.references[i];
            row.reference_full_name = ref.full_name || '';
            row.reference_phone = ref.phone || '';
            row.reference_relationship = ref.relationship || '';
        }

        // Add document details if available
        if (app.documents && i < app.documents.length) {
            const doc = app.documents[i];
            row.document_type = doc.document_type || '';
            row.document_file_name = doc.file_name || '';
            row.document_mime_type = doc.mime_type || '';
            row.document_size = doc.size ? `${(doc.size / 1024).toFixed(2)} KB` : '';
        }

        rows.push(row);
    }

    return rows;
}

/**
 * Get comprehensive export columns with all detail fields
 * Can be filtered based on what details need to be included
 */
export function getRecruitmentExportColumns(
    includeDetails: boolean = true
): Array<{ key: string; header: string }> {
    const baseColumns = [
        { key: 'applicant_id', header: 'Applicant ID' },
        { key: 'form_of_address', header: 'Title' },
        { key: 'first_name', header: 'First Name' },
        { key: 'last_name', header: 'Last Name' },
        { key: 'other_name', header: 'Other Name' },
        { key: 'full_name', header: 'Full Name' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Phone' },
        { key: 'gender', header: 'Gender' },
        { key: 'date_of_birth', header: 'Date of Birth' },
        { key: 'nationality', header: 'Nationality' },
        { key: 'marital_status', header: 'Marital Status' },
        { key: 'state_of_origin', header: 'State of Origin' },
        { key: 'home_town', header: 'Home Town' },
        { key: 'lga', header: 'LGA' },
        { key: 'residential_address', header: 'Residential Address' },
        { key: 'position_type', header: 'Position Type' },
        { key: 'position_applied_for', header: 'Position Applied For' },
        { key: 'college', header: 'College' },
        { key: 'department', header: 'Department' },
        { key: 'preferred_start_date', header: 'Preferred Start Date' },
        { key: 'how_did_you_hear', header: 'How Did You Hear' },
        { key: 'status', header: 'Status' },
        { key: 'created_at', header: 'Application Date' },
        { key: 'updated_at', header: 'Last Updated' },
    ];

    if (!includeDetails) {
        return baseColumns;
    }

    // Add detail columns
    const detailColumns = [
        // Education
        { key: 'education_institution', header: 'Education - Institution' },
        { key: 'education_certificate', header: 'Education - Certificate' },
        { key: 'education_class', header: 'Education - Class of Degree' },
        { key: 'education_year', header: 'Education - Year Attained' },

        // Work Experience
        { key: 'work_organization', header: 'Work Experience - Organization' },
        { key: 'work_job_title', header: 'Work Experience - Job Title' },
        { key: 'work_start_date', header: 'Work Experience - Start Date' },
        { key: 'work_end_date', header: 'Work Experience - End Date' },
        { key: 'work_responsibility', header: 'Work Experience - Responsibility' },

        // Professional Certification
        { key: 'certification_name', header: 'Certification - Name' },
        { key: 'certification_issuer', header: 'Certification - Issuer' },
        { key: 'certification_date', header: 'Certification - Date' },

        // Reference
        { key: 'reference_full_name', header: 'Reference - Full Name' },
        { key: 'reference_phone', header: 'Reference - Phone' },
        { key: 'reference_relationship', header: 'Reference - Relationship' },

        // Document
        { key: 'document_type', header: 'Document - Type' },
        { key: 'document_file_name', header: 'Document - File Name' },
        { key: 'document_mime_type', header: 'Document - MIME Type' },
        { key: 'document_size', header: 'Document - Size' },
    ];

    return [...baseColumns, ...detailColumns];
}

/**
 * Format nested details for display in a single cell
 * Useful for summary views
 */
export function formatApplicationDetails(app: Application): {
    educationSummary: string;
    workSummary: string;
    certSummary: string;
    refSummary: string;
    docSummary: string;
} {
    return {
        educationSummary:
            app.educational_backgrounds?.map((e) => `${e.institution_name} (${e.certificate_obtained})`).join('; ') || 'None',

        workSummary:
            app.work_experiences?.map((w) => `${w.job_title} at ${w.organization_name}`).join('; ') || 'None',

        certSummary: app.professional_certifications?.map((c) => c.certification_name).join('; ') || 'None',

        refSummary: app.references?.map((r) => `${r.full_name}`).join('; ') || 'None',

        docSummary: app.documents?.map((d) => d.document_type).join('; ') || 'None',
    };
}
