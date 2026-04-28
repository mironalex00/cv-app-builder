import axios from 'axios';

const API_BASE = '/api';

let cachedCountries: CountryData[] | null = null;
let cachedStates: StateData[] | null = null;

// ============================================================================
// Interfaces
// ============================================================================
export interface CountryData {
    id: number;
    name: string;
    phoneCode?: string;
    searchTerms?: string[];
}

export interface StateData {
    id: number;
    name: string;
    countryCode?: string;
    stateCode?: string;
    searchTerms?: string[];
    country?: Partial<CountryData>;
}

// ============================================================================
// Fetch services
// ============================================================================
export const fetchCountries = async (): Promise<CountryData[]> => {
    if (cachedCountries) {
        return cachedCountries;
    }

    try {
        const response = await axios.get(`${API_BASE}/countries`);
        const { success, data } = response.data;

        if (success && Array.isArray(data)) {
            cachedCountries = data.map((country: CountryData) => ({
                id: country.id,
                name: country.name,
                phoneCode: country.phoneCode,
                searchTerms: country.searchTerms
            }));
            cachedCountries.sort((a, b) => a.name.localeCompare(b.name));
            return cachedCountries || [];
        }
        return [];
    } catch {
        return [];
    }
};

export const fetchStates = async (id: number): Promise<StateData[]> => {
    if (cachedStates) {
        return cachedStates;
    }

    try {
        const response = await axios.get(`${API_BASE}/states/${id}`);
        const { success, data } = response.data;

        if (
            success !== true ||
            !data ||
            typeof data !== 'object' ||
            !('country' in data) ||
            !('states' in data) ||
            !Array.isArray(data.states)
        ) {
            return [];
        }

        cachedStates = (data.states as StateData[])
            .map((state: StateData) => ({
                ...state,
                searchTerms: state.searchTerms ?? [state.name.toLowerCase()],
            }))
            .sort((a: StateData, b: StateData) => a.name.localeCompare(b.name));
        return cachedStates || [];
    } catch {
        return [];
    }
};