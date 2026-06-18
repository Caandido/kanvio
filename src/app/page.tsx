import Link from "next/link";
import { listBoards } from "@/services/board.service";
import { createBoardAction } from "@/features/boards/actions";

// Renderiza sob demanda (não em build): a home consulta o banco, então não
// deve ser pré-renderizada estaticamente no deploy.
export const dynamic = "force-dynamic";

// Server Component: busca os dados direto do serviço (sem fetch HTTP).
export default async function HomePage() {
  const boards = await listBoards();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Seus quadros</h1>
        <p className="text-sm text-[var(--muted)]">
          Organize tarefas em colunas e arraste cartões entre elas.
        </p>
      </section>

      {/* Formulário de criação: chama a Server Action diretamente. */}
      <form action={createBoardAction} className="flex gap-2">
        <input
          name="title"
          placeholder="Nome do novo quadro…"
          required
          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
        />
        <button
          type="submit"
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Criar quadro
        </button>
      </form>

      {boards.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Nenhum quadro ainda. Crie o primeiro acima 👆
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                href={`/board/${board.id}`}
                className="block rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--primary)] hover:shadow-sm"
              >
                <span className="font-medium">{board.title}</span>
                <span className="mt-1 block text-xs text-[var(--muted)]">
                  {board._count.columns} coluna(s)
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
