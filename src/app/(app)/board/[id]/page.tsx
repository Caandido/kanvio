import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoard } from "@/services/board.service";
import { deleteBoardAction } from "@/features/boards/actions";
import { KanbanBoard } from "@/features/kanban/KanbanBoard";
import { requireUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// Em Next.js 16, `params` é assíncrono.
export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const board = await getBoard(id, userId);

  if (!board) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
            aria-label="Voltar"
          >
            ←
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{board.title}</h1>
        </div>

        {/* Excluir quadro (soft delete) via Server Action. */}
        <form action={deleteBoardAction.bind(null, board.id)}>
          <button
            type="submit"
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:border-red-400 hover:text-red-500"
          >
            Excluir quadro
          </button>
        </form>
      </div>

      <KanbanBoard board={board} />
    </div>
  );
}
