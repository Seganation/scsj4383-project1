"use client";

import { useState } from "react";
import Link from "next/link";
import { OTPForm } from "@/components/auth/OTPForm";
import { MagicLinkAuth } from "@/components/auth/MagicLinkAuth";
import { emailOtp } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import { ArrowUpRight, Loader2 } from "lucide-react";

export default function EmailAuthPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [tab, setTab] = useState<"otp" | "magic">("otp");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Invalid email");
    setIsLoading(true);
    try {
      const result = await emailOtp.sendVerificationOtp({ email, type: "sign-in" });
      if (result.error) {
        toast.error(result.error.message || "Failed to send OTP");
        return;
      }
      toast.success("OTP sent.");
      setShowOTPForm(true);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  if (showOTPForm) {
    return <OTPForm email={email} mode={authMode} onBack={() => { setShowOTPForm(false); setEmail(""); }} />;
  }

  return (
    <div>
      <header>
        <div className="eyebrow-copper">§ Passwordless</div>
        <h1 className="display mt-4 text-[clamp(2rem,4vw,3rem)] text-ink">
          Sign in with <span className="italic text-copper">email.</span>
        </h1>
        <p className="mt-4 text-[0.95rem] text-steel">
          Choose a code or a magic link. Same door, either way.
        </p>
      </header>

      <div className="mt-8 flex items-center gap-1 border-b border-ink/10">
        <TabBtn active={tab === "otp"} onClick={() => setTab("otp")}>
          Email OTP
        </TabBtn>
        <TabBtn active={tab === "magic"} onClick={() => setTab("magic")}>
          Magic link
        </TabBtn>
      </div>

      <div className="mt-8">
        {tab === "otp" ? (
          <form onSubmit={handleSendOTP} className="space-y-5">
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
                autoFocus
              />
            </div>
            <fieldset>
              <div className="field-label">Account type</div>
              <div className="mt-3 flex gap-2">
                <RadioChip
                  checked={authMode === "sign-in"}
                  onClick={() => setAuthMode("sign-in")}
                >
                  Existing user
                </RadioChip>
                <RadioChip
                  checked={authMode === "sign-up"}
                  onClick={() => setAuthMode("sign-up")}
                >
                  New user
                </RadioChip>
              </div>
            </fieldset>
            <button type="submit" className="btn-ink w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send OTP code
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <MagicLinkAuth />
        )}
      </div>

      <footer className="mt-10 border-t border-ink/10 pt-6 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-steel-light">
        Trouble signing in?{" "}
        <Link href="/contact" className="text-copper hover:underline">
          Contact support
        </Link>
      </footer>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative -mb-px h-10 border-b-2 px-4 font-mono text-[0.75rem] uppercase tracking-[0.14em] transition-colors ${
        active
          ? "border-copper text-ink"
          : "border-transparent text-steel hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function RadioChip({
  checked,
  onClick,
  children,
}: {
  checked: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 border px-4 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors ${
        checked
          ? "border-copper bg-copper text-paper"
          : "border-ink/25 text-ink hover:border-ink"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${checked ? "bg-paper" : "bg-ink/30"}`}
      />
      {children}
    </button>
  );
}
