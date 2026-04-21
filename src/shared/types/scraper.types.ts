// src/types/scraper.types.ts

export interface ScrapedExperience {
    title?: string;
    company?: string;
    date?: string;           // Formato "ene 2020 - dic 2022"
}

export interface ScrapedEducation {
    school?: string;
    degree?: string;
    fieldOfStudy?: string;
}

export interface ScrapedProfileData {
    experience?: ScrapedExperience[];
    education?: ScrapedEducation[];
    skills?: string[];
}