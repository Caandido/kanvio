"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CardDTO } from "@/types";
import { cn, formatShortDate } from "@/lib/utils";
import { deleteCardAction } from "./actions";
import { CardModal } from "./CardModal";

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
  const [open, setOpen] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm("Excluir este cartão?")) {
      await deleteCardAction(boardId, card.id);
    }
  }

  const cover = card.attachments.find((a) => a.type.startsWith("image/"));
  const fileCount = card.attachments.length;

  return (
    <>
      <div
        onClick={() => !overlay && setOpen(true)}
        className={cn(
          "group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-sm shadow-sm transition hover:border-[var(--primary)]/50 hover:shadow-md",
          !overlay && "cursor-pointer",
          overlay && "rotate-2 cursor-grabbing shadow-xl ring-2 ring-[var(--primary)]/40"
        )}
      >
        {/* Capa: primeira imagem anexada */}
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt=""
            className="h-28 w-full border-b border-[var(--border)] object-cover"
          />
        )}

        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <span className="break-words leading-snug">{card.title}</span>
            {!overlay && (
              <button
                onClick={handleDelete}
                className="shrink-0 text-xs text-[var(--muted)] opacity-0 transition hover:text-[var(--foreground)] group-hover:opacity-100"
                aria-label="Excluir cartão"
              >
                ✕
              </button>
            )}
          </div>

          {card.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
              {card.description.replace(/[#*_`>[\]()]/g, "")}
            </p>
          )}

          {/* Selos: prazo, descrição, anexos */}
          {(card.dueDate || card.description || fileCount > 0) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {card.dueDate && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                  📅 {formatShortDate(card.dueDate)}
                </span>
              )}
              {card.description && (
                <span className="rounded-md bg-[var(--surface)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                  ☰
                </span>
              )}
              {fileCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                  📎 {fileCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {open && (
        <CardModal card={card} boardId={boardId} onClose={() => setOpen(false)} />
      )}
    </>
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
      className={cn("touch-none", isDragging && "dragging")}
    >
      <CardItem card={card} boardId={boardId} />
    </div>
  );
}
