"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { emailOtp, signIn } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface OTPFormProps {
  email: string;
  mode: "sign-in" | "sign-up" | "password-reset" | "email-verification";
  onSuccess?: () => void;
  onBack?: () => void;
}

export function OTPForm({ email, mode, onSuccess, onBack }: OTPFormProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  // Timer for resend cooldown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      let result;

      switch (mode) {
        case "sign-in":
        case "sign-up":
          result = await signIn.emailOtp({
            email,
            otp,
          });
          break;
        case "email-verification":
          result = await emailOtp.verifyEmail({
            email,
            otp,
          });
          break;
        case "password-reset":
          // For password reset, we need to verify the OTP first
          // Use emailOtp.verifyEmail() to validate the OTP
          result = await emailOtp.verifyEmail({
            email,
            otp,
          });
          
          if (result.error) {
            toast.error(result.error.message || "Invalid OTP code");
            return;
          }
          
          // OTP is valid, show password reset form
          toast.success("OTP verified! Please set your new password.");
          setIsPasswordReset(true);
          return;
        default:
          throw new Error("Invalid mode");
      }

      if (result.error) {
        toast.error(result.error.message || "Invalid OTP code");
        return;
      }

      toast.success("Email verified successfully!");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsResettingPassword(true);
    
    try {
      // Use Better Auth's resetPassword method which handles both OTP verification and password reset
      const result = await emailOtp.resetPassword({
        email,
        otp,
        password: newPassword,
      });
      
      if (result.error) {
        throw new Error(result.error.message || "Failed to reset password");
      }
      
      toast.success("Password reset successfully! You can now sign in with your new password.");
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/sign-in");
      }
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      let otpType: "sign-in" | "email-verification" | "forget-password";

      switch (mode) {
        case "password-reset":
          otpType = "forget-password";
          break;
        case "email-verification":
          otpType = "email-verification";
          break;
        case "sign-in":
        case "sign-up":
        default:
          otpType = "sign-in";
          break;
      }

      const result = await emailOtp.sendVerificationOtp({
        email,
        type: otpType,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to resend OTP");
        return;
      }

      toast.success("New OTP code sent to your email");
      setOtp(""); // Clear the current OTP input
      setResendTimer(60); // Start 60-second cooldown
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case "sign-in":
        return "Sign In Verification";
      case "sign-up":
        return "Account Verification";
      case "password-reset":
        return isPasswordReset ? "Set New Password" : "Password Reset Verification";
      case "email-verification":
        return "Email Verification";
      default:
        return "Email Verification";
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case "sign-in":
        return "Enter the 6-digit code sent to your email to complete sign in";
      case "sign-up":
        return "Enter the 6-digit code sent to your email to activate your account";
      case "password-reset":
        return isPasswordReset 
          ? "Enter your new password below"
          : "Enter the 6-digit code sent to your email to reset your password";
      case "email-verification":
        return "Enter the 6-digit code sent to your email to verify your email address";
      default:
        return "Enter the 6-digit code sent to your email";
    }
  };

  // If we're in password reset mode and OTP is verified, show password form
  if (mode === "password-reset" && isPasswordReset) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{getModeTitle()}</h1>
          <p className="text-gray-600">{getModeDescription()}</p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isResettingPassword}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isResettingPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isResettingPassword}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isResettingPassword}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isResettingPassword || !newPassword || !confirmPassword}
          >
            {isResettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isResettingPassword ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        {onBack && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            Back to Email
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{getModeTitle()}</h1>
        <p className="text-gray-600">{getModeDescription()}</p>
        <p className="text-sm text-gray-500">
          Code sent to: <span className="font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(value);
            }}
            maxLength={6}
            className="text-center text-lg tracking-widest"
            required
            autoFocus
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <div className="text-center space-y-3">
        <p className="text-sm text-gray-500">Didn&apos;t receive the code?</p>

        <Button
          type="button"
          variant="outline"
          onClick={handleResendOTP}
          disabled={isResending || resendTimer > 0}
          className="w-full"
        >
          {isResending ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
        </Button>

        {onBack && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            Back to Email
          </Button>
        )}
      </div>

      <div className="text-xs text-gray-400 text-center">
        The verification code will expire in 5 minutes
      </div>
    </div>
  );
}
