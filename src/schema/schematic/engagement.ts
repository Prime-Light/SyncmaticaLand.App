import { z } from "zod";

export const EngagementReqSchema = z.object({
    schematic_id: z.string().uuid().meta({
        description: "Schematic unique identifier (UUID)",
        example: "550e8400-e29b-41d4-a716-446655440000",
    }),
});

export type EngagementReq = z.infer<typeof EngagementReqSchema>;

export const EngagementResSchema = z.object({
    success: z.boolean().meta({
        description: "Whether the engagement action was successful",
        example: true,
    }),
    new_count: z.number().int().meta({
        description: "The new count after the engagement action",
        example: 43,
    }),
});

export type EngagementRes = z.infer<typeof EngagementResSchema>;
