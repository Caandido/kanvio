import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

// Layout das telas de autenticação: full-screen, sem o header do app.
// Se o usuário já está logado, não faz sentido ver login/registro → manda pra home.
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="app-bg flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-xl font-bold tracking-tight"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30">
          K
        </span>
        Kanvio
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:p-8">
        {children}
      </div>

      <p className="mt-6 max-w-xs text-center text-xs text-[var(--muted)]">
        Seus quadros ficam salvos na sua conta e sincronizam entre todos os
        dispositivos.
      </p>
    </div>
  );
}
