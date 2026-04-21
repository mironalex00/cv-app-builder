import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// ============================================================================
// Types
// ============================================================================
export interface DataSourceServiceState<T = string> {
    /** In‑memory cache of parsed items. */
    cache: Set<T>;
    /** Timestamp (ms) of the last successful update, or null if never. */
    lastUpdated: number | null;
    /** Whether the service has been initialized. */
    initialized: boolean;
}
export interface DataSourceServiceConfig<T = string, TRaw = string, TSearch = T> {
    /** Absolute path to the data directory. */
    dataDir: string;
    /** Filename for the persisted cache (e.g., 'domains.json'). */
    filename: string;
    /** Remote URL to fetch the source data from. */
    sourceUrl: string;
    /**
     * Parser function that transforms the raw response text into an array of items.
     * Must be synchronous and pure to avoid deoptimizations.
     */
    parser: (rawContent: TRaw) => T[];
    // parser: (rawContent: string) => T[];
    /** Axios request configuration overrides. */
    requestConfig?: AxiosRequestConfig;
    /** Optional item normalizer (e.g., .toLowerCase()). */
    normalize?: (item: T) => T;

    /** Optional search item normalizer. */
    normalizeSearch?: (item: TSearch) => TSearch;
    /** Overrides default Set.has() resolution for complex caching. */
    has?: (cache: Set<T>, normalizedSearchItem: TSearch) => boolean;
    /** Custom deserializer to reconstruct cached items from disk JSON. */
    deserialize?: (parsedJson: unknown) => T[];
}
export interface DataSourceService<T = string, TSearch = T> {
    /** Initializes the service (loads cache, creates directory). */
    initialize(): Promise<void>;
    /** Fetches fresh data, updates cache, and persists to disk. */
    update(): Promise<number>;
    /** Returns a read‑only snapshot of the current state. */
    getState(): Readonly<DataSourceServiceState<T>>;
    /** Checks if an item exists in the cache (uses normalized form or custom hook). */
    has(item: TSearch): boolean;
    /** Returns the number of cached items. */
    readonly size: number;
}

// ============================================================================
// Service Implementation (Internal Class)
// ============================================================================
class DataSourceServiceImpl<T, TRaw, TSearch = T> implements DataSourceService<T, TSearch> {

    private readonly config: Required<DataSourceServiceConfig<T, TRaw, TSearch>>;
    private readonly filePath: string;
    private state: DataSourceServiceState<T>;

    constructor(config: DataSourceServiceConfig<T, TRaw, TSearch>) {
        this.config = {
            dataDir: config.dataDir,
            filename: config.filename,
            sourceUrl: config.sourceUrl,
            parser: config.parser,
            requestConfig: {
                timeout: 30_000,
                responseType: 'text',
                validateStatus: (status) => status === 200,
                ...config.requestConfig,
            },
            normalize: config.normalize ?? ((item: T) => item),
            normalizeSearch: config.normalizeSearch ?? ((item: TSearch) => item),
            has: config.has ?? ((cache, searchItem) => cache.has(searchItem as unknown as T)),
            deserialize: config.deserialize ?? ((parsedJson) => {
                if (Array.isArray(parsedJson)) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    return parsedJson.filter((_item: T): _item is T => true);
                }
                return [];
            })
        };
        this.filePath = `${this.config.dataDir}/${this.config.filename}`;
        this.state = {
            cache: new Set(),
            lastUpdated: null,
            initialized: false,
        };
    }

    async initialize(): Promise<void> {
        if (this.state.initialized) return;

        await mkdir(this.config.dataDir, { recursive: true });
        await this.loadFromDisk();

        if (this.state.cache.size === 0) {
            await this.update();
        }

        this.state.initialized = true;
    }

    async update(): Promise<number> {
        try {
            const response = await axios.get<TRaw>(
                this.config.sourceUrl,
                this.config.requestConfig
            );

            const rawContent = response.data;
            const parsedItems = this.config.parser(rawContent);
            if (parsedItems.length === 0) {
                throw new Error('Parser returned empty array');
            }

            const normalizedItems = parsedItems.map((item) => this.config.normalize(item));
            const newCache = new Set(normalizedItems);

            this.state.cache = newCache;
            this.state.lastUpdated = Date.now();

            await this.persistToDisk(Array.from(newCache));

            console.info(`[DataSource] Updated: ${newCache.size} items loaded from ${this.config.sourceUrl}`);
            return newCache.size;
        } catch (error) {
            const message = this.formatError(error);
            console.error(`[DataSource] Update failed: ${message}`);
            throw new Error(`Data source update failed: ${message}`, { cause: error });
        }
    }

    getState(): Readonly<DataSourceServiceState<T>> {
        return {
            cache: new Set(this.state.cache),
            lastUpdated: this.state.lastUpdated,
            initialized: this.state.initialized,
        };
    }

    has(item: TSearch): boolean {
        const normalized = this.config.normalizeSearch(item);
        return this.config.has(this.state.cache, normalized);
    }

    get size(): number {
        return this.state.cache.size;
    }

    // --------------------------------------------------------------------------
    // Private Helpers
    // --------------------------------------------------------------------------
    private async loadFromDisk(): Promise<void> {
        try {
            if (!existsSync(this.filePath)) return;

            const data = await readFile(this.filePath, 'utf-8');
            const parsed: unknown = JSON.parse(data);

            const items = this.config.deserialize(parsed);
            if (items.length > 0) {
                const normalized = items.map((item) => this.config.normalize(item));
                this.state.cache = new Set(normalized);
                this.state.lastUpdated = Date.now();
                console.info(`[DataSource] Loaded ${this.state.cache.size} items from local cache.`);
            } else {
                console.warn('[DataSource] Local cache file is malformed; will fetch fresh.');
            }
        } catch (error) {
            console.warn(
                `[DataSource] Could not load local cache: ${error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }
    private async persistToDisk(items: T[]): Promise<void> {
        try {
            const json = JSON.stringify(items, null, 2);
            await writeFile(this.filePath, json, 'utf-8');
        } catch (error) {
            console.error(
                `[DataSource] Failed to persist cache: ${error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }
    private formatError(error: unknown): string {
        if (error instanceof AxiosError) {
            return `HTTP ${error.response?.status ?? '??'}: ${error.message}`;
        }
        return error instanceof Error ? error.message : String(error);
    }
}

// ============================================================================
// Builder API
// ============================================================================
export default class DataSourceServiceBuilder<T = string, TRaw = string, TSearch = T> {

    private config: Partial<DataSourceServiceConfig<T, TRaw, TSearch>> = {};

    withDataDir(dir: string): this {
        this.config.dataDir = dir;
        return this;
    }
    withFilename(filename: string): this {
        this.config.filename = filename;
        return this;
    }
    withSourceUrl(url: string): this {
        this.config.sourceUrl = url;
        return this;
    }
    withParser(parser: (raw: TRaw) => T[]): this {
        this.config.parser = parser;
        return this;
    }
    withRequestConfig(config: AxiosRequestConfig): this {
        this.config.requestConfig = config;
        return this;
    }
    withNormalizer(normalize: (item: T) => T): this {
        this.config.normalize = normalize;
        return this;
    }
    withSearchNormalizer(normalizeSearch: (item: TSearch) => TSearch): this {
        this.config.normalizeSearch = normalizeSearch;
        return this;
    }
    withHas(hasFn: (cache: Set<T>, normalizedSearchItem: TSearch) => boolean): this {
        this.config.has = hasFn;
        return this;
    }
    withDeserializer(deserialize: (parsedJson: unknown) => T[]): this {
        this.config.deserialize = deserialize;
        return this;
    }

    /**
     * Builds and returns a configured DataSourceService instance.
     * @throws {Error} If required configuration is missing.
     */
    build(): DataSourceService<T, TSearch> {
        const { dataDir, filename, sourceUrl, parser } = this.config;
        if (!dataDir || !filename || !sourceUrl || !parser) {
            throw new Error(
                `${this.constructor.name}: missing required configuration (dataDir, filename, sourceUrl, parser)`
            );
        }
        return new DataSourceServiceImpl<T, TRaw, TSearch>({
            dataDir,
            filename,
            sourceUrl,
            parser,
            requestConfig: this.config.requestConfig,
            normalize: this.config.normalize,
            normalizeSearch: this.config.normalizeSearch,
            has: this.config.has,
            deserialize: this.config.deserialize,
        });
    }
}