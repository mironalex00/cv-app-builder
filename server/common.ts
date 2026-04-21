import { join } from 'node:path';
import { cwd } from 'node:process';

import type { Request, Response } from 'express';

// ============================================================================
// Interfaces
// ============================================================================
export type EntityLookup<T> = (identifier: string, options?: SearchOptions) => T | undefined;

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
// Func
// ============================================================================
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
    const response: ApiResponse<T> = { success: true, data };
    res.status(statusCode).json(response);
}

export function sendBadRequest(res: Response, message: string): void {
    res.status(400).json({ success: false, error: message });
}

export function sendUnauthorized(res: Response, message: string): void {
    res.status(401).json({ success: false, error: message });
}

export function sendForbidden(res: Response, message: string): void {
    res.status(403).json({ success: false, error: message });
}

export function sendNotFound(res: Response, message: string): void {
    res.status(404).json({ success: false, error: message });
}

export function sendError(res: Response, message: string): void {
    res.status(500).json({ success: false, error: message });
}

export function getParam(req: Request, name: string): string | undefined {
    const value = req.params[name];
    if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
    }
    return undefined;
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