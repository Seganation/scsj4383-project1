"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { magicLink, signIn } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import { CheckCircle, Mail } from "lucide-react";

export function MagicLinkAuth() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkSent, setIsLinkSent] = useState(false);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.magicLink({
        email,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to send magic link");
        return;
      }

      toast.success("Magic link sent to your email!");
      setIsLinkSent(true);
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAnotherEmail = () => {
    setIsLinkSent(false);
    setEmail("");
  };

  if (isLinkSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a magic link to{" "}
            <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Click the link in your email to sign in instantly. The link will
              expire in 10 minutes.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Mail className="w-4 h-4" />
              <span>Check your inbox and spam folder</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsLoading(true);
                signIn
                  .magicLink({
                    email,
                    callbackURL: "/dashboard",
                  })
                  .then((result) => {
                    if (result.error) {
                      toast.error(
                        result.error.message || "Failed to resend magic link"
                      );
                    } else {
                      toast.success("Magic link sent again!");
                    }
                  })
                  .catch(() => {
                    toast.error("Failed to resend magic link");
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              }}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Sending..." : "Resend Magic Link"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleTryAnotherEmail}
              className="w-full"
            >
              Try Another Email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Sign In with Magic Link</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a secure link to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendMagicLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending Magic Link..." : "Send Magic Link"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
