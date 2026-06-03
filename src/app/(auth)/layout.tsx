import Link from "next/link";
import Image from "next/image";
import { type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        {/* Left — editorial brand plate */}
        <aside className="relative hidden overflow-hidden border-r border-paper/10 bg-ink lg:flex">
          <div className="bg-grain absolute inset-0 opacity-60" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--paper) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--paper) / 0.08) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 lg:p-14">
            <header className="flex items-start justify-between">
              <Link href="/" className="group inline-flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="ArchCool Equipment"
                  width={200}
                  height={80}
                  priority
                  className="h-14 w-auto transition-opacity group-hover:opacity-85"
                />
              </Link>
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-paper/50">
                Est. 2012
              </div>
            </header>

            <div className="max-w-xl">
              <div className="eyebrow-copper">§ The access door</div>
              <h1 className="display mt-5 text-[clamp(2.5rem,5vw,4.5rem)] text-paper">
                Sign in to the{" "}
                <span className="italic text-copper">back-of-house.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-paper/75">
                Your order history, spec sheets, invoices and break-fix log
                — all behind one door. Guest checkout still works if you'd
                rather not sign up.
              </p>
            </div>

            <footer className="flex items-center justify-between border-t border-paper/10 pt-6">
              <div className="flex items-center gap-4 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-paper/60">
                <span className="flex h-2 w-2 items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-copper" />
                </span>
                24/7 break-fix support
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-paper/70 hover:text-copper"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to storefront
              </Link>
            </footer>
          </div>
        </aside>

        {/* Right — form */}
        <main className="flex items-center justify-center bg-paper px-6 py-12 text-ink md:px-10 lg:py-16">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-steel-light hover:text-copper lg:hidden"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to store
            </Link>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
