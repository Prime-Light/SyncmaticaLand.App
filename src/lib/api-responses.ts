import { IApiErrorResponse } from "@/types/api-error";
import { NextResponse } from "next/server";

export enum ApiResponseCode {
    OK = 200,
    CREATED = 201,
    PARTIAL_CONTENT = 202,
    NO_CONTENT = 204,
}

export class ApiResponse<T> {
    private _code: ApiResponseCode = ApiResponseCode.OK;
    private _data!: T;

    code(code: ApiResponseCode) {
        this._code = code;
        return this;
    }

    data(data: T) {
        this._data = data;
        return this;
    }

    build(): NextResponse<{ data: T }> {
        return NextResponse.json(
            { data: this._data },
            {
                status: this._code,
            }
        );
    }
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

export class ApiError {
    private _code: ApiErrorCode = ApiErrorCode.SERVER_ERROR;
    private _message: string = "Internal Server Error";
    private _details: Record<string, unknown> = {};

    /**
     * 设置错误码
     * @param code 错误码
     * @returns this
     */
    code(code: ApiErrorCode) {
        this._code = code;
        return this;
    }

    /**
     * 设置错误信息
     * @param message 信息内容
     * @returns this
     */
    message(message: string) {
        this._message = message;
        return this;
    }

    /**
     * 添加错误详情
     * @param key 键名
     * @param value 键值
     * @returns this
     */
    detail(key: string, value: unknown) {
        this._details[key] = value;
        return this;
    }

    /**
     * 设置错误详情\
     * 请注意此方法会覆盖已存在的错误详情
     * @param details 错误详情
     * @returns this
     */
    details(details: Record<string, unknown>) {
        this._details = details;
        return this;
    }

    /**
     * 构建错误响应
     * @returns 可直接返回的 `NextReponse<IApiErrorResponse>`
     */
    build(): NextResponse<IApiErrorResponse> {
        return NextResponse.json(
            {
                error: {
                    code: this._code,
                    message: this._message,
                    details: this._details,
                },
            },
            {
                status: this._code,
            }
        );
    }
}
