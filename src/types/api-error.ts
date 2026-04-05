import { ApiErrorCode } from "@/lib/api-responses";

export interface IApiErrorResponse {
    error: {
        code: ApiErrorCode;
        message: string;
        details?: Record<string, unknown>;
    };
}
