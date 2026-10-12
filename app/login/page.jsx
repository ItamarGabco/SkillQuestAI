import AuthSwitcher from "@/components/AuthSwitcher";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  const initialMode = params.mode === "register" ? "register" : "login";

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <p className="mb-2 font-semibold text-orange-500">SKILLQUEST AI</p>

          <h1 className="text-4xl font-bold">
            {initialMode === "login" ? "חוזרים למסע" : "מתחילים את המסע"}
          </h1>

          <p className="mt-3 text-zinc-400">
            התחבר או צור חשבון כדי לבנות, לתרגל ולהציג את הסקילס שלך.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <AuthSwitcher initialMode={initialMode} />
        </div>
      </div>
    </main>
  );
}
