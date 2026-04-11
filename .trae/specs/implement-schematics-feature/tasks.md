# Tasks

- [x] Task 1: Create Zod schemas for schematics API
  - [x] SubTask 1.1: Create `src/schema/schematic/index.ts` with schema exports
  - [x] SubTask 1.2: Create `src/schema/schematic/_self.ts` with schematic entity schemas (SchematicSchema, CreateSchematicReqSchema, UpdateSchematicReqSchema, SchematicResSchema, SchematicListResSchema)
  - [x] SubTask 1.3: Create `src/schema/schematic/category.ts` with category schemas (CategorySchema, CategoryListResSchema)
  - [x] SubTask 1.4: Create `src/schema/schematic/engagement.ts` with engagement schemas (EngagementReqSchema, EngagementResSchema)
  - [x] SubTask 1.5: Create `src/schema/schematic/upload.ts` with upload response schemas (UploadResSchema, MultiUploadResSchema)

- [x] Task 2: Create Supabase storage upload utilities
  - [x] SubTask 2.1: Create `src/lib/storage/index.ts` with storage client initialization
  - [x] SubTask 2.2: Create `src/lib/storage/upload.ts` with upload functions (uploadSchematicFile, uploadImageFile, deleteFile)
  - [x] SubTask 2.3: Add helper functions for generating storage paths

- [x] Task 3: Create API route for file uploads
  - [x] SubTask 3.1: Create `src/app/(backend)/api/v1/schematics/upload/route.ts` for schematic file upload
  - [x] SubTask 3.2: Create `src/app/(backend)/api/v1/schematics/upload/images/route.ts` for image upload
  - [x] SubTask 3.3: Add file validation and error handling

- [x] Task 4: Create API routes for schematics CRUD
  - [x] SubTask 4.1: Create `src/app/(backend)/api/v1/schematics/route.ts` with GET (list) and POST (create) handlers
  - [x] SubTask 4.2: Create `src/app/(backend)/api/v1/schematics/[id]/route.ts` with GET, PATCH, DELETE handlers
  - [x] SubTask 4.3: Implement RLS-aware queries using RPC functions from database

- [x] Task 5: Create API routes for categories
  - [x] SubTask 5.1: Create `src/app/(backend)/api/v1/categories/route.ts` with GET handler for listing categories
  - [x] SubTask 5.2: Create `src/app/(backend)/api/v1/categories/[id]/schematics/route.ts` for schematics by category

- [x] Task 6: Create API routes for engagement
  - [x] SubTask 6.1: Create `src/app/(backend)/api/v1/schematics/[id]/upvote/route.ts` with POST (increment) and DELETE (decrement) handlers
  - [x] SubTask 6.2: Create `src/app/(backend)/api/v1/schematics/[id]/star/route.ts` with POST (increment) and DELETE (decrement) handlers
  - [x] SubTask 6.3: Create `src/app/(backend)/api/v1/schematics/[id]/view/route.ts` with POST handler for view increment

- [x] Task 7: Update OpenAPI documentation
  - [x] SubTask 7.1: Add all schematic endpoints to `src/lib/openapi-meta.ts`
  - [x] SubTask 7.2: Add all category endpoints to OpenAPI documentation
  - [x] SubTask 7.3: Add all engagement endpoints to OpenAPI documentation

- [x] Task 8: Create React hooks for schematic data
  - [x] SubTask 8.1: Create `src/hooks/use-schematics.ts` with useSchematics hook for listing
  - [x] SubTask 8.2: Create `src/hooks/use-schematic.ts` with useSchematic hook for single item
  - [x] SubTask 8.3: Create `src/hooks/use-categories.ts` with useCategories hook
  - [x] SubTask 8.4: Create `src/hooks/use-schematic-mutations.ts` with create, update, delete mutation hooks

- [x] Task 9: Update frontend components
  - [x] SubTask 9.1: Update `src/components/@prime-light/schematics/card.tsx` to match API response schema
  - [x] SubTask 9.2: Update `src/app/(frontend)/(primary)/schematics/page.tsx` to use real API data
  - [x] SubTask 9.3: Update `src/components/@prime-light/dashboard/upload-schematic-form.tsx` to integrate with upload API
  - [x] SubTask 9.4: Update `src/components/@prime-light/schematics/feed.tsx` to use real API data

# Task Dependencies
- [Task 2] depends on [Task 1] (schemas needed for upload response)
- [Task 3] depends on [Task 2] (storage utilities needed)
- [Task 4] depends on [Task 1] (schemas needed) and [Task 3] (upload API for file URLs)
- [Task 5] depends on [Task 1] (schemas needed)
- [Task 6] depends on [Task 1] (schemas needed)
- [Task 7] depends on [Task 1, Task 4, Task 5, Task 6] (all APIs must exist)
- [Task 8] depends on [Task 1] (schemas needed for type inference)
- [Task 9] depends on [Task 8] (hooks needed for data fetching)
