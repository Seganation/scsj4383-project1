"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession, authClient } from "@/app/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowLeft, ArrowUpRight, Mail, Lock, AlertCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

type ForgotPasswordStep = "initial" | "email-input" | "google-only" | "email-sent";

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>("initial");
  const [showForgotPasswordButton, setShowForgotPasswordButton] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const redirectTo = searchParams.get("redirectTo") || "/";

  useEffect(() => {
    if (!isPending && session?.user) {
      const userRole = (session.user as any).role;
      if (userRole === "admin") router.push("/dashboard");
      else router.push(redirectTo);
    }
  }, [session, isPending, redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const result = await signIn.email({ email, password, callbackURL: redirectTo });
      if (result?.error) {
        toast.error(result.error.message || "Failed to sign in. Please check your credentials.");
        setShowForgotPasswordButton(true);
        return;
      }
      toast.success("Signed in.");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in.");
      setShowForgotPasswordButton(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: redirectTo });
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google.");
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordStep("email-input");
    setForgotPasswordEmail(email);
  };

  const handleForgotPasswordEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email address");
      return;
    }
    setIsForgotPasswordLoading(true);
    try {
      const checkResponse = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      const checkData = await checkResponse.json();
      if (checkData.status === "new") {
        toast.error("No account found with this email address");
        return;
      }
      if (checkData.status === "guest") {
        toast.error("This email has guest orders but no account. Please sign up to claim your orders.");
        return;
      }
      const userResponse = await fetch(`/api/auth/user-provider?email=${encodeURIComponent(forgotPasswordEmail)}`);
      const userData = await userResponse.json();
      if (userData.hasGoogleAccount && !userData.hasPassword) {
        setForgotPasswordStep("google-only");
        return;
      }
      if (!userData.canResetPassword) {
        toast.error("This account doesn't have a password to reset. Please use Google sign-in.");
        return;
      }
      const result = await authClient.requestPasswordReset({
        email: forgotPasswordEmail,
        redirectTo: "/reset-password",
      });
      if (result.error) {
        toast.error(result.error.message || "Failed to send reset link");
        return;
      }
      toast.success("Reset link sent.");
      setForgotPasswordStep("email-sent");
    } catch (error: any) {
      toast.error("Failed to process request.");
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setForgotPasswordStep("initial");
    setShowForgotPasswordButton(false);
    setForgotPasswordEmail("");
  };

  // --- FORGOT PASSWORD BRANCHES ---
  if (forgotPasswordStep !== "initial") {
    return (
      <div>
        {forgotPasswordStep === "email-input" && (
          <>
            <Header
              step="§ Reset"
              title="Reset your password."
              lede="Enter your email — if we find your account, we'll send you a reset link."
            />
            <form onSubmit={handleForgotPasswordEmailSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="forgot-email" className="field-label">
                  <span className="text-copper">01 —</span> Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="field-input"
                  placeholder="you@kitchen.co.uk"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  disabled={isForgotPasswordLoading}
                />
              </div>
              <button type="submit" className="btn-ink w-full" disabled={isForgotPasswordLoading}>
                {isForgotPasswordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send reset link
              </button>
            </form>
            <FootNav onBack={handleBackToSignIn} />
          </>
        )}
        {forgotPasswordStep === "google-only" && (
          <>
            <Header
              step="§ Google account"
              title="Signed up with Google."
              lede="This email only has a Google account attached — no password to reset."
            />
            <button
              onClick={handleGoogleSignIn}
              className="btn-ghost mt-8 w-full border-ink/20 bg-paper"
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FcGoogle className="h-5 w-5" />}
              Sign in with Google
            </button>
            <FootNav onBack={handleBackToSignIn} />
          </>
        )}
        {forgotPasswordStep === "email-sent" && (
          <>
            <Header
              step="§ Check your inbox"
              title="Reset link sent."
              lede={
                <>
                  We sent a reset link to{" "}
                  <span className="text-copper">{forgotPasswordEmail}</span>. Click
                  through to set a new password.
                </>
              }
            />
            <FootNav onBack={handleBackToSignIn} />
          </>
        )}
      </div>
    );
  }

  // --- MAIN SIGN-IN ---
  return (
    <div>
      <Header
        step="§ 00 — Sign in"
        title={
          <>
            Welcome <span className="italic text-copper">back.</span>
          </>
        }
        lede="The same door to your order history, saved briefs, and invoices."
      />

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="btn-ghost mt-8 w-full border-ink/25 bg-paper"
        aria-label="Sign in with Google"
      >
        {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FcGoogle className="h-5 w-5" />}
        Continue with Google
      </button>

      <div className="my-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-ink/15" />
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-steel-light">
          or email + password
        </span>
        <span className="h-px flex-1 bg-ink/15" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="field-label">
            <span className="text-copper">01 —</span> Email
          </label>
          <input
            id="email"
            type="email"
            className="field-input"
            placeholder="you@kitchen.co.uk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password" className="field-label">
            <span className="text-copper">02 —</span> Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="field-input pr-12"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-steel-light hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-ink w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </form>

      {showForgotPasswordButton && (
        <div className="mt-5 text-center">
          <button
            onClick={handleForgotPasswordClick}
            className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-copper hover:underline"
          >
            Forgot your password?
          </button>
        </div>
      )}

      <p className="mt-8 border-t border-ink/10 pt-6 text-center text-sm text-steel">
        No account yet?{" "}
        <Link href="/sign-up" className="text-copper underline-offset-2 hover:underline">
          Create one.
        </Link>
      </p>
    </div>
  );
}

function Header({
  step,
  title,
  lede,
}: {
  step: string;
  title: React.ReactNode;
  lede: React.ReactNode;
}) {
  return (
    <header>
      <div className="eyebrow-copper">{step}</div>
      <h1 className="display mt-4 text-[clamp(2rem,4vw,3rem)] text-ink">{title}</h1>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-steel">{lede}</p>
    </header>
  );
}

function FootNav({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="mt-6 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-steel-light hover:text-copper"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to sign in
    </button>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="font-mono text-sm text-steel-light">Loading…</div>}>
      <SignInContent />
    </Suspense>
  );
}
