# Checklist

## Category Mutation Schemas
- [x] CreateCategoryReqSchema is created with required name and slug fields
- [x] UpdateCategoryReqSchema is created with all optional fields
- [x] CategoryResSchema is created for single category response
- [x] All new schemas are exported from schema index

## Category Management API
- [x] POST /api/v1/categories creates new category (admin only)
- [x] GET /api/v1/categories/[id] returns single category
- [x] PATCH /api/v1/categories/[id] updates category (admin only)
- [x] DELETE /api/v1/categories/[id] deletes category (admin only)
- [x] All mutation endpoints verify admin role before execution
- [x] OpenAPI documentation includes new category endpoints

## Category Mutation Hooks
- [x] useCreateCategory hook works correctly
- [x] useUpdateCategory hook works correctly
- [x] useDeleteCategory hook works correctly
- [x] All hooks are exported from hooks index

## Creator Dashboard Page
- [x] Dashboard shows total projects count
- [x] Dashboard shows total views across all projects
- [x] Dashboard shows total upvotes across all projects
- [x] Dashboard shows total stars across all projects
- [x] Dashboard shows recent projects list
- [x] Statistics are fetched from user's own schematics

## Projects Management Page
- [x] Projects table shows all user's schematics
- [x] Table columns include name, status, views, upvotes, stars, created_at
- [x] Status badges display correctly for each status type
- [x] Edit action opens edit dialog/sheet
- [x] Edit form allows modifying name, description, tags, mc_version, images
- [x] Delete action shows confirmation dialog
- [x] Delete only works for draft/rejected status projects
- [x] Table supports pagination

## Admin Dashboard Layout
- [x] Admin layout exists at /admin route
- [x] Admin sidebar shows admin navigation items
- [x] Non-admin users are redirected away from admin pages
- [x] Admin sidebar includes link to categories management

## Admin Dashboard Overview Page
- [x] Admin dashboard shows total users count
- [x] Admin dashboard shows total schematics count
- [x] Admin dashboard shows pending reviews count
- [x] Admin dashboard shows recent activity

## Admin Project Audit Page
- [x] Audit page lists schematics with under_review status
- [x] Status filter works correctly
- [x] Approve button changes status to published
- [x] Reject button changes status to rejected
- [x] Project detail view is accessible

## Admin Category Management Page
- [x] Categories table shows all categories
- [x] Table columns include name, slug, description, icon_url
- [x] Create button opens create category form
- [x] Create form validates name and slug uniqueness
- [x] Inline editing works for name, description, icon_url
- [x] Delete button shows confirmation dialog
- [x] Delete removes category from database
