import { notFound } from "next/navigation";

import { expressApi } from "@/lib/expressApi";

export default async function AdminPage() {
  const result = await expressApi("/api/admin/overview");

  if (result.status === 403) {
    notFound();
  }

  if (result.error) {
    return (
      <p role="alert" className="rounded-xl bg-red-500/10 p-5 text-red-400">
        {result.error}
      </p>
    );
  }

  const { stats, users } = result.data;

  const cards = [
    { label: "משתמשים רשומים", value: stats.usersCount },
    { label: "מיומנויות במערכת", value: stats.skillsCount },
    {
      label: "שאלונים שהושלמו",
      value: stats.completedQuestsCount,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="font-semibold text-orange-400">SKILLQUEST AI ADMIN</p>

        <h1 className="mt-2 text-3xl font-bold">ניהול מערכת</h1>

        <p className="mt-2 text-zinc-400">נתוני המערכת וסקירת משתמשים.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-zinc-900 p-5"
          >
            <p className="text-sm text-zinc-400">{card.label}</p>

            <p className="mt-3 text-3xl font-bold text-orange-400">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
        <h2 className="text-xl font-bold">משתמשים אחרונים</h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] text-right text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="p-3">שם</th>
                <th className="p-3">אימייל</th>
                <th className="p-3">הרשאה</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    {user.role === "admin" ? "מנהל" : "משתמש"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          מוצגים עד 20 המשתמשים האחרונים.
        </p>
      </section>
    </div>
  );
}
