import type { City, Country, RawCountry, State, Translations } from './location.types.ts';

// ----------------------------------------------------------------------------
// Internas
// ----------------------------------------------------------------------------
function parseNumericField(value: string | number | null | undefined): number | null {
    if (value == null || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}
function parseCoordinate(value: string | number | null | undefined): number {
    if (value == null || value === '') return 0;
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
}

// ----------------------------------------------------------------------------
// Exported
// ----------------------------------------------------------------------------
export function transformCountryData(rawCountries: RawCountry[]): Country[] {
    const compactCountries: Country[] = new Array(rawCountries.length);

    for (let i = 0; i < rawCountries.length; i++) {
        const raw = rawCountries[i];

        if (!raw || typeof raw !== 'object') continue;

        const countryId = Number(raw.id) || 0;
        const countryName = String(raw.name ?? '');
        const phoneCode = parseNumericField(raw.phonecode) ?? 0;
        const capital = raw.capital ? String(raw.capital) : null;
        const currency = raw.currency ? String(raw.currency) : null;
        const region = raw.region ? String(raw.region) : null;
        const subregion = raw.subregion ? String(raw.subregion) : null;
        const population = parseNumericField(raw.population);
        const latitude = parseCoordinate(raw.latitude);
        const longitude = parseCoordinate(raw.longitude);
        const translations = (raw.translations || {}) as Translations;
        const timezones = Array.isArray(raw.timezones)
            ? raw.timezones.filter(tz => tz !== null && typeof tz === 'object')
            : [];

        const countryRef = {
            id: countryId,
            name: countryName,
        };

        const rawStates = Array.isArray(raw.states) ? raw.states : [];
        const states: State[] = new Array(rawStates.length);

        for (let j = 0; j < rawStates.length; j++) {
            const rawState = rawStates[j];
            if (!rawState || typeof rawState !== 'object') continue;

            const stateId = Number(rawState.id) || 0;
            const stateName = String(rawState.name ?? '');
            const stateType = rawState.type ? String(rawState.type) : null;
            const stateNative = rawState.native ? String(rawState.native) : null;

            const stateLat = parseNumericField(rawState.latitude);
            const stateLng = parseNumericField(rawState.longitude);

            const stateRef = {
                id: stateId,
                name: stateName,
            };

            const rawCities = Array.isArray(rawState.cities) ? rawState.cities : [];
            const cities: City[] = new Array(rawCities.length);

            for (let k = 0; k < rawCities.length; k++) {
                const rawCity = rawCities[k];
                if (!rawCity || typeof rawCity !== 'object') continue;

                const searchTerms = [String(rawCity.name ?? '').toLowerCase()];
                cities[k] = {
                    id: Number(rawCity.id) || 0,
                    name: String(rawCity.name ?? ''),
                    coords: {
                        latitude: parseCoordinate(rawCity.latitude),
                        longitude: parseCoordinate(rawCity.longitude)
                    },
                    timezone: String(rawCity.timezone ?? ''),
                    state: stateRef,
                    searchTerms
                };
            }

            const stateSearchTerms = [stateName.toLowerCase()];
            states[j] = {
                id: stateId,
                name: stateName,
                coords: { latitude: stateLat, longitude: stateLng },
                type: stateType,
                native: stateNative,
                country: countryRef,
                cities,
                searchTerms: stateSearchTerms
            };
        }

        const countrySearchTerms = [countryName.toLowerCase()];
        if (translations) {
            for (const key of Object.keys(translations)) {
                const value = translations[key];
                if (!!value && typeof value === 'string' && value.length > 0) {
                    countrySearchTerms.push(value.toLowerCase());
                }
            }
        }

        compactCountries[i] = {
            id: countryId,
            name: countryName,
            phoneCode,
            capital,
            currency,
            region,
            subregion,
            population,
            coords: { latitude, longitude },
            timezones,
            translations,
            states,
            searchTerms: countrySearchTerms
        };
    }

    return compactCountries;
}