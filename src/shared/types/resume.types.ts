export interface Experience {
    id: string;
    title: string;
    company: string;
    employmentType: string; // Full-time, Part-time, Contract, etc.
    workMode: string; // Presencial, Remoto, Híbrido
    startDate: string; // Formato YYYY-MM
    endDate: string; // Formato YYYY-MM o "Presente"
    description: string;
    location?: string;
}

export interface Education {
    id: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    startYear: string; // YYYY-MM
    endYear: string; // YYYY-MM o "Presente"
    description?: string;
}

export interface Certification {
    id: string;
    name: string;
    authority: string;
    issueDate?: string;
    expirationDate?: string;
    url?: string;
}

export interface Language {
    id: string;
    name: string;
    proficiency: string; // Nativo, Bilingüe, Profesional, etc.
}

export interface ResumeData {
    personalInfo: {
        firstName: string;
        lastName: string;
        headline: string;
        email: string;
        phone: string;
        location: string;
        summary: string;
        profilePicture?: string;
    };
    experience: Experience[];
    education: Education[];
    skills: string[];
    certifications: Certification[];
    languages: Language[];
}