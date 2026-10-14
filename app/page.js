import Link from "next/link";
import { redirect } from "next/navigation";
import AppNavigation from "@/components/AppNavigation";
import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import User from "@/models/User";
import Skill from "@/models/Skill";
import QuestAttempt from "@/models/QuestAttempt";

export default async function Home() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  await connectDB();
  const [user, skillsCount, lastAttempt] = await Promise.all([
    User.findById(userId).select("name").lean(),
    Skill.countDocuments({ userId }),
    QuestAttempt.findOne({ userId }).sort({ startedAt: -1 }).lean(),
  ]);
  const recentSkill = lastAttempt
    ? await Skill.findOne({ userId, name: lastAttempt.skillName }).select("_id name").lean()
    : null;
  const continueUrl = recentSkill
    ? `/play?skillId=${recentSkill._id.toString()}`
    : "/play";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AppNavigation />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-bl from-orange-500/20 via-zinc-900 to-zinc-950 p-7 sm:p-10">
          <p className="font-bold text-orange-400">⚡ המסע שלך ממשיך</p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            {user?.name ? `שלום ${user.name}, מוכנים למשימה הבאה?` : "מוכנים למשימה הבאה?"}
          </h1>
          <p className="mt-4 max-w-xl text-zinc-300">
            כל שאלה מקרבת אותך לשליטה טובה יותר במיומנויות שחשובות לך.
            בחר אתגר חדש או המשך לתרגל משהו שכבר למדת.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={continueUrl} className="rounded-xl bg-orange-500 px-6 py-3 font-extrabold text-black transition hover:bg-orange-400">
              ⚔️ {recentSkill ? `המשך לתרגל ${recentSkill.name}` : "התחל לשחק"}
            </Link>
            <Link href="/skills" className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
              הסקילס שלי ({skillsCount})
            </Link>
          </div>
        </div>
        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">מה בא לך לעשות היום?</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { href: "/play", icon: "🎯", title: "לגלות תחום חדש", description: "בחר תחום או הוסף נושא משלך וקבל שאלות מותאמות." },
              { href: "/progress", icon: "🏆", title: "לראות כמה התקדמת", description: "עקוב אחרי המשחקים שסיימת ומה שלמדת." },
              { href: "/assistant", icon: "🧠", title: "להתייעץ עם מאמן AI", description: "יש משהו שלא הבנת? אפשר לשאול ולהמשיך ללמוד." },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/50 focus-visible:outline-2 focus-visible:outline-orange-500">
                <div className="text-3xl">{action.icon}</div>
                <h3 className="mt-4 text-xl font-bold">{action.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{action.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
