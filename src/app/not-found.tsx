import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl text-white shadow-lg shadow-indigo-500/30">
        ✦
      </div>
      <h1 className="text-2xl font-bold tracking-tight">404 — Não encontrado</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Este quadro não existe, foi removido ou não pertence à sua conta.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-violet-400"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
