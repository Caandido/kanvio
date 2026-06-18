import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">404 — Não encontrado</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Este quadro não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
