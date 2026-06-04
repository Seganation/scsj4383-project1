# Forgot Password Implementation

## Overview

This document outlines the comprehensive forgot password flow implementation for the Archcool e-commerce platform. The implementation handles all user scenarios including Google-only users, email/password users, and mixed accounts.

## Architecture

### Backend Components

#### 1. User Provider API (`/api/auth/user-provider`)
```typescript
// Checks user account types and determines reset eligibility
GET /api/auth/user-provider?email={email}

Response:
{
  hasGoogleAccount: boolean,
  hasPassword: boolean,
  canResetPassword: boolean
}
```

#### 2. Email Check API (`/api/auth/check-email`)
```typescript
// Verifies email existence and account status
POST /api/auth/check-email

Body: { email: string }
Response: { status: "user" | "guest" | "new" }
```

### Frontend Components

#### 1. Enhanced Sign-In Page (`/app/(auth)/sign-in/page.tsx`)
- **Forgot Password Button**: Appears when login fails
- **Multi-step Flow**: Email input → Account type check → OTP verification
- **State Management**: Handles different user scenarios

#### 2. Updated OTPForm Component (`/components/auth/OTPForm.tsx`)
- **Better Auth Integration**: Uses built-in `emailOtp.resetPassword()` method
- **Integrated Password Reset**: Password form appears after OTP verification
- **Professional UI**: Password visibility toggles and validation

## User Flow Scenarios

### Scenario 1: Google-Only Users
```
User enters email → System detects Google-only account → 
Shows "Google Account Only" screen → Prompts to use Google sign-in
```

### Scenario 2: Email/Password Users
```
User enters wrong password → "Forgot password?" appears → 
User enters email → System sends OTP → User verifies OTP → 
User sets new password → Password updated securely
```

### Scenario 3: Mixed Accounts (Google + Email/Password)
```
User enters email → System checks account types → 
If has password: allows reset | If no password: directs to Google sign-in
```

### Scenario 4: Non-existent Email
```
User enters email → System checks existence → 
Shows appropriate error message → Suggests sign-up if needed
```

## Security Features

### 1. Better Auth Integration
- Uses `emailOtp.resetPassword()` method for secure password updates
- Leverages Better Auth's built-in scrypt password hashing
- Proper session management and token handling

### 2. OTP Security
- 6-digit codes with configurable expiration (default: 300 seconds)
- Rate limiting on verification attempts (default: 3 attempts)
- Secure email delivery through configured email service

### 3. Input Validation
- Email format validation
- Password strength requirements (minimum 8 characters)
- Password confirmation matching
- Account type verification before allowing reset

## Technical Implementation

### API Routes

#### `/api/auth/user-provider`
```typescript
// Checks user account types
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  const hasGoogleAccount = user.accounts.some(account => account.providerId === "google");
  const hasPassword = user.accounts.some(account => account.providerId === "credential");

  return NextResponse.json({
    hasGoogleAccount,
    hasPassword,
    canResetPassword: hasPassword,
  });
}
```

### Frontend State Management

#### Sign-In Page States
```typescript
type ForgotPasswordStep = "initial" | "email-input" | "google-only" | "otp-verification";

// State variables
const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>("initial");
const [showForgotPasswordButton, setShowForgotPasswordButton] = useState(false);
const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
```

#### OTPForm Integration
```typescript
// Uses Better Auth's built-in resetPassword method
const result = await emailOtp.resetPassword({
  email,
  otp, // The verified OTP
  password: newPassword,
});
```

## User Experience Features

### 1. Progressive Disclosure
- Forgot password button only appears when login fails
- Clear step-by-step flow with visual indicators
- Helpful error messages and guidance

### 2. Professional UI
- Consistent with existing design system
- Loading states and proper feedback
- Responsive design for all devices

### 3. Accessibility
- Proper ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader friendly components

## Testing Scenarios

### Test Case 1: Google-Only Users
1. Navigate to sign-in page
2. Enter email of Google-only user
3. Click "Forgot password?"
4. Should see "Google Account Only" screen
5. Should prompt to use Google sign-in

### Test Case 2: Email/Password Users
1. Enter wrong password on sign-in
2. Click "Forgot your password?"
3. Enter email address
4. Check email for OTP
5. Enter OTP and verify
6. Set new password
7. Confirm password matches
8. Success message and redirect to sign-in

### Test Case 3: Mixed Accounts
1. Test with user who has both Google and password accounts
2. Should allow password reset if they have password account
3. Should direct to Google sign-in if no password account

### Test Case 4: Non-existent Email
1. Enter non-existent email in forgot password flow
2. Should show appropriate error message
3. Should suggest sign-up if needed

## Configuration

### Better Auth Email OTP Plugin
```typescript
// auth.ts
plugins: [
  emailOTP({
    async sendVerificationOTP({ email, otp, type }) {
      const { emailService } = await import("./app/lib/email");
      await emailService.sendOTP(email, otp, type);
    },
  }),
]
```

### Email Templates
```typescript
// src/lib/email.ts
otpPasswordReset: (otp: string) => ({
  subject: "🔒 Reset Your ArchCool Password",
  html: `...`, // Professional email template
  text: `Your ArchCool password reset code is: ${otp}`,
})
```

## Security Considerations

### 1. Rate Limiting
- OTP attempts are limited to prevent brute force attacks
- Email sending is rate limited to prevent spam

### 2. Token Security
- OTP tokens expire after 5 minutes
- Failed attempts invalidate the token after 3 tries

### 3. Account Protection
- Google-only users cannot reset passwords
- Mixed accounts are handled appropriately
- Non-existent emails are handled gracefully

## Maintenance

### Monitoring
- Monitor OTP success/failure rates
- Track password reset completion rates
- Monitor for unusual patterns

### Updates
- Keep Better Auth updated for security patches
- Review email templates periodically
- Update rate limiting as needed

## Future Enhancements

### Potential Improvements
1. **SMS OTP**: Add phone number verification option
2. **Security Questions**: Add additional verification steps
3. **Account Recovery**: Implement backup email options
4. **Analytics**: Track user behavior for UX improvements

### Scalability Considerations
1. **Email Service**: Ensure email delivery can handle high volume
2. **Database**: Monitor user and verification table performance
3. **Caching**: Consider caching for frequently accessed user data

## Related Files

### Core Implementation
- `src/app/(auth)/sign-in/page.tsx` - Main sign-in page with forgot password flow
- `src/components/auth/OTPForm.tsx` - OTP verification and password reset component
- `src/app/api/auth/user-provider/route.ts` - User account type checking API
- `src/app/api/auth/check-email/route.ts` - Email existence verification API

### Configuration
- `src/auth.ts` - Better Auth configuration with email OTP plugin
- `src/lib/email.ts` - Email service and templates
- `src/lib/auth-client.ts` - Better Auth client configuration

### Database Schema
- `prisma/schema.prisma` - User, Account, and Session models

## Critical Bug Fixes

### 1. Sign-In Error Handling Fix
**Issue**: The sign-in page was showing "Signed in successfully!" even when authentication failed due to incorrect password handling.

**Root Cause**: The code was using `await signIn.email()` without properly checking the response object's `error` property.

**Fix**: Updated the sign-in logic to properly handle Better Auth's response format:
```typescript
const result = await signIn.email({
  email,
  password,
});

// Check if there was an error
if (result.error) {
  console.error("Sign in error:", result.error);
  toast.error(
    result.error.message || "Failed to sign in. Please check your credentials."
  );
  // Show forgot password button when login fails
  setShowForgotPasswordButton(true);
  return;
}
```

**Files Modified**:
- `src/app/(auth)/sign-in/page.tsx` - Fixed `handleSubmit` and `handleGoogleSignIn` functions

### 2. OTP Verification Fix
**Issue**: The "Verify Code" button was not sending any verification requests - it was immediately showing the password reset form without validating the OTP.

**Root Cause**: In the `handleVerifyOTP` function, the `password-reset` case was just setting `setIsPasswordReset(true)` and returning early without actually calling any verification API.

**Fix**: Added proper OTP verification for password reset:
```typescript
case "password-reset":
  // For password reset, we need to verify the OTP first
  result = await emailOtp.verifyEmail({
    email,
    otp,
  });
  
  if (result.error) {
    toast.error(result.error.message || "Invalid OTP code");
    return;
  }
  
  // If OTP is valid, show password reset form
  setIsPasswordReset(true);
  return;
```

**How it works now**:
1. User enters OTP → Clicks "Verify Code" → Sends verification request
2. If OTP is invalid → Shows "Invalid OTP" error
3. If OTP is valid → Shows password reset form
4. User enters new password → `emailOtp.resetPassword()` sets the password

**Files Modified**:
- `src/components/auth/OTPForm.tsx` - Fixed OTP verification to actually send requests

### 3. Resend OTP Timer Implementation
**Issue**: No cooldown period for resending OTP codes, allowing spam.

**Fix**: Added a 60-second timer for resend functionality:
```typescript
const [resendTimer, setResendTimer] = useState(0);

// Timer for resend cooldown
useEffect(() => {
  if (resendTimer > 0) {
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }
}, [resendTimer]);

// In handleResendOTP:
setResendTimer(60); // Start 60-second cooldown

// In button:
disabled={isResending || resendTimer > 0}
{isResending ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
```

**Files Modified**:
- `src/components/auth/OTPForm.tsx` - Added resend timer functionality

## Conclusion

This implementation provides a secure, user-friendly forgot password flow that handles all edge cases while following Better Auth best practices. The solution is production-ready and includes proper error handling, security measures, and accessibility features.

**Important**: The sign-in error handling fix ensures that users receive accurate feedback when authentication fails, and the forgot password button only appears when appropriate. 