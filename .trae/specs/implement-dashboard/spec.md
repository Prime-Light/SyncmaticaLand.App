# Dashboard Implementation Spec

## Why

The application needs fully functional dashboard pages for creators to manage their schematics and for admins to manage categories and audit content. Currently, dashboard pages are placeholders without real functionality.

## What Changes

* Add API routes for category management (POST, PATCH, DELETE - admin only)

* Add category mutations hooks for frontend

* Implement creator dashboard page with statistics overview

* Implement projects page with editable schematic list

* Create admin dashboard layout and pages

* Implement admin dashboard overview page

* Implement admin project audit page

* Implement admin category management page with CRUD operations

* Add data table components with inline editing capabilities

## Impact

* Affected specs: Dashboard functionality, Admin capabilities, Category management

* Affected code:

  * `src/app/(backend)/api/v1/categories/` - New API routes for category CRUD

  * `src/hooks/` - New hooks for category mutations

  * `src/app/(frontend)/(dashboard)/dashboard/` - Dashboard page implementations

  * `src/app/(frontend)/(dashboard)/admin/` - New admin dashboard section

  * `src/components/@prime-light/dashboard/` - New dashboard components

  * `src/schema/schematic/category.ts` - Add category mutation schemas

## ADDED Requirements

### Requirement: Category Management API

The system SHALL provide REST API endpoints for category management (admin only).

#### Scenario: Create category

* **WHEN** an admin creates a new category with name, slug, description, and icon\_url

* **THEN** a new category record is created in the database

* **AND** the category is returned with all fields

#### Scenario: Update category

* **WHEN** an admin updates a category

* **THEN** the category fields are updated

* **AND** only admin can perform this operation

#### Scenario: Delete category

* **WHEN** an admin deletes a category

* **THEN** the category is removed from the database

* **AND** associated schematic\_categories junctions are cascade deleted

### Requirement: Creator Dashboard Overview

The system SHALL provide a dashboard overview page for creators.

#### Scenario: View dashboard statistics

* **WHEN** a creator visits their dashboard

* **THEN** they see statistics including total projects, views, upvotes, and stars

* **AND** they see a list of their recent projects

### Requirement: Projects Management Page

The system SHALL provide a projects management page for creators.

#### Scenario: List own projects

* **WHEN** a creator visits the projects page

* **THEN** they see all their schematics regardless of status

* **AND** each project shows status, views, upvotes, stars, and creation date

#### Scenario: Edit project

* **WHEN** a creator clicks edit on a project

* **THEN** they can modify name, description, tags, mc\_version, and images

* **AND** only draft/under\_review/rejected projects can be edited by authors

#### Scenario: Delete project

* **WHEN** a creator deletes a project

* **THEN** the project is removed if it's draft or rejected status

* **AND** a confirmation dialog is shown before deletion

### Requirement: Admin Dashboard Layout

The system SHALL provide a separate layout for admin pages.

#### Scenario: Access admin pages

* **WHEN** an admin navigates to /admin routes

* **THEN** they see an admin-specific sidebar with admin navigation items

* **AND** non-admin users are redirected to the main dashboard

### Requirement: Admin Dashboard Overview

The system SHALL provide an admin dashboard overview page.

#### Scenario: View admin statistics

* **WHEN** an admin visits the admin dashboard

* **THEN** they see platform statistics including total users, total schematics, pending reviews

* **AND** they see recent activity summary

### Requirement: Admin Project Audit Page

The system SHALL provide a project audit page for admins.

#### Scenario: List projects for review

* **WHEN** an admin visits the audit page

* **THEN** they see schematics with status under\_review

* **AND** they can filter by status

#### Scenario: Approve or reject project

* **WHEN** an admin reviews a project

* **THEN** they can change status to published or rejected

* **AND** they can view full project details

### Requirement: Admin Category Management Page

The system SHALL provide a category management page for admins.

#### Scenario: List categories

* **WHEN** an admin visits the categories page

* **THEN** they see all categories in a data table

* **AND** each category shows name, slug, description, and icon

#### Scenario: Create new category

* **WHEN** an admin creates a new category

* **THEN** a form appears with name, slug, description, and icon\_url fields

* **AND** the category is added to the list after successful creation

#### Scenario: Edit category

* **WHEN** an admin edits a category inline or via form

* **THEN** the category fields are updated

* **AND** changes are reflected immediately in the table

#### Scenario: Delete category

* **WHEN** an admin deletes a category

* **THEN** a confirmation dialog appears

* **AND** the category is removed after confirmation

### Requirement: Data Table with Inline Editing

The system SHALL provide data table components with editing capabilities.

#### Scenario: Inline editing

* **WHEN** a user clicks on an editable cell

* **THEN** the cell becomes an input field

* **AND** changes are saved on blur or enter key

#### Scenario: Row actions

* **WHEN** a user views a data table

* **THEN** each row has action buttons (edit, delete) based on permissions

* **AND** actions are disabled for unauthorized operations

## MODIFIED Requirements

### Requirement: Category Schema

The category schema SHALL include mutation request schemas.

#### Scenario: Create category request

* **WHEN** creating a category

* **THEN** name and slug are required

* **AND** description and icon\_url are optional

#### Scenario: Update category request

* **WHEN** updating a category

* **THEN** all fields are optional (partial update)

