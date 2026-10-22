"use client";

import Link from "next/link";
import { skillCategories } from "@/lib/skillCategories";

export default function SkillCategoryGrid({ onSelect, selectedId = null }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skillCategories.map((category) => {
        const isSelected = selectedId === category.id;

        const className = `w-full cursor-pointer rounded-2xl border p-5 text-right transition ${
          isSelected
            ? "border-orange-500 bg-orange-500/10"
            : "border-white/10 bg-zinc-900 hover:border-orange-500/40"
        }`;

        const content = (
          <>
            <div className="text-3xl">{category.icon}</div>

            <h3 className="mt-4 text-xl font-bold">{category.name}</h3>

            <p className="mt-2 text-sm text-zinc-400">{category.description}</p>
          </>
        );

        if (onSelect) {
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category)}
              className={className}
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={category.id}
            href={`/play?category=${category.id}`}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
