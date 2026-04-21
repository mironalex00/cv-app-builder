import axios from 'axios';

export interface CountryData {
    code: string; // ISO 2 (cca2)
    name: string; // common name (English)
    flag?: string;
    translations?: Record<string, { common: string; official: string }>;
}

export interface StateData {
    id?: number;
    name: string;
    isoCode?: string;
    countryCode?: string;
}

export interface CityData {
    id?: number;
    name: string;
    stateCode?: string;
}

let cachedCountries: CountryData[] | null = null;

export const fetchCountries = async (): Promise<CountryData[]> => {
    if (cachedCountries) return cachedCountries;

    try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2,flags,translations');
        cachedCountries = response.data.map((country: { cca2: string; name: { common: string }; flags: { png?: string; svg?: string }; translations: Record<string, { common: string; official: string }> }) => ({
            code: country.cca2,
            name: country.name.common,
            flag: country.flags.png || country.flags.svg,
            translations: country.translations
        }));
        cachedCountries?.sort((a, b) => a.name.localeCompare(b.name));
        return cachedCountries || [];
    } catch {
        return [];
    }
};

export const fetchStates = async (countryName: string): Promise<StateData[]> => {
    try {
        const response = await axios.post('https://countriesnow.space/api/v0.1/countries/states', {
            country: countryName
        });
        
        if (response.data && !response.data.error) {
            return response.data.data.states.map((state: { name: string; state_code: string }, index: number) => ({
                id: index,
                name: state.name,
                isoCode: state.state_code,
                countryCode: '' // No lo devuelve directamente este endpoint de la misma forma
            }));
        }
        return [];
    } catch {
        return [];
    }
};