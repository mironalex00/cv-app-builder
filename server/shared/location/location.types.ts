// ============================================================================
// Internal
// ============================================================================
declare interface CountryRef {
    readonly id: number;
    readonly name: string;
}

declare interface StateRef {
    readonly id: number;
    readonly name: string;
}

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

declare interface RawCity {
    id?: number | string | null;
    name?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
    timezone?: string | null;
}

declare interface RawState {
    id?: number | string | null;
    name?: string | null;
    type?: string | null;
    native?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
    cities?: RawCity[] | null;
}

export interface RawCountry {
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
    translations?: Record<string, string> | null;
    timezones?: readonly Timezone[] | null;
    states?: RawState[] | null;
}


// ============================================================================
// Classes
// ============================================================================
export class Coordinates {
    public readonly latitude: number | null;
    public readonly longitude: number | null;

    constructor(
        latitude: number | null,
        longitude: number | null
    ) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

export class City {
    public readonly id: number;
    public readonly name: string;
    public readonly coords: Coordinates;
    public readonly timezone: string;
    public readonly state: StateRef;
    public readonly searchTerms: readonly string[];

    constructor(
        id: number,
        name: string,
        coords: Coordinates,
        timezone: string,
        state: StateRef
    ) {
        this.id = id;
        this.name = name;
        this.coords = coords;
        this.timezone = timezone;
        this.state = state;
        this.searchTerms = Object.freeze([name.toLowerCase()]);
    }
}

export class State {
    public readonly id: number;
    public readonly name: string;
    public readonly coords: Coordinates;
    public readonly type: string | null;
    public readonly native: string | null;
    public readonly country: CountryRef;
    public readonly cities: readonly City[];
    public readonly searchTerms: readonly string[];

    constructor(
        id: number,
        name: string,
        coords: Coordinates,
        type: string | null,
        native: string | null,
        country: CountryRef,
        cities: readonly City[]
    ) {
        this.id = id;
        this.name = name;
        this.coords = coords;
        this.type = type;
        this.native = native;
        this.country = country;
        this.cities = cities;
        const terms: string[] = [name.toLowerCase()];
        this.searchTerms = Object.freeze(terms);
    }
}

export class Country {
    public readonly id: number;
    public readonly name: string;
    public readonly phoneCode: number;
    public readonly capital: string | null;
    public readonly currency: string | null;
    public readonly region: string | null;
    public readonly subregion: string | null;
    public readonly population: number | null;
    public readonly coords: Coordinates;
    public readonly timezones: readonly Timezone[];
    public readonly translations: Translations;
    public readonly states: readonly State[];
    public readonly searchTerms: readonly string[];

    constructor(
        id: number,
        name: string,
        phoneCode: number,
        capital: string | null,
        currency: string | null,
        region: string | null,
        subregion: string | null,
        population: number | null,
        coords: Coordinates,
        timezones: readonly Timezone[],
        translations: Translations,
        states: readonly State[]
    ) {
        this.id = id;
        this.name = name;
        this.phoneCode = phoneCode;
        this.capital = capital;
        this.currency = currency;
        this.region = region;
        this.subregion = subregion;
        this.population = population;
        this.coords = coords;
        this.timezones = timezones;
        this.translations = translations;
        this.states = states;
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