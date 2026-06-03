"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowUpRight } from "lucide-react";
import { emailOtp, signIn } from "@/app/lib/auth-client";
import { FcGoogle } from "react-icons/fc";

export default function SignUpPage() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [emailStatus, setEmailStatus] = useState<"unknown" | "user" | "guest" | "new">("unknown");
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const checkEmailStatus = async (emailToCheck: string) => {
    if (!emailToCheck) return;
    setEmailCheckLoading(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToCheck }),
      });
      const data = await res.json();
      setEmailStatus(data.status || "unknown");
      if (data.status === "user") toast.error("You already have an account. Please sign in.");
      else if (data.status === "guest") toast.success("We found previous orders with this email.");
    } catch {
      setEmailStatus("unknown");
      toast.error("Failed to check email status.");
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setIsLoading(true);
    try {
      const { error } = await emailOtp.sendVerificationOtp({ email, type: "sign-in" });
      if (error) throw new Error(error.message || "Failed to send OTP");
      setStep(1);
      toast.success("OTP sent.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");
    setIsLoading(true);
    try {
      const { error } = await signIn.emailOtp({ email, otp });
      if (error) throw new Error(error.message || "Invalid OTP");
      setStep(2);
      toast.success("Verified. Set a password.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return toast.error("Please fill in required fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, firstName, lastName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set password");
      if (data.linkedOrders && data.linkedOrders > 0) {
        toast.success(`Account created. ${data.linkedOrders} order${data.linkedOrders > 1 ? "s" : ""} linked.`);
      } else {
        toast.success("Account created. Please sign in.");
      }
      router.push("/sign-in");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({ provider: "google" });
    } catch (err: any) {
      toast.error(err.message || "Failed to sign up with Google.");
      setIsGoogleLoading(false);
    }
  };

  const stepCodes = ["01", "02", "03"];

  return (
    <div>
      <header>
        <div className="eyebrow-copper">§ 00 — Create account</div>
        <h1 className="display mt-4 text-[clamp(2rem,4vw,3rem)] text-ink">
          Set up <span className="italic text-copper">your door.</span>
        </h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-steel">
          Guest checkout stays on the table. Sign up if you want one place for
          every order, invoice and spec.
        </p>

        {/* Step indicator */}
        <ol className="mt-6 flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.16em]">
          {stepCodes.map((code, i) => (
            <li key={code} className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 items-center justify-center border ${
                  i === step
                    ? "border-copper bg-copper text-paper"
                    : i < step
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/20 text-steel-light"
                }`}
              >
                {code}
              </span>
              {i < stepCodes.length - 1 && (
                <span
                  className={`h-px w-6 ${i < step ? "bg-copper" : "bg-ink/15"}`}
                />
              )}
            </li>
          ))}
        </ol>
      </header>

      <div className="mt-8">
        {step === 0 && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading || isLoading}
              className="btn-ghost w-full border-ink/25 bg-paper"
            >
              {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FcGoogle className="h-5 w-5" />}
              Continue with Google
            </button>

            <div className="my-7 flex items-center gap-3">
              <span className="h-px flex-1 bg-ink/15" />
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-steel-light">
                or email
              </span>
              <span className="h-px flex-1 bg-ink/15" />
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailStatus("unknown");
                  }}
                  onBlur={() => checkEmailStatus(email)}
                  required
                  disabled={isLoading || emailCheckLoading}
                />
                {emailStatus === "user" && (
                  <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-destructive">
                    Account exists.{" "}
                    <Link href="/sign-in" className="underline text-copper">Sign in</Link>.
                  </p>
                )}
                {emailStatus === "guest" && (
                  <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-copper">
                    Previous guest orders found — they'll be linked.
                  </p>
                )}
                {emailStatus === "new" && (
                  <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-steel-light">
                    Email available.
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="btn-ink w-full"
                disabled={isLoading || emailCheckLoading || emailStatus === "user"}
              >
                {(isLoading || emailCheckLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
                Send OTP
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          </>
        )}

        {step === 1 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label htmlFor="otp" className="field-label">
                <span className="text-copper">02 —</span> Verification code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                className="field-input tracking-[0.4em]"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-steel-light">
                Sent to {email}
              </p>
            </div>
            <button type="submit" className="btn-ink w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="field-label">First name</label>
                <input
                  id="firstName"
                  type="text"
                  className="field-input"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="field-label">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  className="field-input"
                  placeholder="Chef"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="field-label">
                <span className="text-copper">03 —</span> Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="field-input pr-12"
                  placeholder="Min 8 characters"
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
            <div>
              <label htmlFor="confirmPassword" className="field-label">Confirm password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
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
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-ink w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Finish registration
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      <p className="mt-8 border-t border-ink/10 pt-6 text-center text-sm text-steel">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-copper underline-offset-2 hover:underline">
          Sign in.
        </Link>
      </p>
    </div>
  );
}
