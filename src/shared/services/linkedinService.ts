import type { ScrapedProfileData } from '../types/scraper.types';

const API_BASE = '/api'; // Use relative path, Vite proxy/SSR handles this

export async function fetchLinkedInProfile(linkedinUrl: string): Promise<ScrapedProfileData> {
    const response = await fetch(`${API_BASE}/linkedin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
    }

    return response.json();
}