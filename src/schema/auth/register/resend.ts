import { z } from "zod";

export const ReqSchema = z.object({
    email: z.email("请输入有效的邮箱地址").meta({
        description: "用户的邮箱地址",
        example: "user@example.com",
    }),
    redirect_url: z.url("回调 URL 无效").optional().meta({
        description: "验证成功后跳转的回调 URL",
        example: "https://example.com/callback",
    }),
});

export type Req = z.infer<typeof ReqSchema>;

export const ResSchema = z.object({
    email: z.string().meta({
        description: "用户的邮箱地址",
        example: "user@example.com",
    }),
    message: z.string().meta({
        description: "重发验证邮件后的提示信息",
        example: "验证邮件已发送",
    }),
});

export type Res = z.infer<typeof ResSchema>;
