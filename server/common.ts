import { join } from 'node:path';
import { cwd } from 'node:process';

// ============================================================================
// Types
// ============================================================================
declare type BasicData = string | number | boolean;
declare type ExtendedData<DataType = BasicData> = DataType | BasicData;
declare type NullableExtendedData<T = BasicData> = ExtendedData<T> | null;

export type EntityLookup<T> = (identifier: string, options?: SearchOptions) => T | undefined;
export type ParamNameList = readonly [string, ...string[]];

export type JsonPayload = JsonObject | JsonArray;
export type JsonValue = NullableExtendedData<BasicData | JsonPayload>;

export type JsonObject = {
    readonly [key: string]: JsonValue
};

export type JsonArray = {
    readonly [index: number]: JsonValue,
    readonly length: number
};

// ============================================================================
// Interfaces
// ============================================================================
export interface ApiResponse<T> {
    success: true;
    data: T;
}

export interface ClearableArray<T> extends Array<T> {
    clear(): void;
}

export interface ReplaceableArray<T> extends Array<T> {
    replace(items: T[]): void;
}

export interface SearchOptions {
    exact?: boolean;
}

export interface SearchableEntity {
    readonly searchTerms: readonly string[];
}

// ============================================================================
// Constants
// ============================================================================
export const DATA_DIR = join(cwd(), 'server', 'data');

// ============================================================================
// Classes 
// ============================================================================
export class ServiceArray<T> extends Array<T> implements ReplaceableArray<T>, ClearableArray<T> {
    replace(items: T[]): void {
        this.length = 0;
        this.push(...items);
    }
    clear(): void {
        this.length = 0;
    }
}