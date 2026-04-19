# Fix Code Review Issues Spec

## Why
The code review identified several bugs and accessibility issues in the hooks and components that could lead to: broken refetch functionality, React warnings from state updates after unmount, misleading error types, and accessibility regressions.

## What Changes
- Fix `useSchematics` hook's `refetch` function to actually trigger a new network request
- Add mounted guard to both `useSchematics` and `useSchematic` hooks to prevent state updates after unmount
- Reset `isLoading` state at the start of each fetch in both hooks
- Fix `uploadSchematicFile` to wrap Supabase error in native `Error` object
- Add `alt` prop to `AvatarImage` in `UserMenuHeader` component for accessibility

## Impact
- Affected specs: `implement-schematics-feature`, `implement-dashboard`
- Affected code:
  - `src/hooks/use-schematics.ts`
  - `src/hooks/use-schematic.ts`
  - `src/lib/storage/upload.ts`
  - `src/components/@prime-light/dashboard/nav-user.tsx`

## ADDED Requirements

### Requirement: Hook Refetch Functionality
The `useSchematics` hook's `refetch` function SHALL trigger a new network request to fetch data.

#### Scenario: Refetch triggers new request
- **WHEN** user calls `refetch()` from `useSchematics` hook
- **THEN** a new network request SHALL be made to fetch schematics data
- **AND** `isLoading` SHALL be set to `true` before the request starts

### Requirement: Mounted Guard for Hooks
Both `useSchematics` and `useSchematic` hooks SHALL prevent state updates after component unmount.

#### Scenario: Prevent state update after unmount
- **WHEN** a fetch is in progress and the component unmounts
- **THEN** no state updates SHALL occur after unmount
- **AND** no React warnings SHALL be triggered

### Requirement: Loading State Reset
Both `useSchematics` and `useSchematic` hooks SHALL reset `isLoading` to `true` at the start of each fetch operation.

#### Scenario: Loading indicator shows on subsequent fetches
- **WHEN** options or id changes triggering a new fetch
- **THEN** `isLoading` SHALL be set to `true` at the start of the fetch

### Requirement: Error Type Consistency
The `uploadSchematicFile` function SHALL return errors wrapped in native `Error` objects.

#### Scenario: Error is native Error instance
- **WHEN** `uploadSchematicFile` encounters an error
- **THEN** the returned error SHALL be an instance of native `Error`
- **AND** consumers can safely use `instanceof Error` checks

### Requirement: Avatar Accessibility
The `AvatarImage` component SHALL have an `alt` prop for accessibility.

#### Scenario: Avatar has accessible alt text
- **WHEN** `AvatarImage` is rendered with a user avatar
- **THEN** an `alt` prop with meaningful text SHALL be provided
