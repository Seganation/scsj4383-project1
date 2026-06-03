"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowLeft, XCircle, ArrowUpRight } from "lucide-react";

function ResetPasswordContent() {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const error = searchParams.get("error");
    if (error === "invalid_token") {
      setStatus("invalid");
      toast.error("Invalid or expired reset link");
      return;
    }
    if (tokenParam) {
      setToken(tokenParam);
      setStatus("valid");
    } else {
      setStatus("invalid");
      toast.error("No reset token found");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("No reset token found");
    if (!newPassword || !confirmPassword) return toast.error("Please fill in all fields");
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    setIsLoading(true);
    try {
      const result = await authClient.resetPassword({ newPassword, token });
      if (result.error) {
        toast.error(result.error.message || "Failed to reset password");
        return;
      }
      toast.success("Password reset. Sign in with your new password.");
      router.push("/sign-in");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-steel">
        <Loader2 className="h-4 w-4 animate-spin text-copper" />
        Verifying reset link…
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div>
        <div className="eyebrow-copper">§ Invalid link</div>
        <h1 className="display mt-4 text-[clamp(2rem,4vw,3rem)] text-ink">
          Link expired or <span className="italic text-copper">invalid.</span>
        </h1>
        <p className="mt-4 text-[0.95rem] text-steel">
          Reset links are single-use and expire after a short window. Start a
          new reset from the sign-in page.
        </p>
        <div className="mt-8 border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-center gap-3 text-destructive">
            <XCircle className="h-5 w-5" />
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em]">
              Token rejected
            </span>
          </div>
        </div>
        <Link href="/sign-in" className="btn-ink mt-8 w-full">
          Back to sign in
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="eyebrow-copper">§ Reset</div>
      <h1 className="display mt-4 text-[clamp(2rem,4vw,3rem)] text-ink">
        Set a new <span className="italic text-copper">password.</span>
      </h1>
      <p className="mt-4 text-[0.95rem] text-steel">
        Minimum 8 characters. Keep it strong.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="new-password" className="field-label">
            <span className="text-copper">01 —</span> New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              className="field-input pr-12"
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-steel-light hover:text-ink"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm-password" className="field-label">
            <span className="text-copper">02 —</span> Confirm password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              className="field-input pr-12"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-steel-light hover:text-ink"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="btn-ink w-full"
          disabled={isLoading || !newPassword || !confirmPassword}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Reset password
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </form>
      <Link
        href="/sign-in"
        className="mt-6 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-steel-light hover:text-copper"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-steel">
          <Loader2 className="h-4 w-4 animate-spin text-copper" />
          Loading…
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
