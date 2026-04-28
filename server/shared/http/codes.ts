// ============================================================================
// Status Map
// ============================================================================
const INFORMATIONAL_STATUS = {
    100: 'continue',
    101: 'switching_protocols',
    102: 'processing',
    103: 'early_hints',
} as const;

const SUCCESS_STATUS = {
    200: 'ok',
    201: 'created',
    202: 'accepted',
    203: 'non_authoritative_information',
    204: 'no_content',
    205: 'reset_content',
    206: 'partial_content',
    207: 'multi_status',
    208: 'already_reported',
    226: 'im_used',
} as const;

const REDIRECTION_STATUS = {
    300: 'multiple_choices',
    301: 'moved_permanently',
    302: 'found',
    303: 'see_other',
    304: 'not_modified',
    305: 'use_proxy',
    306: 'unused',
    307: 'temporary_redirect',
    308: 'permanent_redirect',
} as const;

const CLIENT_ERROR_STATUS = {
    400: 'bad_request',
    401: 'unauthorized',
    402: 'payment_required',
    403: 'forbidden',
    404: 'not_found',
    405: 'method_not_allowed',
    406: 'not_acceptable',
    407: 'proxy_auth_required',
    408: 'request_timeout',
    409: 'conflict',
    410: 'gone',
    411: 'length_required',
    412: 'precondition_failed',
    413: 'payload_too_large',
    414: 'uri_too_long',
    415: 'unsupported_media_type',
    416: 'range_not_satisfiable',
    417: 'expectation_failed',
    418: 'im_a_teapot',
    421: 'misdirected_request',
    422: 'unprocessable_entity',
    423: 'locked',
    424: 'failed_dependency',
    425: 'too_early',
    426: 'upgrade_required',
    428: 'precondition_required',
    429: 'too_many_requests',
    431: 'request_header_fields_too_large',
    451: 'unavailable_for_legal_reason',
} as const;

const SERVER_ERROR_STATUS = {
    500: 'internal_error',
    501: 'not_implemented',
    502: 'bad_gateway',
    503: 'service_unavailable',
    504: 'gateway_timeout',
    505: 'http_version_not_supported',
    506: 'variant_also_negotiates',
    507: 'insufficient_storage',
    508: 'loop_detected',
    510: 'not_extended',
    511: 'network_authentication_required',
} as const;

const CUSTOM_SERVER_ERROR_STATUS = { 509: 'system_under_maintenance' } as const;

// ============================================================================
// Unified Status Map
// ============================================================================
const STATUS_MAP = Object.freeze({
    ...INFORMATIONAL_STATUS,
    ...SUCCESS_STATUS,
    ...REDIRECTION_STATUS,
    ...CLIENT_ERROR_STATUS,
    ...SERVER_ERROR_STATUS,
    ...CUSTOM_SERVER_ERROR_STATUS,
} as const);


// ============================================================================
// Types
// ============================================================================
export type StatusCode = keyof typeof STATUS_MAP;
export type StatusMessage<Code extends StatusCode> = typeof STATUS_MAP[Code];

export type InfoStatusCode = keyof typeof INFORMATIONAL_STATUS;
export type SuccessStatusCode = keyof typeof SUCCESS_STATUS;
export type RedirectStatusCode = keyof typeof REDIRECTION_STATUS;
export type ClientErrStatusCode = keyof typeof CLIENT_ERROR_STATUS;
export type ServerErrStatusCode = keyof typeof SERVER_ERROR_STATUS;
export type CustomErrStatusCode = keyof typeof CUSTOM_SERVER_ERROR_STATUS;

declare interface BaseHttpResponse<T, Code extends StatusCode> {
    statusCode: Code;
    message: StatusMessage<Code>;
    data: T;
}

declare type HttpResponse<T> =
    | BaseHttpResponse<T, InfoStatusCode>
    | BaseHttpResponse<T, SuccessStatusCode>
    | BaseHttpResponse<T, RedirectStatusCode>
    | BaseHttpResponse<T, ClientErrStatusCode>
    | BaseHttpResponse<T, ServerErrStatusCode>
    | BaseHttpResponse<T, CustomErrStatusCode>;

// ============================================================================
// Safe Factory (Prevents Invalid Combinations)
// ============================================================================
export default function createHttpResponse<T, Code extends StatusCode>(
    statusCode: Code,
    data: T,
): HttpResponse<T> {
    return {
        statusCode,
        message: STATUS_MAP[statusCode],
        data,
    } as HttpResponse<T>;
}