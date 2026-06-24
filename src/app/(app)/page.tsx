import Link from "next/link";
import { listBoards } from "@/services/board.service";
import { createBoardAction } from "@/features/boards/actions";
import { requireUserId } from "@/lib/session";

// A home consulta o banco por usuário → renderiza sob demanda (nunca em build).
export const dynamic = "force-dynamic";

// Variação sutil de opacidade na faixa monocromática do topo de cada cartão,
// dando ritmo ao grid sem sair do preto & branco.
const ACCENTS = [1, 0.7, 0.45, 0.85, 0.55, 0.32];

export default async function HomePage() {
  const userId = await requireUserId();
  const boards = await listBoards(userId);

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Seus quadros</h1>
        <p className="text-[var(--muted)]">
          Organize tarefas em colunas e arraste cartões entre elas. Tudo fica
          salvo na sua conta.
        </p>
      </section>

      {/* Criação de quadro: chama a Server Action diretamente. */}
      <form
        action={createBoardAction}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          name="title"
          placeholder="Nome do novo quadro…"
          required
          className="focus-ring h-11 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none transition placeholder:text-[var(--muted)]"
        />
        <button
          type="submit"
          className="btn-primary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
        >
          Criar quadro
        </button>
      </form>

      {boards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
          <div className="ink-mark mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl text-xl shadow-[var(--shadow)]">
            ✦
          </div>
          <p className="font-medium">Nenhum quadro ainda</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Crie o seu primeiro quadro no campo acima 👆
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board, i) => (
            <li key={board.id} className="animate-in">
              <Link
                href={`/board/${board.id}`}
                className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-[var(--primary)]"
              >
                <div
                  className="h-1 w-full bg-[var(--foreground)]"
                  style={{ opacity: ACCENTS[i % ACCENTS.length] }}
                />
                <div className="p-5">
                  <span className="block truncate font-semibold transition group-hover:text-[var(--primary)]">
                    {board.title}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    {board._count.columns}{" "}
                    {board._count.columns === 1 ? "coluna" : "colunas"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
