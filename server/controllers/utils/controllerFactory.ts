import type { Request, Response } from 'express';

import { getParamFirst } from './searchHelpers.js';

import { sendBadRequest, sendNotFound, sendSuccess, type Serializable } from '../../shared/http/response.js';

import type { EntityLookup, ParamNameList } from '../../common.js';

// ============================================================================
// Types
// ============================================================================
declare type FieldProjection = Record<string, Serializable>;

// ============================================================================
// Handlers
// ============================================================================
export function createListHandler<T, F extends keyof T>(
    getList: () => readonly T[],
    field: F,
): (req: Request, res: Response) => void;
export function createListHandler<T, D>(
    getList: () => readonly T[],
    mapper: (items: readonly T[]) => readonly D[],
): (req: Request, res: Response) => void;

export function createListHandler<T extends { name?: string }, F extends keyof T, D>(
    getList: () => readonly T[],
    fieldOrMapper: F | ((items: readonly T[]) => readonly D[]),
): (req: Request, res: Response) => void {
    return function listHandler(_req: Request, res: Response): void {
        const items = getList();
        if (typeof fieldOrMapper === 'function') {
            sendSuccess(res, fieldOrMapper(items));
        } else {
            const result: FieldProjection[] = items.map((item) => ({
                name: item.name as string,
                [fieldOrMapper as string]: item[fieldOrMapper] as Serializable,
            }));
            sendSuccess(res, result);
        }
    };
}

/**
 * Creates a request handler that resolves an entity from one or more possible route/query/body parameters.
 *
 * @template T Entity type with at least a `name` field.
 * @template F Entity field to project into the success payload.
 *
 * @param lookup - Entity lookup function.
 * @param field - Entity field to include in the success response.
 * @param paramNames - One or more parameter names, checked left-to-right.
 */
export function createSingleHandler<T, F extends keyof T>(
    lookup: EntityLookup<T>,
    field: F,
    paramName: string,
): (req: Request, res: Response) => void;
export function createSingleHandler<T, F extends keyof T>(
    lookup: EntityLookup<T>,
    field: F,
    paramNames: ParamNameList,
): (req: Request, res: Response) => void;
export function createSingleHandler<T, D>(
    lookup: EntityLookup<T>,
    mapper: (entity: T) => D,
    paramName: string,
): (req: Request, res: Response) => void;
export function createSingleHandler<T, D>(
    lookup: EntityLookup<T>,
    mapper: (entity: T) => D,
    paramNames: ParamNameList,
): (req: Request, res: Response) => void;

export function createSingleHandler<T extends { name?: string }, F extends keyof T, D>(
    lookup: EntityLookup<T>,
    fieldOrMapper: F | ((entity: T) => D),
    paramNameOrNames: string | ParamNameList,
): (req: Request, res: Response) => void {
    const paramNames: ParamNameList = typeof paramNameOrNames === "string" ? [paramNameOrNames] : paramNameOrNames;
    return function singleHandler(req: Request, res: Response): void {
        const identifier = getParamFirst(req, paramNames);

        if (!identifier) {
            const label = paramNames.length === 1 ? paramNames[0] : 'identifier';
            return sendBadRequest(res, { error: `Invalid ${label}` });
        }

        const entity = lookup(identifier, { exact: true });
        if (!entity) {
            return sendNotFound(res, { error: `${paramNames[0]} not found` });
        }

        if (typeof fieldOrMapper === 'function') {
            sendSuccess(res, fieldOrMapper(entity));
        } else {
            const payload: FieldProjection = {
                name: entity.name as string,
                [fieldOrMapper as string]: entity[fieldOrMapper] as Serializable,
            };
            sendSuccess(res, payload);
        }
    };
}