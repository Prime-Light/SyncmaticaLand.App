import { createDocument } from "zod-openapi";
import { safelyGetEnv } from "./utils";
import * as Schemas from "@/schema";
import { z } from "zod";

const ErrorSchema = z.object({
    error: z.object({
        code: z.string().meta({ description: "错误代码" }),
        message: z.string().meta({ description: "错误信息" }),
        details: z.record(z.string(), z.unknown()).optional(),
    }),
});

export const openApiDocument = createDocument({
    openapi: "3.1.0",
    info: {
        title: "投影共和国 OpenAPI",
        version: "v1.0.0",
    },
    servers: [{ url: safelyGetEnv("NEXT_PUBLIC_HOST_URL") }],
    tags: [
        { name: "🔒 用户认证", description: "认证相关接口" },
        { name: "📝 蓝图管理", description: "蓝图相关接口" },
    ],
    paths: {
        "/api/v1/auth/login": {
            post: {
                summary: "用户登录",
                description: "使用邮箱和密码登录",
                tags: ["🔒 用户认证"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: Schemas.Auth.Login.Login.ReqSchema,
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "登录成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Auth.Login.Login.ResSchema,
                            },
                        },
                    },
                    "401": {
                        description: "登录失败",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/auth/register": {
            post: {
                summary: "用户注册",
                description: "注册新用户账号",
                tags: ["🔒 用户认证"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: Schemas.Auth.Register.Register.ReqSchema,
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "注册成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Auth.Register.Register.ResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "注册失败",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/auth/logout": {
            post: {
                summary: "用户登出",
                description: "退出当前登录状态",
                tags: ["🔒 用户认证"],
                responses: {
                    "200": {
                        description: "登出成功",
                        content: {
                            "application/json": {
                                schema: z.object({
                                    success: z.boolean(),
                                }),
                            },
                        },
                    },
                    "500": {
                        description: "登出失败",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/auth/me": {
            get: {
                summary: "获取当前用户信息",
                description: "获取当前登录用户的详细信息",
                tags: ["🔒 用户认证"],
                responses: {
                    "200": {
                        description: "获取成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Auth.Me.Me.ResSchema,
                            },
                        },
                    },
                    "401": {
                        description: "未授权",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/auth/login/otp/verify": {
            post: {
                summary: "验证登录 OTP",
                description: "验证邮箱登录验证码",
                tags: ["🔒 用户认证"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: Schemas.Auth.Login.Verify.ReqSchema,
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "验证成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Auth.Login.Verify.ResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "验证失败",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/auth/login/otp/resend": {
            post: {
                summary: "重发登录 OTP",
                description: "重新发送登录验证码到邮箱",
                tags: ["🔒 用户认证"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: Schemas.Auth.Login.Resend.ReqSchema,
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "发送成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Auth.Login.Resend.ResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "发送失败",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/auth/register/otp/verify": {
            post: {
                summary: "验证注册 OTP",
                description: "验证邮箱注册验证码",
                tags: ["🔒 用户认证"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: Schemas.Auth.Register.Verify.ReqSchema,
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "验证成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Auth.Register.Verify.ResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "验证失败",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/auth/register/otp/resend": {
            post: {
                summary: "重发注册 OTP",
                description: "重新发送注册验证邮件",
                tags: ["🔒 用户认证"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: Schemas.Auth.Register.Resend.ReqSchema,
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "发送成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Auth.Register.Resend.ResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "发送失败",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
    },
});
