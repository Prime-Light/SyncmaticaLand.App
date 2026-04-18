import { z } from "zod";

export const UploadResSchema = z.object({
    file_url: z.string().url().meta({
        description: "URL of the uploaded file",
        example: "https://example.com/uploads/schematics/castle.litematic",
    }),
    file_name: z.string().meta({
        description: "Original file name",
        example: "castle.litematic",
    }),
    file_size: z.number().int().meta({
        description: "File size in bytes",
        example: 102400,
    }),
});

export type UploadRes = z.infer<typeof UploadResSchema>;

export const MultiUploadResSchema = z.object({
    files: z.array(UploadResSchema).meta({
        description: "Array of uploaded file results",
    }),
    total_size: z.number().int().meta({
        description: "Total size of all uploaded files in bytes",
        example: 307200,
    }),
});

export type MultiUploadRes = z.infer<typeof MultiUploadResSchema>;
