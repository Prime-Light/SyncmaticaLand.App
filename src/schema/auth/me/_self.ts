import { z } from "zod";

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
    user: UserSchema,
});

export type Res = z.infer<typeof ResSchema>;
