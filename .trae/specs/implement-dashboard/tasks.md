# Tasks

- [x] Task 1: Add category mutation schemas
  - [x] SubTask 1.1: Add CreateCategoryReqSchema to `src/schema/schematic/category.ts`
  - [x] SubTask 1.2: Add UpdateCategoryReqSchema to `src/schema/schematic/category.ts`
  - [x] SubTask 1.3: Add CategoryResSchema for single category response
  - [x] SubTask 1.4: Export new schemas from `src/schema/index.ts`

- [x] Task 2: Create category management API routes
  - [x] SubTask 2.1: Create `src/app/(backend)/api/v1/categories/route.ts` POST handler for creating categories
  - [x] SubTask 2.2: Create `src/app/(backend)/api/v1/categories/[id]/route.ts` with GET, PATCH, DELETE handlers
  - [x] SubTask 2.3: Add admin-only authorization checks to all mutation endpoints
  - [x] SubTask 2.4: Update OpenAPI documentation with new category endpoints

- [x] Task 3: Create category mutation hooks
  - [x] SubTask 3.1: Create `src/hooks/use-category-mutations.ts` with useCreateCategory, useUpdateCategory, useDeleteCategory
  - [x] SubTask 3.2: Export new hooks from `src/hooks/index.ts`

- [x] Task 4: Implement creator dashboard page
  - [x] SubTask 4.1: Create dashboard statistics component showing total projects, views, upvotes, stars
  - [x] SubTask 4.2: Create recent projects list component
  - [x] SubTask 4.3: Implement `src/app/(frontend)/(dashboard)/dashboard/page.tsx` with statistics and recent projects

- [x] Task 5: Implement projects management page
  - [x] SubTask 5.1: Create projects data table component with columns for name, status, views, upvotes, stars, created_at
  - [x] SubTask 5.2: Add status badge component for project status display
  - [x] SubTask 5.3: Add row actions (edit, delete) with permission checks
  - [x] SubTask 5.4: Create edit project dialog/sheet component
  - [x] SubTask 5.5: Implement `src/app/(frontend)/(dashboard)/dashboard/projects/page.tsx` with data table

- [x] Task 6: Create admin dashboard layout
  - [x] SubTask 6.1: Create `src/app/(frontend)/(admin)/layout.tsx` with admin sidebar
  - [x] SubTask 6.2: Create admin sidebar component with navigation items
  - [x] SubTask 6.3: Add admin role check and redirect for non-admin users

- [x] Task 7: Implement admin dashboard overview page
  - [x] SubTask 7.1: Create admin statistics component showing total users, total schematics, pending reviews
  - [x] SubTask 7.2: Create recent activity component
  - [x] SubTask 7.3: Implement `src/app/(frontend)/(admin)/admin/page.tsx`

- [x] Task 8: Implement admin project audit page
  - [x] SubTask 8.1: Create audit data table with status filter
  - [x] SubTask 8.2: Add approve/reject action buttons
  - [x] SubTask 8.3: Create project detail view for audit
  - [x] SubTask 8.4: Implement `src/app/(frontend)/(admin)/admin/audit/page.tsx`

- [x] Task 9: Implement admin category management page
  - [x] SubTask 9.1: Create categories data table with inline editing
  - [x] SubTask 9.2: Add create category dialog/form
  - [x] SubTask 9.3: Add delete category confirmation dialog
  - [x] SubTask 9.4: Implement `src/app/(frontend)/(admin)/admin/categories/page.tsx`

- [x] Task 10: Update sidebar navigation
  - [x] SubTask 10.1: Add "分类管理" link to admin section in `src/components/@prime-light/dashboard/app-sidebar.tsx`
  - [x] SubTask 10.2: Ensure navigation items are shown based on user role

# Task Dependencies
- [Task 2] depends on [Task 1] (schemas needed for API validation)
- [Task 3] depends on [Task 1] (schemas needed for type inference)
- [Task 5] depends on [Task 3] (hooks needed for mutations)
- [Task 9] depends on [Task 2] and [Task 3] (API and hooks needed)
