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
        { name: "📁 分类管理", description: "分类相关接口（管理员可写）" },
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
        "/api/v1/schematics": {
            get: {
                summary: "获取蓝图列表",
                description: "获取蓝图列表，支持按状态、分类、作者筛选和分页",
                tags: ["📝 蓝图管理"],
                parameters: [
                    {
                        name: "status",
                        in: "query",
                        required: false,
                        description: "按状态筛选",
                        schema: { 
                            type: "string", 
                            enum: ["draft", "published", "under_review", "rejected"],
                            description: "原理图状态"
                        },
                    },
                    {
                        name: "category_id",
                        in: "query",
                        required: false,
                        description: "按分类ID筛选",
                        schema: { type: "string", format: "uuid" },
                    },
                    {
                        name: "author_id",
                        in: "query",
                        required: false,
                        description: "按作者ID筛选",
                        schema: { type: "string", format: "uuid" },
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        description: "每页数量",
                        schema: { type: "integer", default: 20 },
                    },
                    {
                        name: "offset",
                        in: "query",
                        required: false,
                        description: "偏移量",
                        schema: { type: "integer", default: 0 },
                    },
                ],
                responses: {
                    "200": {
                        description: "获取成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.SchematicListResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "请求参数错误",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
            post: {
                summary: "创建蓝图",
                description: "创建新的蓝图项目",
                tags: ["📝 蓝图管理"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: Schemas.Schematic.CreateSchematicReqSchema,
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "创建成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.SchematicResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "创建失败",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
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
        "/api/v1/schematics/{id}": {
            get: {
                summary: "获取蓝图详情",
                description: "根据ID获取蓝图详细信息",
                tags: ["📝 蓝图管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "蓝图ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    "200": {
                        description: "获取成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.SchematicResSchema,
                            },
                        },
                    },
                    "404": {
                        description: "蓝图不存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
            patch: {
                summary: "更新蓝图",
                description: "更新蓝图信息",
                tags: ["📝 蓝图管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "蓝图ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: Schemas.Schematic.UpdateSchematicReqSchema,
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "更新成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.SchematicResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "更新失败",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
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
                    "404": {
                        description: "蓝图不存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
            delete: {
                summary: "删除蓝图",
                description: "删除指定的蓝图项目",
                tags: ["📝 蓝图管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "蓝图ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    "200": {
                        description: "删除成功",
                        content: {
                            "application/json": {
                                schema: z.object({
                                    success: z.boolean(),
                                }),
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
                    "404": {
                        description: "蓝图不存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/schematics/upload": {
            post: {
                summary: "上传蓝图文件",
                description: "上传蓝图文件（litematic, schem, nbt, bp格式）",
                tags: ["📝 蓝图管理"],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: z.object({
                                file: z.object({}).meta({
                                    description: "蓝图文件",
                                }),
                            }),
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "上传成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.Upload.UploadResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "上传失败",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
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
        "/api/v1/schematics/upload/images": {
            post: {
                summary: "上传预览图片",
                description: "上传蓝图预览图片（支持多图上传）",
                tags: ["📝 蓝图管理"],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: z.object({
                                files: z.array(z.object({})).meta({
                                    description: "预览图片文件数组",
                                }),
                                schematic_id: z.string().optional().meta({
                                    description: "蓝图ID（可选，用于关联图片）",
                                }),
                            }),
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "上传成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.Upload.MultiUploadResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "上传失败",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
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
        "/api/v1/categories": {
            get: {
                summary: "获取分类列表",
                description: "获取所有蓝图分类",
                tags: ["📁 分类管理"],
                responses: {
                    "200": {
                        description: "获取成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.Category.CategoryListResSchema,
                            },
                        },
                    },
                },
            },
            post: {
                summary: "创建分类",
                description: "创建新的蓝图分类（需要管理员权限）",
                tags: ["📁 分类管理"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: Schemas.Schematic.Category.CreateCategoryReqSchema,
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "创建成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.Category.CategoryResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "请求参数错误",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
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
                    "403": {
                        description: "权限不足",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                    "409": {
                        description: "分类名称或 slug 已存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/categories/{id}": {
            get: {
                summary: "获取分类详情",
                description: "根据ID获取分类详细信息",
                tags: ["📁 分类管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "分类ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    "200": {
                        description: "获取成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.Category.CategoryResSchema,
                            },
                        },
                    },
                    "404": {
                        description: "分类不存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
            patch: {
                summary: "更新分类",
                description: "更新分类信息（需要管理员权限）",
                tags: ["📁 分类管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "分类ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: Schemas.Schematic.Category.UpdateCategoryReqSchema,
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "更新成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.Category.CategoryResSchema,
                            },
                        },
                    },
                    "400": {
                        description: "请求参数错误",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
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
                    "403": {
                        description: "权限不足",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                    "404": {
                        description: "分类不存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                    "409": {
                        description: "分类名称或 slug 已存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
            delete: {
                summary: "删除分类",
                description: "删除指定的分类（需要管理员权限）",
                tags: ["📁 分类管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "分类ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    "200": {
                        description: "删除成功",
                        content: {
                            "application/json": {
                                schema: z.object({
                                    success: z.boolean(),
                                }),
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
                    "403": {
                        description: "权限不足",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                    "404": {
                        description: "分类不存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/categories/{id}/schematics": {
            get: {
                summary: "获取分类下的蓝图",
                description: "根据分类ID获取该分类下的所有蓝图",
                tags: ["📁 分类管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "分类ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        description: "每页数量",
                        schema: { type: "integer", default: 20 },
                    },
                    {
                        name: "offset",
                        in: "query",
                        required: false,
                        description: "偏移量",
                        schema: { type: "integer", default: 0 },
                    },
                ],
                responses: {
                    "200": {
                        description: "获取成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.SchematicListResSchema,
                            },
                        },
                    },
                    "404": {
                        description: "分类不存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/schematics/{id}/upvote": {
            post: {
                summary: "点赞蓝图",
                description: "为蓝图增加一个点赞",
                tags: ["📝 蓝图管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "蓝图ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    "200": {
                        description: "操作成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.Engagement.EngagementResSchema,
                            },
                        },
                    },
                    "404": {
                        description: "蓝图不存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
            delete: {
                summary: "取消点赞",
                description: "取消蓝图的点赞",
                tags: ["📝 蓝图管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "蓝图ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    "200": {
                        description: "操作成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.Engagement.EngagementResSchema,
                            },
                        },
                    },
                    "404": {
                        description: "蓝图不存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/schematics/{id}/star": {
            post: {
                summary: "收藏蓝图",
                description: "收藏蓝图",
                tags: ["📝 蓝图管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "蓝图ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    "200": {
                        description: "操作成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.Engagement.EngagementResSchema,
                            },
                        },
                    },
                    "404": {
                        description: "蓝图不存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
            delete: {
                summary: "取消收藏",
                description: "取消收藏蓝图",
                tags: ["📝 蓝图管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "蓝图ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    "200": {
                        description: "操作成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.Engagement.EngagementResSchema,
                            },
                        },
                    },
                    "404": {
                        description: "蓝图不存在",
                        content: {
                            "application/json": {
                                schema: ErrorSchema,
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/schematics/{id}/view": {
            post: {
                summary: "记录浏览",
                description: "增加蓝图浏览次数",
                tags: ["📝 蓝图管理"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "蓝图ID (UUID)",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    "200": {
                        description: "操作成功",
                        content: {
                            "application/json": {
                                schema: Schemas.Schematic.Engagement.EngagementResSchema,
                            },
                        },
                    },
                    "404": {
                        description: "蓝图不存在",
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
