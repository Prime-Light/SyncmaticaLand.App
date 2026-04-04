import { z } from "zod";

export const ReqSchema = z.object({
    email: z.email("请输入有效的邮箱地址").meta({
        description: "用户的邮箱地址",
        example: "user@example.com",
    }),
    password: z
        .string()
        .min(8, "密码长度不能小于 8 位")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密码必须包含大小写字母和数字")
        .meta({
            description: "用户的密码",
            example: "Password123!",
        }),
    display_name: z.string().min(2, "显示名称长度不能小于 2 位").meta({
        description: "用户的显示名称",
        example: "User123",
    }),
    redirect_url: z.url("回调 URL 无效").optional().meta({
        description: "注册成功后跳转的回调 URL",
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
            description: "注册成功后的提示信息",
            example: "注册成功",
        }),
    }),
});

export type Res = z.infer<typeof ResSchema>;
