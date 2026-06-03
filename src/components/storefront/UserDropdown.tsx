"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useRef } from "react";

interface iAppProps {
  email: string;
  name: string;
  userImage: string;
  isAdmin?: boolean;
  isInDashboard?: boolean;
}

// Helper to get a colorful icon from email
const getColorfulIcon = (email: string) => `https://avatar.vercel.sh/${encodeURIComponent(email)}?size=128&colors=FFB300,FF7043,AB47BC,29B6F6,66BB6A,FFCA28,8D6E63,789262`;

export function UserDropdown({
  email,
  name,
  userImage,
  isAdmin = false,
  isInDashboard = false,
}: iAppProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    try {
              await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              toast.success("Signed out successfully");
              // Signal other components that auth state changed
              localStorage.setItem('auth-changed', Date.now().toString());
              // Force a hard refresh to clear all state
              window.location.href = "/";
            },
        },
      });
    } catch (error) {
      toast.error("Failed to sign out");
      console.error(error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Upload to Uploadthing (implement the API call as needed)
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload avatar");
      // Update user profile image (call your user update API)
      await fetch("/api/user/update-profile-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data.url }),
      });
      toast.success("Profile image updated!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update avatar");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userImage ?? getColorfulIcon(email)} alt="User Image" />
            <AvatarFallback>{name.slice(0, 3)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{name}</p>
          <p className="text-xs leading-none text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Remove file input and Change Avatar menu item from dropdown */}
        {/* Add a DropdownMenuItem that links to /profile, labeled 'Profile' */}
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          Profile
        </DropdownMenuItem>

        {isAdmin && !isInDashboard && (
          <>
            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {isAdmin && isInDashboard && (
          <>
            <DropdownMenuItem onClick={() => router.push("/")}>
              Back to Store
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {!isInDashboard && (
          <DropdownMenuItem onClick={() => router.push("/my-orders")}>
            My Orders
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
