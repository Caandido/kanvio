import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="ink-mark mb-5 grid h-14 w-14 place-items-center rounded-2xl text-2xl shadow-[var(--shadow)]">
        ✦
      </div>
      <h1 className="text-2xl font-bold tracking-tight">404 — Não encontrado</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Este quadro não existe, foi removido ou não pertence à sua conta.
      </p>
      <Link
        href="/"
        className="btn-primary mt-6 inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
