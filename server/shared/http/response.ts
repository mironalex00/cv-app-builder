import type { Response, CookieOptions } from 'express';

import createHttpResponse, {
    type StatusCode,
    type SuccessStatusCode,
    type ClientErrStatusCode,
    type CustomErrStatusCode,
    type InfoStatusCode,
    type RedirectStatusCode,
    type ServerErrStatusCode,
} from './codes.js';

import type {
    JsonPayload,
    JsonObject
} from '../../common.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const Method = {
    JSON: 'json',
    SEND: 'send',
    DATA: 'data',
    REDIRECT: 'redirect',
    RENDER: 'render',
    STATUS: 'status',
} as const;

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------
declare type Method = (typeof Method)[keyof typeof Method];

declare type EnvelopeOptions = ResponseMeta & {
    envelope?: true;
    method?: never;
};

declare type RawOptions<M extends Method> = ResponseOptions<M> & {
    envelope: false;
};

declare type SendPayload = string | number | boolean | Date;
declare type DataPayload = string | Buffer;
declare type RedirectPayload = string;
declare type StatusPayload = undefined;

declare type RenderPayload = {
    view: string;
    locals?: JsonObject
};

declare type ResponseOptions<M extends Method = typeof Method.SEND> = ResponseMeta & {
    method?: M
};

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

declare interface Payloads {
    [Method.JSON]: JsonPayload;
    [Method.SEND]: SendPayload;
    [Method.DATA]: DataPayload;
    [Method.REDIRECT]: RedirectPayload;
    [Method.RENDER]: RenderPayload;
    [Method.STATUS]: StatusPayload;
}

declare interface CookieDef {
    name: string;
    value: string;
    options?: CookieOptions;
}

declare interface ResponseMeta {
    headers?: Record<string, string>;
    cookies?: CookieDef[];
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------
function applyMeta(res: Response, { headers, cookies }: ResponseMeta): void {
    if (headers) {
        for (const [key, val] of Object.entries(headers)) {
            res.setHeader(key, val);
        }
    }
    if (cookies) {
        for (const { name, value, options } of cookies) {
            if (options !== undefined) {
                res.cookie(name, value, options as CookieOptions);
            } else {
                res.cookie(name, value);
            }
        }
    }
}

function dispatch<M extends Method>(
    res: Response,
    method: M,
    payload: Payloads[M],
): void {
    switch (method as Method) {
        case Method.JSON:
            res.json(payload as JsonPayload);
            break;

        case Method.SEND: {
            const p = payload as SendPayload;
            res.send(typeof p === 'string' ? p : String(p));
            break;
        }

        case Method.DATA: {
            const p = payload as DataPayload;
            if (Buffer.isBuffer(p)) res.type('application/octet-stream');
            res.send(p);
            break;
        }

        case Method.REDIRECT: {
            const url = payload as RedirectPayload;
            if (typeof url !== 'string') throw new TypeError('redirect: payload must be a string URL');
            res.redirect(res.statusCode, url);
            break;
        }

        case Method.RENDER: {
            const { view, locals } = payload as RenderPayload;
            if (typeof view !== 'string') throw new TypeError('render: payload.view must be a string');
            res.render(view, locals ?? {});
            break;
        }

        case Method.STATUS:
            res.end();
            break;

        default: {
            throw new TypeError(`Unhandled response method: ${String(method as never)}`);
        }
    }
}

function response<T, Code extends StatusCode>(
    res: Response,
    statusCode: Code,
    data: T,
    options?: EnvelopeOptions,
): void;
function response<M extends Method>(
    res: Response,
    statusCode: number,
    payload: Payloads[M],
    options: RawOptions<M>,
): void;

function response<T, M extends Method, Code extends StatusCode>(
    res: Response,
    statusCode: Code | number,
    dataOrPayload: T | Payloads[M],
    options: EnvelopeOptions | RawOptions<M> = {},
): void {
    applyMeta(res, options);
    if ((options as RawOptions<M>).envelope === false) {
        const method = (options as RawOptions<M>).method ?? Method.SEND as M;
        res.status(statusCode);
        dispatch(res, method, dataOrPayload as Payloads[M]);
    } else {
        res.status(statusCode).json(
            createHttpResponse(statusCode as Code, dataOrPayload as T),
        );
    }
}

function sendEnvelope<T, Code extends StatusCode>(
    res: Response, statusCode: Code, data: T, meta?: ResponseMeta,
): void {
    response(res, statusCode, data, meta);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function sendSuccess<T, Code extends SuccessStatusCode>(
    res: Response,
    data: T,
    statusCode: Code = 200 as Code,
    options?: ResponseMeta,
): void {
    sendEnvelope(res, statusCode, data, options);
}

export function sendBadRequest<T, Code extends ClientErrStatusCode>(
    res: Response,
    data: T,
    statusCode: Code = 400 as Code,
    options?: ResponseMeta
): void {
    sendEnvelope(res, statusCode, data, options);
}

export function sendUnauthorized<T>(res: Response, data: T, options?: ResponseMeta): void {
    sendEnvelope(res, 401, data, options);
}

export function sendForbidden<T>(res: Response, data: T, options?: ResponseMeta): void {
    sendEnvelope(res, 403, data, options);
}

export function sendNotFound<T>(res: Response, data: T, options?: ResponseMeta): void {
    sendEnvelope(res, 404, data, options);
}

export function sendError<T, Code extends ServerErrStatusCode | CustomErrStatusCode>(
    res: Response,
    data: T,
    statusCode: Code = 500 as Code,
    options?: ResponseMeta,
): void {
    sendEnvelope(res, statusCode, data, options);
}

export function sendInfo<T, Code extends InfoStatusCode>(
    res: Response,
    data: T,
    statusCode: Code = 100 as Code,
    options?: ResponseMeta,
): void {
    sendEnvelope(res, statusCode, data, options);
}

export function sendRedirect<T, Code extends RedirectStatusCode>(
    res: Response,
    data: T,
    statusCode: Code = 302 as Code,
    options?: ResponseMeta,
): void {
    sendEnvelope(res, statusCode, data, options);
}