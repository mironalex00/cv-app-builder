import { DATA_DIR, EntityLookup, ServiceArray } from '../common.js';

import { createEntityLookup } from '../utils/entityLookup.js';
import DataSourceServiceBuilder, { type DataSourceService } from '../utils/serviceBuilder.js';

// ============================================================================
// Path & URL Configuration
// ============================================================================
const DATA_FILE = 'countries.json';
const GITHUB_SOURCE = 'https://raw.githubusercontent.com';
const BLOCK_LIST_REPO = 'dr5hn/countries-states-cities-database/refs/heads/master/json';
const BLOCK_LIST_FILE = 'countries+states+cities.json';
const SOURCE_URL = `${GITHUB_SOURCE}/${BLOCK_LIST_REPO}/${BLOCK_LIST_FILE}`;

// ============================================================================
// Interfaces
// ============================================================================
export interface Timezone {
    zoneName: string;
    gmtOffset: number;
    gmtOffsetName: string;
    abbreviation: string;
    tzName: string;
}

export interface Translations {
    br?: string;
    ko?: string;
    'pt-BR'?: string;
    pt?: string;
    nl?: string;
    hr?: string;
    fa?: string;
    de?: string;
    es?: string;
    fr?: string;
    ja?: string;
    it?: string;
    'zh-CN'?: string;
    tr?: string;
    ru?: string;
    uk?: string;
    pl?: string;
    ar?: string;
    hi?: string;
    [locale: string]: string | undefined;
}

interface RawCity {
    id?: number | string | null;
    name?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
    timezone?: string | null;
}

interface RawState {
    id?: number | string | null;
    name?: string | null;
    type?: string | null;
    native?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
    cities?: RawCity[] | null;
}

interface RawCountry {
    id?: number | string | null;
    name?: string | null;
    phonecode?: string | number | null;
    capital?: string | null;
    currency?: string | null;
    region?: string | null;
    subregion?: string | null;
    population?: string | number | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
    translations?: Record<string, unknown> | null;
    timezones?: readonly unknown[] | null;
    states?: RawState[] | null;
}

interface CountryRef {
    readonly id: number;
    readonly name: string;
}

interface StateRef {
    readonly id: number;
    readonly name: string;
}

// ============================================================================
// Classes
// ============================================================================
export class Coordinates {
    constructor(
        public readonly latitude: number | null,
        public readonly longitude: number | null
    ) { }
}

export class City {
    public readonly searchTerms: readonly string[];

    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly coords: Coordinates,
        public readonly timezone: string,
        public readonly state: StateRef
    ) {
        this.searchTerms = Object.freeze([name.toLowerCase()]);
    }
}

export class State {
    public readonly searchTerms: readonly string[];

    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly coords: Coordinates,
        public readonly type: string | null,
        public readonly native: string | null,
        public readonly country: CountryRef,
        public readonly cities: readonly City[]
    ) {
        const terms: string[] = [name.toLowerCase()];
        this.searchTerms = Object.freeze(terms);
    }
}

export class Country {
    public readonly searchTerms: readonly string[];

    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly phoneCode: number,
        public readonly capital: string | null,
        public readonly currency: string | null,
        public readonly region: string | null,
        public readonly subregion: string | null,
        public readonly population: number | null,
        public readonly coords: Coordinates,
        public readonly timezones: readonly Timezone[],
        public readonly translations: Translations,
        public readonly states: readonly State[]
    ) {
        const terms: string[] = [name.toLowerCase()];
        if (translations) {
            for (const key of Object.keys(translations)) {
                const value = translations[key];
                if (!!value && typeof value === 'string' && value.length > 0) {
                    terms.push(value.toLowerCase());
                }
            }
        }
        this.searchTerms = Object.freeze(terms);
    }
}

// ============================================================================
// Global Indexes
// ============================================================================
const countryMap: Map<string, Country> = new Map();
const countriesArray: ServiceArray<Country> = new ServiceArray();
const stateMap: Map<string, State> = new Map();
const allStates: State[] = [];
const cityMap: Map<string, City> = new Map();
const allCities: City[] = [];

// ============================================================================
// Parsing Utilities
// ============================================================================
function isCountryArray(data: unknown): data is Country[] {
    if (!Array.isArray(data) || data.length === 0) return false;
    const first = data[0];
    return first instanceof Country ||
        (typeof first === 'object' && first !== null && 'searchTerms' in first && 'states' in first);
}

function repopulateGlobalMaps(countries: Country[]): void {
    countryMap.clear();
    stateMap.clear();
    cityMap.clear();
    allStates.length = 0;
    allCities.length = 0;

    for (const country of countries) {
        countryMap.set(String(country.id), country);
        countryMap.set(country.name.toLowerCase(), country);

        for (const state of country.states) {
            stateMap.set(String(state.id), state);
            stateMap.set(state.name.toLowerCase(), state);
            allStates.push(state);

            for (const city of state.cities) {
                cityMap.set(String(city.id), city);
                cityMap.set(city.name.toLowerCase(), city);
                allCities.push(city);
            }
        }
    }
}

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

function transformCountryData(rawCountries: RawCountry[]): Country[] {

    countryMap.clear();
    stateMap.clear();
    cityMap.clear();
    allStates.length = 0;
    allCities.length = 0;

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
        const translations = raw.translations ? Object.freeze(raw.translations as Translations) : {};
        const timezones: Timezone[] = Array.isArray(raw.timezones)
            ? raw.timezones.filter((tz: unknown): tz is Timezone => tz !== null && typeof tz === 'object')
            : [];

        const countryRef: CountryRef = Object.freeze({
            id: countryId,
            name: countryName,
        });

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

            const stateRef: StateRef = Object.freeze({
                id: stateId,
                name: stateName,
            });

            const rawCities = Array.isArray(rawState.cities) ? rawState.cities : [];
            const cities: City[] = new Array(rawCities.length);

            for (let k = 0; k < rawCities.length; k++) {
                const rawCity = rawCities[k];
                if (!rawCity || typeof rawCity !== 'object') continue;

                const city = new City(
                    Number(rawCity.id) || 0,
                    String(rawCity.name ?? ''),
                    new Coordinates(
                        parseCoordinate(rawCity.latitude),
                        parseCoordinate(rawCity.longitude)
                    ),
                    String(rawCity.timezone ?? ''),
                    stateRef
                );

                cities[k] = city;
                cityMap.set(String(city.id), city);
                cityMap.set(city.name.toLowerCase(), city);
                allCities.push(city);
            }

            const state = new State(
                stateId,
                stateName,
                new Coordinates(stateLat, stateLng),
                stateType,
                stateNative,
                countryRef,
                Object.freeze(cities)
            );

            states[j] = state;
            stateMap.set(String(state.id), state);
            stateMap.set(state.name.toLowerCase(), state);
            allStates.push(state);
        }

        const country = new Country(
            countryId,
            countryName,
            phoneCode,
            capital,
            currency,
            region,
            subregion,
            population,
            new Coordinates(latitude, longitude),
            Object.freeze(timezones),
            Object.freeze(translations),
            Object.freeze(states)
        );

        compactCountries[i] = country;
        countryMap.set(String(country.id), country);
        countryMap.set(country.name.toLowerCase(), country);
    }

    return compactCountries;
}

function parseCountryList(content: string): Country[] {

    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new TypeError(`Invalid JSON: ${message}`, { cause: err });
    }

    if (!Array.isArray(parsed)) {
        throw new TypeError('Invalid countries JSON: root must be an array');
    }

    const compactCountries = transformCountryData(parsed as RawCountry[]);
    countriesArray.replace(compactCountries);
    return compactCountries;
}

// ============================================================================
// Service Instance
// ============================================================================

const countryDataSource: DataSourceService<Country, string> = new DataSourceServiceBuilder<Country, string, string>()
    .withDataDir(DATA_DIR)
    .withFilename(DATA_FILE)
    .withSourceUrl(SOURCE_URL)
    .withParser(parseCountryList)
    .withHas((_cache, identifier) => countryMap.has(identifier.toLowerCase()))
    .withDeserializer((data) => {
        if (!Array.isArray(data)) return [];
        if (isCountryArray(data)) {
            const items = data as Country[];
            countriesArray.replace(items);
            repopulateGlobalMaps(items);
            return items;
        }
        const items = transformCountryData(data as RawCountry[]);
        countriesArray.replace(items);
        return items;
    })
    .withRequestConfig({
        timeout: 30_000,
        responseType: 'arraybuffer',
        validateStatus: (status) => status === 200,
        maxContentLength: 100 * 1024 * 1024,
    })
    .build();

// ============================================================================
// Public API – DataSource Lifecycle
// ============================================================================
export const initCountryService = countryDataSource.initialize.bind(countryDataSource);
export const updateCountriesFromSource = countryDataSource.update.bind(countryDataSource);

// ============================================================================
// Public API – Countries
// ============================================================================
export const getCountriesList = (): readonly Country[] => countriesArray;
export const countryCount = (): number => countriesArray.length;
export const getCountry: EntityLookup<Country> = createEntityLookup(countryMap, countriesArray);


// ============================================================================
// Public API – States
// ============================================================================
export const getStatesList = (): readonly State[] => allStates;
export const stateCount = (): number => allStates.length;
export const getState: EntityLookup<State> = createEntityLookup(stateMap, allStates);

// ============================================================================
// Public API – Cities
// ============================================================================
export const getCitiesList = (): readonly City[] => allCities;
export const cityCount = (): number => allCities.length;
export const getCity: EntityLookup<City> = createEntityLookup(cityMap, allCities);