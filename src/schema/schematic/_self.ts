import { z } from "zod";

export const ProjectStatusSchema = z
    .enum(["draft", "published", "under_review", "rejected"])
    .meta({
        description: "Project status enum",
        example: "draft",
    });

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectFormatSchema = z.enum(["litematic", "schem", "nbt", "bp"]).meta({
    description: "Project format enum",
    example: "litematic",
});

export type ProjectFormat = z.infer<typeof ProjectFormatSchema>;

export const SchematicSchema = z.object({
    id: z.string().uuid().meta({
        description: "Schematic unique identifier (UUID)",
        example: "550e8400-e29b-41d4-a716-446655440000",
    }),
    author_id: z.string().uuid().meta({
        description: "Author's user ID (UUID)",
        example: "550e8400-e29b-41d4-a716-446655440001",
    }),
    author_name: z.string().nullable().optional().meta({
        description: "Author display name",
        example: "创作者#1047",
    }),
    name: z.string().meta({
        description: "Schematic name",
        example: "Medieval Castle",
    }),
    description: z.string().nullable().meta({
        description: "Schematic description",
        example: "A beautiful medieval castle with towers and walls",
    }),
    status: ProjectStatusSchema.default("under_review"),
    format: ProjectFormatSchema,
    mc_version: z.string().meta({
        description: "Minecraft version",
        example: "1.20.4",
    }),
    tags: z
        .array(z.string())
        .default([])
        .meta({
            description: "Array of tags",
            example: ["medieval", "castle", "building"],
        }),
    file_url: z.string().meta({
        description: "URL to the schematic file",
        example: "https://example.com/schematics/castle.litematic",
    }),
    images: z
        .array(z.string())
        .default([])
        .meta({
            description: "Array of image URLs",
            example: [
                "https://example.com/images/castle1.png",
                "https://example.com/images/castle2.png",
            ],
        }),
    upvotes: z.number().int().default(0).meta({
        description: "Number of upvotes",
        example: 42,
    }),
    starred: z.number().int().default(0).meta({
        description: "Number of stars",
        example: 15,
    }),
    viewed: z.number().int().default(0).meta({
        description: "Number of views",
        example: 1000,
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

export type Schematic = z.infer<typeof SchematicSchema>;

export const CreateSchematicReqSchema = z.object({
    name: z.string().min(1, "Name is required").meta({
        description: "Schematic name",
        example: "Medieval Castle",
    }),
    description: z.string().nullable().optional().meta({
        description: "Schematic description",
        example: "A beautiful medieval castle with towers and walls",
    }),
    status: ProjectStatusSchema.optional().default("under_review"),
    format: ProjectFormatSchema,
    mc_version: z.string().min(1, "Minecraft version is required").meta({
        description: "Minecraft version",
        example: "1.20.4",
    }),
    tags: z
        .array(z.string())
        .optional()
        .default([])
        .meta({
            description: "Array of tags",
            example: ["medieval", "castle", "building"],
        }),
    file_url: z.string().url("Invalid file URL").meta({
        description: "URL to the schematic file",
        example: "https://example.com/schematics/castle.litematic",
    }),
    images: z
        .array(z.string().url("Invalid image URL"))
        .optional()
        .default([])
        .meta({
            description: "Array of image URLs",
            example: ["https://example.com/images/castle1.png"],
        }),
});

export type CreateSchematicReq = z.infer<typeof CreateSchematicReqSchema>;

export const UpdateSchematicReqSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional().meta({
        description: "Schematic name",
        example: "Medieval Castle Updated",
    }),
    description: z.string().nullable().optional().meta({
        description: "Schematic description",
        example: "Updated description",
    }),
    status: ProjectStatusSchema.optional(),
    format: ProjectFormatSchema.optional(),
    mc_version: z.string().min(1, "Minecraft version cannot be empty").optional().meta({
        description: "Minecraft version",
        example: "1.21.0",
    }),
    tags: z
        .array(z.string())
        .optional()
        .meta({
            description: "Array of tags",
            example: ["medieval", "castle", "updated"],
        }),
    file_url: z.string().url("Invalid file URL").optional().meta({
        description: "URL to the schematic file",
        example: "https://example.com/schematics/castle_v2.litematic",
    }),
    images: z
        .array(z.string().url("Invalid image URL"))
        .optional()
        .meta({
            description: "Array of image URLs",
            example: ["https://example.com/images/castle_new.png"],
        }),
});

export type UpdateSchematicReq = z.infer<typeof UpdateSchematicReqSchema>;

const CategoryBriefSchema = z.object({
    id: z.string().uuid().meta({
        description: "Category unique identifier",
        example: "550e8400-e29b-41d4-a716-446655440010",
    }),
    name: z.string().meta({
        description: "Category name",
        example: "Medieval",
    }),
    slug: z.string().meta({
        description: "Category slug for URL",
        example: "medieval",
    }),
});

export const SchematicResSchema = z.object({
    schematic: SchematicSchema,
    categories: z.array(CategoryBriefSchema).optional().meta({
        description: "Categories associated with this schematic",
    }),
});

export type SchematicRes = z.infer<typeof SchematicResSchema>;

export const SchematicListResSchema = z.object({
    schematics: z.array(SchematicSchema).meta({
        description: "Array of schematics",
    }),
    categories: z.array(CategoryBriefSchema).meta({
        description: "Available categories for filtering",
    }),
    total: z.number().int().meta({
        description: "Total number of schematics",
        example: 100,
    }),
    page: z.number().int().meta({
        description: "Current page number",
        example: 1,
    }),
    page_size: z.number().int().meta({
        description: "Number of items per page",
        example: 20,
    }),
    total_pages: z.number().int().meta({
        description: "Total number of pages",
        example: 5,
    }),
});

export type SchematicListRes = z.infer<typeof SchematicListResSchema>;
