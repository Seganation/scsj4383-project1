import Link from "next/link";
import { NavbarLinks } from "./NavbarLinks";
import { UserDropdown } from "./UserDropdown";
import { Button } from "@/components/ui/button";
import { CartButton } from "./CartButton";
import { SearchInput } from "./SearchInput";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  return (
    <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div>
              <h1 className="text-2xl font-extrabold">
                <span className="text-primary">A</span>RCH
                <span className="text-primary">C</span>OOL
              </h1>
              <span className="text-xs text-gray-400 tracking-wide">
                Your Kitchen Partner
              </span>
            </div>
          </Link>
          <NavbarLinks />
        </div>

        {/* Search Bar - Center on larger screens */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <SearchInput />
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <CartButton userId={user.id} />

              <UserDropdown
                email={user.email}
                name={user.name}
                userImage={
                  user.image ?? `https://avatar.vercel.sh/${user.name}`
                }
              />
            </>
          ) : (
            <>
              <CartButton />
              <div className="hidden md:flex md:flex-1 md:items-center md:justify-end md:space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <span className="h-6 w-px bg-gray-200"></span>
                <Button variant="ghost" asChild>
                  <Link href="/sign-up">Create Account</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden mt-4">
        <SearchInput />
      </div>
    </nav>
  );
}
