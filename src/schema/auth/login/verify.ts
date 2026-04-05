import { z } from "zod";

export const ReqSchema = z.object({
    email: z.email("请输入有效的邮箱地址").meta({
        description: "用户的邮箱地址",
        example: "user@example.com",
    }),
    token: z.string().min(6, "验证码长度不能小于 6 位").max(6, "验证码长度不能大于 6 位").meta({
        description: "邮箱验证码 (OTP)",
        example: "123456",
    }),
    redirect_url: z.url("回调 URL 无效").optional().meta({
        description: "验证成功后跳转的回调 URL",
        example: "https://example.com/callback",
    }),
});

export type Req = z.infer<typeof ReqSchema>;

const UserSchema = z.object({
    user_id: z.string().meta({
        description: "用户的唯一标识符",
        example: "uuid-string",
    }),
    email: z.string().meta({
        description: "用户的邮箱地址",
        example: "user@example.com",
    }),
    display_name: z.string().meta({
        description: "用户展示昵称",
        example: "创作者#1047",
    }),
    avatar_url: z.string().meta({
        description: "用户头像 URL",
        example: "https://example.com/avatar.png",
    }),
    role: z.enum(["user", "creator", "admin"]).meta({
        description: "用户角色",
        example: "user",
    }),
});

export const ResSchema = z.object({
    access_token: z.string().meta({
        description: "访问令牌",
        example: "eyJhbGciOiJIUzI1NiIs...",
    }),
    refresh_token: z.string().meta({
        description: "刷新令牌",
        example: "v1.xxx...",
    }),
    expires_in: z.number().meta({
        description: "令牌有效期（秒）",
        example: 3600,
    }),
    token_type: z.string().meta({
        description: "令牌类型",
        example: "Bearer",
    }),
    user: UserSchema,
    message: z.string().meta({
        description: "验证成功后的提示信息",
        example: "登录成功",
    }),
});

export type Res = z.infer<typeof ResSchema>;
