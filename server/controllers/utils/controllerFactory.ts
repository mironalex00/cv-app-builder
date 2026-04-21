import type { Request, Response } from 'express';
import { getParam, sendSuccess, sendBadRequest, sendNotFound } from '../../common.js';

// ============================================================================
// Private types
// ============================================================================
type LookupFn<T> = (identifier: string, options?: { exact?: boolean }) => T | undefined;

// ============================================================================
// Helpers
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
export function createSingleHandler<T extends { name: string }, F extends keyof T>(
    lookup: LookupFn<T>,
    field: F,
    paramName: string = 'country'
): (req: Request, res: Response) => void {
    return function singleHandler(req: Request, res: Response): void {
        const identifier = getParam(req, paramName);
        if (!identifier) {
            return sendBadRequest(res, `Invalid ${paramName} identifier`);
        }

        const entity = lookup(identifier, { exact: true });
        if (!entity) {
            return sendNotFound(res, `${paramName} not found`);
        }

        sendSuccess(res, {
            name: entity.name,
            [field as string]: entity[field],
        } as { name: string } & Record<string, T[F]>);
    };
}