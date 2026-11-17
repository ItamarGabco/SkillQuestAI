import MainNavigation from "@/components/MainNavigation";
import LogoutButton from "@/components/LogoutButton";

export default function AppShell({ children }) {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="sticky top-0 z-40 mb-8 flex flex-col gap-2 rounded-2xl bg-zinc-950/95 py-2 backdrop-blur sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <MainNavigation />
          </div>

          <div className="self-end sm:self-auto">
            <LogoutButton />
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
