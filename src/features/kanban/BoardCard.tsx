"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CardDTO } from "@/types";
import { cn, formatShortDate } from "@/lib/utils";
import { deleteCardAction, updateCardAction } from "./actions";

/** Conteúdo visual do cartão (reutilizado no DragOverlay). */
export function CardItem({
  card,
  boardId,
  overlay = false,
}: {
  card: CardDTO;
  boardId: string;
  overlay?: boolean;
}) {
  async function handleEdit() {
    const title = window.prompt("Editar título:", card.title);
    if (title === null) return;
    const description = window.prompt(
      "Descrição (opcional):",
      card.description ?? ""
    );
    await updateCardAction(boardId, card.id, {
      title: title.trim() || card.title,
      description: description?.trim() || null,
    });
  }

  async function handleDelete() {
    if (window.confirm("Excluir este cartão?")) {
      await deleteCardAction(boardId, card.id);
    }
  }

  return (
    <div
      className={cn(
        "group rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm shadow-sm transition hover:border-[var(--primary)]/50 hover:shadow-md",
        overlay && "rotate-2 cursor-grabbing shadow-xl ring-2 ring-[var(--primary)]/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="break-words leading-snug">{card.title}</span>
        {!overlay && (
          <div className="flex shrink-0 gap-1.5 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={handleEdit}
              className="text-xs text-[var(--muted)] transition hover:text-[var(--primary)]"
              aria-label="Editar cartão"
            >
              ✎
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
              aria-label="Excluir cartão"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {card.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
          {card.description}
        </p>
      )}

      {card.dueDate && (
        <span className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-[var(--surface)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
          📅 {formatShortDate(card.dueDate)}
        </span>
      )}
    </div>
  );
}

/** Wrapper que torna o cartão arrastável e ordenável. */
export function SortableCard({
  card,
  boardId,
}: {
  card: CardDTO;
  boardId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("cursor-grab touch-none", isDragging && "dragging")}
    >
      <CardItem card={card} boardId={boardId} />
    </div>
  );
}
