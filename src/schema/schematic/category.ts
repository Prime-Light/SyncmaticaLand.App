import { z } from "zod";

export const CategorySchema = z.object({
    id: z.string().uuid().meta({
        description: "Category unique identifier (UUID)",
        example: "550e8400-e29b-41d4-a716-446655440010",
    }),
    name: z.string().meta({
        description: "Category name",
        example: "Medieval",
    }),
    slug: z.string().meta({
        description: "Category slug for URL routing",
        example: "medieval",
    }),
    description: z.string().nullable().meta({
        description: "Category description",
        example: "Medieval style builds including castles, villages, and fortresses",
    }),
    icon_url: z.string().url().nullable().meta({
        description: "Category icon URL",
        example: "https://example.com/icons/medieval.png",
    }),
    created_at: z.string().datetime().meta({
        description: "Creation timestamp (ISO 8601)",
        example: "2024-01-15T10:30:00Z",
    }),
    updated_at: z.string().datetime().meta({
        description: "Last update timestamp (ISO 8601)",
        example: "2024-01-20T14:45:00Z",
    }),
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoryListResSchema = z.object({
    categories: z.array(CategorySchema).meta({
        description: "Array of categories",
    }),
    total: z.number().int().meta({
        description: "Total number of categories",
        example: 15,
    }),
});

export type CategoryListRes = z.infer<typeof CategoryListResSchema>;
