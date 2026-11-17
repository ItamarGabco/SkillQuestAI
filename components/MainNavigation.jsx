"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "בית", icon: "🏠" },
  { href: "/play", label: "שחק", icon: "⚔️" },
  { href: "/skills", label: "הסקילס שלי", icon: "🏆" },
  { href: "/assistant", label: "עוזר AI", icon: "🤖" },
];

export default function MainNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ניווט ראשי"
      className="w-full rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-xl backdrop-blur"
    >
      <div className="grid grid-cols-4 gap-2">
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-center font-bold transition sm:flex-row sm:gap-3 ${
                isActive
                  ? "bg-orange-500 text-zinc-950"
                  : "bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm sm:text-base">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
