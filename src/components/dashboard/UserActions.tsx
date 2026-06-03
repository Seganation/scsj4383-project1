"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, UserX, UserCheck, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";

interface UserActionsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    banned: boolean;
    banReason?: string | null;
    banExpires?: Date | null;
  };
}

export function UserActions({ user }: UserActionsProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is trying to suspend themselves
  const isCurrentUser = session?.user?.id === user.id;

  const handleSuspend = async () => {
    if (isCurrentUser) {
      alert("You cannot suspend your own account");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "Suspended by administrator",
          expiresIn: 60 * 60 * 24 * 7, // 7 days
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to suspend user");
      }

      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error suspending user:", error);
      alert(error instanceof Error ? error.message : "Failed to suspend user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/suspend`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unsuspend user");
      }

      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error unsuspending user:", error);
      alert(error instanceof Error ? error.message : "Failed to unsuspend user");
    } finally {
      setIsLoading(false);
    }
  };

  const formatBanExpiry = (banExpires: Date | null) => {
    if (!banExpires) return "Permanent";
    const now = new Date();
    const expiry = new Date(banExpires);
    if (expiry <= now) return "Expired";
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} remaining`;
  };

  return (
    <div className="flex items-center gap-2">
      {user.banned && (
        <Badge variant="destructive" className="text-xs">
          Suspended
        </Badge>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>View profile</DropdownMenuItem>
          <DropdownMenuItem>View orders</DropdownMenuItem>
          
          {user.banned ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleUnsuspend}
                disabled={isLoading}
                className="text-green-600"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Unsuspend user
              </DropdownMenuItem>
              {user.banReason && (
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Reason: {user.banReason}
                </DropdownMenuItem>
              )}
              {user.banExpires && (
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  Expires: {formatBanExpiry(user.banExpires)}
                </DropdownMenuItem>
              )}
            </>
          ) : (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSuspend}
                disabled={isLoading || isCurrentUser}
                className={isCurrentUser ? "text-muted-foreground" : "text-red-600"}
              >
                <UserX className="mr-2 h-4 w-4" />
                {isCurrentUser ? "Cannot suspend yourself" : "Suspend user"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 