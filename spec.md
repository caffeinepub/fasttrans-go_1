# FastTrans

## Current State
App has DriverEnRoutePage with a 'بدء الرحلة' button that navigates to /passenger after driver arrives. RatingModal exists but is not wired into any post-trip flow. No trip-in-progress or post-trip rating screen.

## Requested Changes (Diff)

### Add
- TripInProgressPage.tsx: shows live map + driver info + countdown + 'الرحلة انتهت' button that navigates to /trip-rating
- TripRatingPage.tsx: 5-star rating, quick tags (نظافة، لطف، سرعة), optional comment, submit navigates to /history

### Modify
- App.tsx: add routes /trip-in-progress and /trip-rating
- DriverEnRoutePage.tsx: 'بدء الرحلة' button navigates to /trip-in-progress instead of /passenger

### Remove
- Nothing

## Implementation Plan
1. Create TripInProgressPage with map, driver info from sessionStorage, simulated progress bar, 'الرحلة انتهت' button -> /trip-rating
2. Create TripRatingPage with 5 stars, quick-tag chips, textarea comment, submit -> /history
3. Update DriverEnRoutePage: change handleStartTrip to navigate to /trip-in-progress
4. Register both routes in App.tsx
