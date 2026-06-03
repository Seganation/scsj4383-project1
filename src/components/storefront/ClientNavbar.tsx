"use client";

import Link from "next/link";
import Image from "next/image";
import { NavbarLinks, navbarLinks } from "./NavbarLinks";
import { UserDropdown } from "./UserDropdown";
import { CartButton } from "./CartButton";
import { MiniSearchInput } from "./MiniSearchInput";
import { useSession } from "@/lib/auth-client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Search, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { DashboardNavigation } from "@/components/dashboard/DasboardNavigation";
import { AdminNotifications } from "@/components/dashboard/AdminNotifications";

export function ClientNavbar() {
  const { data: session, isPending, error, refetch } = useSession();
  const { isAdmin } = useAdminCheck();
  const pathname = usePathname();
  const router = useRouter();
  const user = session?.user;
  const isInDashboard = pathname?.startsWith("/dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleFocus = () => refetch?.();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out");
            router.push("/");
            router.refresh();
            setMobileOpen(false);
          },
        },
      });
    } catch (err) {
      toast.error("Failed to sign out");
      console.error(err);
    }
  };

  if (error) console.error("Session error:", error);

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm">
      {/* Utility strip */}
      <div className="hidden bg-ink text-paper md:block">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-paper/70">
            <span className="text-copper">●</span>
            <span>Commercial-grade kitchen equipment · Est. 2012</span>
          </div>
          <div className="flex items-center gap-5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-paper/70">
            <a href="tel:+15555ARCHCOOL" className="hover:text-copper">
              +1 (555) ARCH-COOL
            </a>
            <span className="h-3 w-px bg-paper/20" />
            <span>Free delivery on orders over £500</span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-ink/10 bg-paper">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 lg:h-20 lg:px-10">
          {/* Left: logo lockup */}
          <Link
            href={isInDashboard ? "/dashboard" : "/"}
            className="group flex items-center gap-3"
            aria-label="ArchCool — home"
          >
            <Image
              src="/logo.png"
              alt="ArchCool Equipment"
              width={140}
              height={56}
              priority
              className="h-10 w-auto md:h-11 transition-opacity group-hover:opacity-85"
            />
            <span className="hidden flex-col leading-none md:flex">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-steel-light">
                Commercial kitchen
              </span>
              <span className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-copper">
                Since 2012
              </span>
            </span>
          </Link>

          {/* Center: primary nav */}
          <nav className="hidden lg:flex">
            {!isInDashboard && <NavbarLinks mode="desktop" />}
            {isInDashboard && isAdmin && (
              <div className="flex items-center gap-6">
                <DashboardNavigation />
                <Link
                  href="/"
                  className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-steel hover:text-copper"
                >
                  ← Back to store
                </Link>
              </div>
            )}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            {!isInDashboard && (
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Open search"
                className="hidden h-10 w-10 items-center justify-center border border-transparent text-ink hover:border-ink lg:flex"
              >
                <Search className="h-4 w-4" />
              </button>
            )}

            {isInDashboard && isAdmin && <AdminNotifications />}

            {!(isInDashboard && isAdmin) && (
              <CartButton userId={user?.id} />
            )}

            {!user && !isPending && (
              <div className="hidden items-center md:flex">
                <Link
                  href="/sign-in"
                  className="h-10 border border-transparent px-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink hover:text-copper flex items-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="ml-2 inline-flex h-10 items-center border border-ink bg-ink px-4 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-paper transition-colors hover:bg-copper hover:border-copper"
                >
                  Create account
                </Link>
              </div>
            )}

            {user && !isPending && (
              <UserDropdown
                email={user.email as string}
                name={user.name as string}
                userImage={
                  user.image ?? `https://avatar.vercel.sh/${user.name}`
                }
                isAdmin={isAdmin}
                isInDashboard={isInDashboard}
              />
            )}

            {/* Mobile / tablet burger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="ml-1 flex h-10 w-10 items-center justify-center border border-transparent hover:border-ink lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop expandable search */}
        {searchOpen && !isInDashboard && (
          <div className="border-t border-ink/10 bg-paper-dim">
            <div className="mx-auto max-w-[1440px] px-5 py-4 lg:px-10">
              <MiniSearchInput />
            </div>
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[min(84vw,360px)] overflow-y-auto bg-paper text-ink shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between border-b border-ink/10 bg-ink px-5 py-4 text-paper">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ArchCool Equipment"
              width={130}
              height={52}
              className="h-10 w-auto"
            />
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center border border-paper/30 hover:bg-paper/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isInDashboard && (
          <div className="border-b border-ink/10 px-5 py-4">
            <MiniSearchInput />
          </div>
        )}

        <nav className="px-5 py-6">
          <div className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-steel-light">
            § Index
          </div>
          {isInDashboard && isAdmin ? (
            <div className="space-y-2">
              <DashboardNavigation onNavigate={() => setMobileOpen(false)} />
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="block border-t border-ink/10 pt-3 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-copper"
              >
                ← Back to store
              </Link>
            </div>
          ) : (
            <NavbarLinks
              mode="mobile"
              onNavigate={() => setMobileOpen(false)}
            />
          )}
        </nav>

        <div className="border-t border-ink/10 px-5 py-6">
          {isPending ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse bg-bone" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 animate-pulse bg-bone" />
                <div className="h-3 w-1/2 animate-pulse bg-bone" />
              </div>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-ink bg-ink font-mono text-[0.8rem] uppercase text-paper">
                  {(user.name || user.email).charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-base font-semibold text-ink">
                    {user.name || "Signed in"}
                  </div>
                  <div className="truncate font-mono text-[0.7rem] text-steel-light">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <MobileLink href="/profile" onClick={() => setMobileOpen(false)}>
                  Profile
                </MobileLink>
                {isAdmin && !isInDashboard && (
                  <MobileLink
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </MobileLink>
                )}
                {!isInDashboard && (
                  <MobileLink
                    href="/my-orders"
                    onClick={() => setMobileOpen(false)}
                  >
                    My orders
                  </MobileLink>
                )}
                <button
                  onClick={handleSignOut}
                  className="h-11 border border-ink/20 bg-paper px-4 text-left font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink hover:border-ink"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 items-center justify-center border border-ink bg-ink px-4 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-paper hover:bg-copper hover:border-copper"
              >
                <User className="mr-2 h-4 w-4" />
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 items-center justify-center border border-ink/40 px-4 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink hover:border-ink"
              >
                Create account
              </Link>
            </div>
          )}
        </div>

        <div className="border-t border-ink/10 px-5 py-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-steel-light">
          +1 (555) ARCH-COOL
        </div>
      </aside>
    </header>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="h-11 inline-flex items-center border border-ink/20 bg-paper px-4 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink hover:border-ink"
    >
      {children}
    </Link>
  );
}
