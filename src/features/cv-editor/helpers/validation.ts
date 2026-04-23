import type { ResumeData } from '../../../shared/types/resume.types';

// ============================================================================
// Constants
// ============================================================================
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// ============================================================================
// Public handlers
// ============================================================================
export function isNonEmptyString(val: unknown): val is string {
    return typeof val === 'string' && val.trim().length > 0;
}
export function isFormValid(data: ResumeData): boolean {
    const { personalInfo, experience, education } = data;

    const hasBasicInfo =
        isNonEmptyString(personalInfo.firstName) &&
        isNonEmptyString(personalInfo.lastName) &&
        isNonEmptyString(personalInfo.headline) &&
        isNonEmptyString(personalInfo.phone) &&
        isNonEmptyString(personalInfo.location);

    const hasValidEmail = EMAIL_REGEX.test(personalInfo.email);

    const hasFullExperience = experience.some(
        (exp) =>
            isNonEmptyString(exp.title) &&
            isNonEmptyString(exp.company) &&
            isNonEmptyString(exp.employmentType) &&
            isNonEmptyString(exp.workMode) &&
            isNonEmptyString(exp.startDate) &&
            isNonEmptyString(exp.endDate) &&
            isNonEmptyString(exp.description) &&
            isNonEmptyString(exp.location)
    );

    const hasFullEducation = education.some(
        (edu) =>
            isNonEmptyString(edu.school) &&
            isNonEmptyString(edu.degree) &&
            isNonEmptyString(edu.fieldOfStudy) &&
            isNonEmptyString(edu.startYear) &&
            isNonEmptyString(edu.endYear)
    );

    return hasBasicInfo && hasValidEmail && (hasFullExperience || hasFullEducation);
}