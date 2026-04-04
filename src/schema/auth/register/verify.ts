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

export const ResSchema = z.object({
    data: z.object({
        user_id: z.string().meta({
            description: "用户的唯一标识符",
            example: "1234567890",
        }),
        email: z.string().meta({
            description: "用户的邮箱地址",
            example: "user@example.com",
        }),
        message: z.string().meta({
            description: "验证成功后的提示信息",
            example: "邮箱验证成功",
        }),
    }),
});

export type Res = z.infer<typeof ResSchema>;
