import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoard } from "@/services/board.service";
import { deleteBoardAction } from "@/features/boards/actions";
import { KanbanBoard } from "@/features/kanban/KanbanBoard";

// Em Next.js 15, `params` é assíncrono.
export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const board = await getBoard(id);

  if (!board) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ← Voltar
          </Link>
          <h1 className="text-xl font-bold">{board.title}</h1>
        </div>

        {/* Excluir quadro (soft delete) via Server Action. */}
        <form action={deleteBoardAction.bind(null, board.id)}>
          <button
            type="submit"
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-red-400 hover:text-red-500"
          >
            Excluir quadro
          </button>
        </form>
      </div>

      <KanbanBoard board={board} />
    </div>
  );
}
