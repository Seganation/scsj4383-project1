"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { magicLink } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, Loader2, ArrowUpRight } from "lucide-react";

function MagicLinkVerifyContent() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verify = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          setStatus("error");
          setErrorMessage("Missing token");
          return;
        }
        const result = await magicLink.verify({ query: { token } });
        if (result.error) {
          setStatus("error");
          setErrorMessage(result.error.message || "Verification failed");
          toast.error("Verification failed");
          return;
        }
        setStatus("success");
        toast.success("Signed in");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      } catch {
        setStatus("error");
        setErrorMessage("Unexpected error");
      }
    };
    verify();
  }, [searchParams, router]);

  return (
    <div>
      <div className="eyebrow-copper">§ Magic link</div>
      <h1 className="display mt-4 text-[clamp(2rem,4vw,3rem)] text-ink">
        {status === "verifying" && "Verifying…"}
        {status === "success" && (
          <>
            Welcome <span className="italic text-copper">back.</span>
          </>
        )}
        {status === "error" && (
          <>
            Link <span className="italic text-copper">rejected.</span>
          </>
        )}
      </h1>
      <p className="mt-4 text-[0.95rem] text-steel">
        {status === "verifying" && "Checking your link with the access server."}
        {status === "success" && "You're signed in. Taking you to the dashboard."}
        {status === "error" && (errorMessage || "The link expired or was already used.")}
      </p>

      <div className="mt-8 border border-ink/15 bg-paper-dim p-6">
        <div className="flex items-center gap-4">
          <span
            className={`flex h-12 w-12 items-center justify-center border ${
              status === "verifying"
                ? "border-ink bg-ink text-paper"
                : status === "success"
                  ? "border-copper bg-copper text-paper"
                  : "border-destructive bg-destructive/15 text-destructive"
            }`}
          >
            {status === "verifying" && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === "success" && <CheckCircle className="h-5 w-5" />}
            {status === "error" && <XCircle className="h-5 w-5" />}
          </span>
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-steel">
            {status === "verifying" && "Token in transit"}
            {status === "success" && "Token accepted · session open"}
            {status === "error" && "Token rejected"}
          </div>
        </div>
      </div>

      {status === "error" && (
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => router.push("/auth/email-auth")}
            className="btn-ink w-full"
          >
            Request new magic link
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push("/")}
            className="btn-ghost w-full border-ink/25"
          >
            Back to home
          </button>
        </div>
      )}

      {status === "success" && (
        <button
          onClick={() => router.push("/dashboard")}
          className="btn-ink mt-6 w-full"
        >
          Go to dashboard now
          <ArrowUpRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function MagicLinkVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-steel">
          <Loader2 className="h-4 w-4 animate-spin text-copper" />
          Loading…
        </div>
      }
    >
      <MagicLinkVerifyContent />
    </Suspense>
  );
}
