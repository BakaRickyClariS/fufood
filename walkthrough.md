# Push Notification Implementation Walkthrough

## 1. Changes Implemented (Frontend)
- **API Services**:
  - Created `src/api/services/notification.ts` for managing token registration and settings.
  - Implemented `src/modules/notifications/api/notificationsApiImpl.ts` to connect existing notification hooks to the real backend.
  - Updated `src/modules/notifications/api/index.ts` to switch between mock and real API based on `VITE_USE_MOCK_API`.

- **Hooks**:
  - Created `src/hooks/useFCMToken.ts` to encapsulate permission requests and token sinking.

- **UI Integration**:
  - Updated `src/routes/Settings/Notifications.tsx` to use the new hooks and real data. It now correctly toggles `enablePush` with permission checks.
  - (Existing) `NotificationsPage` is now connected to `notificationsApiImpl` (when mock is disabled), so it will fetch real notifications.

- **Infrastructure**:
  - `public/firebase-messaging-sw.js`: Service Worker setup (requires Client Config).
  - `src/lib/firebase.ts`: Firebase initialization.

## 2. Verification Results
- **Build Check**: Ran `npm run build` successfully.
  - TypeScript compilation (`tsc -b`): Passed.
  - Vite Build: Passed.

## 3. How to Test (Frontend)
1.  **Configure Environment**:
    - Ensure `.env` has `VITE_FIREBASE_VAPID_KEY`.
    - Ensure `public/firebase-messaging-sw.js` has valid `firebaseConfig`.
    - Set `VITE_USE_MOCK_API=false` (if you have the backend running) or `true` (but `registerToken` needs backend).

2.  **Toggle Push**:
    - Go to **Settings > Notifications**.
    - Toggle "推播通知".
    - Browser should ask for permission.
    - If allowed, console log will show "Push Token obtained" (or similar debug log if enabled in `lib/firebase.ts`) and call `POST /api/v1/notifications/token`.

3.  **Receive Notification**:
    - Use the `scripts/test-push.cjs` to send a test message to the token you obtained.

## 4. Next Steps
- Implement the Backend logic (Database & API Endpoints) as described in `docs/features/push-notification-backend.md`.
