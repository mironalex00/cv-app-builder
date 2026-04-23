import type { Request, Response } from 'express';

import {
    getParamFirst,
    sendSuccess,
    sendBadRequest,
    sendNotFound,
    type EntityLookup,
    type ParamNameList,
} from '../../common.js';

// ============================================================================
// Types
// ============================================================================
export type EntityResponse<T, F extends keyof T> = { name: string } & Record<string, T[F]>;

// ============================================================================
// Handlers
// ============================================================================
export function createListHandler<T extends { name: string }, F extends keyof T>(getList: () => readonly T[], field: F): (req: Request, res: Response) => void {
    return function listHandler(_req: Request, res: Response): void {
        const items = getList();
        const len = items.length;
        const result = new Array<{ name: string } & Record<string, T[F]>>(len);
        for (let i = 0; i < len; i++) {
            const item = items[i];
            result[i] = {
                name: item.name,
                [field as string]: item[field],
            } as { name: string } & Record<string, T[F]>;
        }
        sendSuccess(res, result);
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
export function createSingleHandler<T extends { name: string }, F extends keyof T>(
    lookup: EntityLookup<T>,
    field: F,
    paramName: string
): (req: Request, res: Response) => void;
export function createSingleHandler<T extends { name: string }, F extends keyof T>(
    lookup: EntityLookup<T>,
    field: F,
    paramNames: ParamNameList
): (req: Request, res: Response) => void;
export function createSingleHandler<T extends { name: string }, F extends keyof T>(
    lookup: EntityLookup<T>,
    field: F,
    paramNameOrNames: string | ParamNameList
): (req: Request, res: Response) => void {
    const paramNames: ParamNameList =
        typeof paramNameOrNames === "string" ? [paramNameOrNames] : paramNameOrNames;

    return function singleHandler(req: Request, res: Response): void {
        const identifier = getParamFirst(req, paramNames);

        if (!identifier) {
            return sendBadRequest(
                res,
                `Invalid ${paramNames.length === 1 ? paramNames[0] : "identifier"}`
            );
        }

        const entity = lookup(identifier, { exact: true });
        if (!entity) {
            return sendNotFound(res, `${paramNames[0]} not found`);
        }

        sendSuccess(res, {
            name: entity.name,
            [field as string]: entity[field],
        } as EntityResponse<T, F>);
    };
}