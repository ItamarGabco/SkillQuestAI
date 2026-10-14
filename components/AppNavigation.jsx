"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

const tabs = [
  { href: "/", label: "בית", icon: "🏠" },
  { href: "/play", label: "שחק", icon: "⚔️" },
  { href: "/skills", label: "הסקילס שלי", icon: "🏅" },
  { href: "/progress", label: "ההתקדמות שלי", icon: "📈" },
  { href: "/assistant", label: "מאמן AI", icon: "🧠" },
];

export default function AppNavigation() {
  const pathname = usePathname();

  return (
    <header className="border-b border-orange-500/15 bg-zinc-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-black tracking-wide text-orange-400">
          ⚡ SKILLQUEST AI
        </Link>
        <LogoutButton />
      </div>
      <nav aria-label="ניווט ראשי" className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                active
                  ? "border-orange-500 bg-orange-500 text-black"
                  : "border-white/10 bg-zinc-900 text-zinc-300 hover:border-orange-500/40 hover:text-white"
              }`}
            >
              <span aria-hidden="true" className="ml-1">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
