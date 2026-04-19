# Tasks

- [x] Task 1: Fix `useSchematics` hook issues
  - [x] SubTask 1.1: Add `refetchToken` state and include it in effect dependencies
  - [x] SubTask 1.2: Update `refetch` function to increment `refetchToken` to trigger new fetch
  - [x] SubTask 1.3: Add mounted guard inside `useEffect` to prevent state updates after unmount
  - [x] SubTask 1.4: Reset `isLoading` to `true` at the start of each fetch
  - [x] SubTask 1.5: Add `if (!mounted) return;` checks after awaited operations

- [x] Task 2: Fix `useSchematic` hook issues
  - [x] SubTask 2.1: Add mounted guard inside `doFetch` to prevent state updates after unmount
  - [x] SubTask 2.2: Reset `isLoading` to `true` at the start of each fetch
  - [x] SubTask 2.3: Add `if (!mounted) return;` checks after awaited operations

- [x] Task 3: Fix `uploadSchematicFile` error handling
  - [x] SubTask 3.1: Wrap Supabase error in native `Error` object before returning

- [x] Task 4: Fix `nav-user.tsx` accessibility issue
  - [x] SubTask 4.1: Add `alt` prop to `AvatarImage` in `UserMenuHeader` component

# Task Dependencies
- All tasks are independent and can be processed in parallel
