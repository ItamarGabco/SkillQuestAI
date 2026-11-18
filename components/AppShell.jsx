import MainNavigation from "@/components/MainNavigation";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default function AppShell({ children, isAdmin = false }) {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="sticky top-0 z-40 mb-8 flex flex-col gap-2 rounded-2xl bg-zinc-950/95 py-2 backdrop-blur sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <MainNavigation />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-xl border border-orange-500/40 px-4 py-3 text-sm font-bold text-orange-400 hover:bg-orange-500/10"
              >
                ניהול מערכת
              </Link>
            )}

            <LogoutButton />
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
