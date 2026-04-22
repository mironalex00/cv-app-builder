import { Worker } from 'node:worker_threads';

import { DATA_DIR, EntityLookup, ServiceArray } from '../common.js';

import { createEntityLookup } from '../utils/entityLookup.js';
import DataSourceServiceBuilder, { type DataSourceService } from '../utils/serviceBuilder.js';

import { transformCountryData } from '../shared/location/location.helpers.js';
import { Country, State, City, Coordinates, RawCountry } from '../shared/location/location.types.js';

// ============================================================================
// Path & URL Configuration
// ============================================================================
const DATA_FILE = 'countries.json';
const GITHUB_SOURCE = 'https://raw.githubusercontent.com';
const BLOCK_LIST_REPO = 'dr5hn/countries-states-cities-database/refs/heads/master/json';
const BLOCK_LIST_FILE = 'countries+states+cities.json';
const SOURCE_URL = `${GITHUB_SOURCE}/${BLOCK_LIST_REPO}/${BLOCK_LIST_FILE}`;



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

function instantiateCountries(rawCountries: Country[]): Country[] {
    const compactCountries: Country[] = new Array(rawCountries.length);

    for (let i = 0; i < rawCountries.length; i++) {
        const raw = rawCountries[i];

        const states: State[] = new Array(raw.states.length);
        const countryRef = { id: raw.id, name: raw.name };

        for (let j = 0; j < raw.states.length; j++) {
            const rawState = raw.states[j];
            const cities: City[] = new Array(rawState.cities.length);
            const stateRef = { id: rawState.id, name: rawState.name };

            for (let k = 0; k < rawState.cities.length; k++) {
                const rawCity = rawState.cities[k];
                cities[k] = new City(
                    rawCity.id,
                    rawCity.name,
                    new Coordinates(rawCity.coords.latitude, rawCity.coords.longitude),
                    rawCity.timezone,
                    stateRef
                );
            }

            states[j] = new State(
                rawState.id,
                rawState.name,
                new Coordinates(rawState.coords.latitude, rawState.coords.longitude),
                rawState.type,
                rawState.native,
                countryRef,
                Object.freeze(cities)
            );
        }

        compactCountries[i] = new Country(
            raw.id,
            raw.name,
            raw.phoneCode,
            raw.capital,
            raw.currency,
            raw.region,
            raw.subregion,
            raw.population,
            new Coordinates(raw.coords.latitude, raw.coords.longitude),
            Object.freeze(raw.timezones),
            Object.freeze(raw.translations),
            Object.freeze(states)
        );
    }

    return compactCountries;
}

function parseCountryList(content: string | ArrayBuffer): Promise<Country[]> {
    return new Promise((resolvePromise, rejectPromise) => {

        const worker = new Worker(
            new URL('../workers/countryWorker.ts', import.meta.url),
            {
                workerData: content,
                execArgv: [...process.execArgv, '--import', 'tsx']
            }
        );

        worker.on('message', (message) => {
            if (message && typeof message === 'object' && 'error' in message) {
                rejectPromise(new Error(message.error));
                return;
            }

            const rawCountries = message as Country[];
            const compactCountries = instantiateCountries(rawCountries);

            countriesArray.replace(compactCountries);
            repopulateGlobalMaps(compactCountries);
            resolvePromise(compactCountries);
        });

        worker.on('error', rejectPromise);
        worker.on('exit', (code) => {
            if (code !== 0) rejectPromise(new Error(`Worker stopped with exit code ${code}`));
        });
    });
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
        const plainObjects = transformCountryData(data as RawCountry[]);
        const items = instantiateCountries(plainObjects);
        countriesArray.replace(items);
        repopulateGlobalMaps(items);
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