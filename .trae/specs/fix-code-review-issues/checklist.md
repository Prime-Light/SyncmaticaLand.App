# Checklist

## useSchematics Hook Fixes
- [x] `refetch` function triggers a new network request
- [x] Mounted guard prevents state updates after component unmount
- [x] `isLoading` is reset to `true` at the start of each fetch
- [x] No React warnings about state updates after unmount

## useSchematic Hook Fixes
- [x] Mounted guard prevents state updates after component unmount
- [x] `isLoading` is reset to `true` at the start of each fetch
- [x] No React warnings about state updates after unmount

## uploadSchematicFile Error Handling
- [x] Returned error is an instance of native `Error`
- [x] Error message is preserved from Supabase error

## nav-user.tsx Accessibility
- [x] `AvatarImage` in `UserMenuHeader` has `alt` prop with user's display name
