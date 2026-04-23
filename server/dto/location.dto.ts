import type { Country, State, City, Timezone } from '../shared/location/location.types.js';

export interface CountryDTO {
    readonly id: number;
    readonly name: string;
    readonly phoneCode: number;
    readonly capital: string | null;
    readonly currency: string | null;
    readonly region: string | null;
    readonly subregion: string | null;
    readonly population: number | null;
    readonly latitude: number | null;
    readonly longitude: number | null;
    readonly timezones: readonly Timezone[];
    readonly searchTerms: readonly string[];
}
export interface StateDTO {
    readonly id: number;
    readonly name: string;
    readonly latitude: number | null;
    readonly longitude: number | null;
    readonly type: string | null;
    readonly native: string | null;
    readonly country: {
        readonly id: number;
        readonly name: string;
    };
    readonly searchTerms: readonly string[];
}
export interface CityDTO {
    readonly id: number;
    readonly name: string;
    readonly latitude: number | null;
    readonly longitude: number | null;
    readonly timezone: string;
    readonly state: {
        readonly id: number;
        readonly name: string;
    };
    readonly searchTerms: readonly string[];
}

export function toCountryDTO(country: Country): CountryDTO {
    return {
        id: country.id,
        name: country.name,
        phoneCode: country.phoneCode,
        capital: country.capital,
        currency: country.currency,
        region: country.region,
        subregion: country.subregion,
        population: country.population,
        latitude: country.coords.latitude,
        longitude: country.coords.longitude,
        timezones: country.timezones,
        searchTerms: country.searchTerms,
    };
}
export function toStateDTO(state: State): StateDTO {
    return {
        id: state.id,
        name: state.name,
        latitude: state.coords.latitude,
        longitude: state.coords.longitude,
        type: state.type,
        native: state.native,
        country: {
            id: state.country.id,
            name: state.country.name,
        },
        searchTerms: state.searchTerms,
    };
}
export function toCityDTO(city: City): CityDTO {
    return {
        id: city.id,
        name: city.name,
        latitude: city.coords.latitude,
        longitude: city.coords.longitude,
        timezone: city.timezone,
        state: {
            id: city.state.id,
            name: city.state.name,
        },
        searchTerms: city.searchTerms,
    };
}

export function toCountryDTOArray(countries: readonly Country[]): CountryDTO[] {
    const len = countries.length;
    const result = new Array<CountryDTO>(len);
    for (let i = 0; i < len; i++) {
        result[i] = toCountryDTO(countries[i]);
    }
    return result;
}
export function toStateDTOArray(states: readonly State[]): StateDTO[] {
    const len = states.length;
    const result = new Array<StateDTO>(len);
    for (let i = 0; i < len; i++) {
        result[i] = toStateDTO(states[i]);
    }
    return result;
}
export function toCityDTOArray(cities: readonly City[]): CityDTO[] {
    const len = cities.length;
    const result = new Array<CityDTO>(len);
    for (let i = 0; i < len; i++) {
        result[i] = toCityDTO(cities[i]);
    }
    return result;
}