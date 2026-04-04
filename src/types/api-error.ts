export interface IApiErrorResponse {
    error: {
        code: ApiErrorCode;
        message: string;
        details?: Record<string, unknown>;
    };
}

export enum ApiErrorCode {
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    BAD_REQUEST = 400,
    CONFLICT = 409,
    RATE_LIMITED = 429,
    SERVER_ERROR = 500,
}
