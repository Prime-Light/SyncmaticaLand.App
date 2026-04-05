import z from "zod";

export * as Auth from "./auth";

export function WrapingSchema<T>(schema: z.ZodType<T>) {
    return z.object({
        data: schema,
    });
}

export type WrapSchema<T> = z.infer<typeof WrapingSchema<T>>;
