# Schematics Feature Implementation Spec

## Why
The application needs a complete schematics management system that allows creators to upload, manage, and share Minecraft schematic files with the community. This includes file storage, metadata management, categorization, and engagement features.

## What Changes
- Add API routes for schematics CRUD operations (create, read, update, delete)
- Add API routes for categories management
- Add API routes for engagement operations (upvote, star, view increment)
- Add file upload functionality to Supabase storage (bucket: "bucket-1")
- Add Zod schemas for all schematic-related API request/response validation
- Update OpenAPI documentation with new endpoints
- Update frontend components to use real API data
- Add hooks for schematic data fetching and mutations

## Impact
- Affected specs: Schematics browsing, uploading, detail viewing, user engagement
- Affected code:
  - `src/app/(backend)/api/v1/` - New API routes
  - `src/schema/` - New Zod schemas
  - `src/lib/openapi-meta.ts` - OpenAPI documentation
  - `src/components/@prime-light/schematics/` - Components update
  - `src/components/@prime-light/dashboard/upload-schematic-form.tsx` - Upload logic
  - `src/hooks/` - New hooks for data fetching

## ADDED Requirements

### Requirement: Schematic File Upload
The system SHALL provide file upload functionality for schematic files to Supabase storage.

#### Scenario: Successful file upload
- **WHEN** a creator uploads a schematic file (.schematic, .schem, .litematic, .nbt)
- **THEN** the file is stored in Supabase storage bucket "bucket-1" under `schematics/{user_id}/{filename}` path
- **AND** a public URL is returned for the uploaded file

#### Scenario: Image upload for preview
- **WHEN** a creator uploads preview images
- **THEN** images are stored in Supabase storage bucket "bucket-1" under `images/{user_id}/{schematic_id}/{filename}` path
- **AND** public URLs are returned for all uploaded images

### Requirement: Schematic CRUD API
The system SHALL provide REST API endpoints for schematic management.

#### Scenario: Create schematic
- **WHEN** a creator submits a new schematic with metadata
- **THEN** a new schematic record is created in the database
- **AND** the schematic is associated with the authenticated user
- **AND** the initial status is "draft"

#### Scenario: List schematics with pagination
- **WHEN** a user requests the schematic list
- **THEN** published schematics are returned with pagination support
- **AND** each schematic includes its categories as aggregated data

#### Scenario: Get schematic by ID
- **WHEN** a user requests a specific schematic
- **THEN** the schematic details are returned if accessible (published or owned)
- **AND** the view count is incremented

#### Scenario: Update schematic
- **WHEN** an author updates their schematic
- **THEN** the schematic metadata is updated
- **AND** only draft/under_review/rejected schematics can be updated by authors

#### Scenario: Delete schematic
- **WHEN** an author deletes their schematic
- **THEN** the schematic is removed from the database
- **AND** only draft/rejected schematics can be deleted by authors

### Requirement: Category Management API
The system SHALL provide API endpoints for category operations.

#### Scenario: List all categories
- **WHEN** a user requests the category list
- **THEN** all categories are returned with their details

#### Scenario: Get schematics by category
- **WHEN** a user requests schematics for a specific category
- **THEN** published schematics in that category are returned

### Requirement: Engagement API
The system SHALL provide API endpoints for user engagement.

#### Scenario: Upvote schematic
- **WHEN** a user upvotes a schematic
- **THEN** the upvote count is incremented
- **AND** the count cannot go below 0

#### Scenario: Star schematic
- **WHEN** a user stars a schematic
- **THEN** the star count is incremented
- **AND** the count cannot go below 0

#### Scenario: Increment view count
- **WHEN** a schematic is viewed
- **THEN** the view count is incremented by 1

### Requirement: Schematic Schema Validation
The system SHALL provide Zod schemas for all schematic-related API validation.

#### Scenario: Request validation
- **WHEN** an API request is received
- **THEN** the request body is validated against the corresponding Zod schema
- **AND** invalid requests return 400 error with details

### Requirement: OpenAPI Documentation
The system SHALL document all schematic APIs in OpenAPI specification.

#### Scenario: API documentation
- **WHEN** a developer accesses the API documentation
- **THEN** all schematic endpoints are documented with request/response schemas
- **AND** the documentation includes authentication requirements

### Requirement: Frontend Integration
The system SHALL integrate real API calls in frontend components.

#### Scenario: Schematic listing page
- **WHEN** a user visits the schematics page
- **THEN** real schematic data is fetched from the API
- **AND** pagination and filtering work correctly

#### Scenario: Upload form submission
- **WHEN** a creator submits the upload form
- **THEN** files are uploaded to Supabase storage
- **AND** schematic metadata is saved to the database
- **AND** appropriate feedback is shown to the user
