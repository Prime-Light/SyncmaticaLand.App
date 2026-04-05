import { z } from "zod";

export * as Auth from "./auth";

export function WrappingSchema<T>(schema: z.ZodType<T>) {
    return z.object({
        data: schema,
    });
}

export type WrapSchema<T> = {
    data: T;
};
