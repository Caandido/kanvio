import Link from "next/link";
import { requireUserId, getCurrentUser } from "@/lib/session";
import { logoutAction } from "@/features/auth/actions";

// Layout principal do app: exige login e mostra o header com a conta do usuário.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protege todas as rotas internas: sem sessão → /login.
  await requireUserId();
  const user = await getCurrentUser();

  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="app-bg min-h-screen">
      <header className="glass sticky top-0 z-20 border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-sm text-white shadow-md shadow-indigo-500/30">
              K
            </span>
            Kanvio
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-2)] text-sm font-semibold text-[var(--foreground)]">
                {initial}
              </span>
              <span className="text-sm text-[var(--muted)]">{user?.email}</span>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
