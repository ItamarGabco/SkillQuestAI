import { logoutAction } from "@/actions/auth";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="min-h-14 cursor-pointer rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-orange-500/40 hover:text-orange-400"
      >
        התנתקות
      </button>
    </form>
  );
}
