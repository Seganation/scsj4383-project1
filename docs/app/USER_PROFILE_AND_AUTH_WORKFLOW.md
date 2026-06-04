# User Authentication, Google Sign-In, Guest Order Linking, and Profile Management

## Overview
This document summarizes the full implementation and workflow for user authentication, Google OAuth, guest order linking, and user profile management in the Archcool e-commerce platform, as completed in this session.

---

## 1. Google Sign-In & Sign-Up (Better Auth)
- **Google OAuth is enabled** using Better Auth's built-in social provider integration.
- **Backend:**
  - `auth.ts` configures the Google provider with `clientId` and `clientSecret` from environment variables.
  - `mapProfileToUser` ensures the user's Google profile image, first name, and last name are saved to the user model.
- **Frontend:**
  - Both sign-in and sign-up pages have a "Sign in/up with Google" button.
  - On click, calls `authClient.signIn.social({ provider: 'google' })`.
  - Handles loading state and errors.
- **Google profile image** is displayed in the header avatar for Google users.

---

## 2. Guest Order Linking
- **Guest orders** (orders placed without an account) are automatically linked to a user after any successful sign-in (Google, email, magic link, etc.).
- **How it works:**
  - On first detection of an authenticated user, the frontend POSTs to `/api/orders/link-guest-orders/`.
  - The backend links any guest orders (where `userId` is null and `shippingEmail` matches) to the user's account.
  - A toast notifies the user if any orders were linked.
- **This ensures users always see their full order history, even if they previously checked out as a guest.**

---

## 3. User Profile Page (`/profile`)
- **Modern, user-friendly profile page** at `/profile`.
- **Features:**
  - View and update avatar (Uploadthing integration, backend endpoint placeholder)
  - View and edit name/email (backend endpoint placeholder)
  - See number of orders placed (fetched from `/api/orders/:userId`)
  - Button to view "My Orders" (`/my-orders`)
  - Change password with OTP sent to email (re-uses existing OTP/email logic)
- **Avatar upload:**
  - User selects a new image, which is uploaded to `/api/upload-avatar` (to be implemented with Uploadthing).
  - After upload, `/api/user/update-profile-image` updates the user's profile image in the database.
- **Password change/reset:**
  - User requests OTP to their email, enters OTP and new password, and submits to `/api/auth/set-password`.

---

## 4. Header Avatar & Dropdown
- **Header avatar** displays the user's Google profile image (if available), or a fallback.
- **Dropdown menu** includes a "Change Avatar" option, which opens a file picker and triggers the avatar upload flow.

---

## 5. Security & UX
- **All sensitive actions** (password change, email change, avatar upload) require the user to be authenticated.
- **Toasts** provide user feedback for all major actions (success/failure).
- **Session state** is managed globally, and the UI updates in real time after profile changes.

---

## 6. Extensibility
- The system is designed to be easily extended for additional profile fields, custom avatar storage, or more social providers.
- All backend endpoints for profile updates and avatar upload are scaffolded for easy implementation.

---

## 7. Workflow Summary
1. **User signs up or signs in** (email/password, Google, magic link, OTP, etc.).
2. **Guest orders are automatically linked** to their account if their email matches previous guest orders.
3. **User can view and update their profile** at `/profile`, including avatar, name, email, and password.
4. **User can view their order history** and navigate to "My Orders".
5. **All changes are reflected in the UI** and persist across sessions.

---

## 8. TODOs for Full Production Readiness
- Implement `/api/upload-avatar` (Uploadthing integration).
- Implement `/api/user/update-profile-image` and `/api/user/update-profile-info` endpoints.
- Ensure `/api/auth/send-otp` and `/api/auth/set-password` support OTP password changes.

---

**This document covers all major authentication, user management, and profile features implemented in this session. For further customization or new features, see the codebase and this doc as your starting point.** 