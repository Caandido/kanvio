"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ColumnWithCards } from "@/types";
import {
  createCardAction,
  deleteColumnAction,
  renameColumnAction,
} from "./actions";
import { SortableCard } from "./BoardCard";

export function KanbanColumn({
  boardId,
  column,
}: {
  boardId: string;
  column: ColumnWithCards;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  // Torna a coluna inteira uma "zona de soltar" (para colunas vazias também).
  const { setNodeRef } = useDroppable({ id: column.id });

  async function handleAdd() {
    const value = title.trim();
    if (!value) return setAdding(false);
    setTitle("");
    setAdding(false);
    await createCardAction(boardId, column.id, value);
  }

  async function handleRename() {
    const value = window.prompt("Renomear coluna:", column.title);
    if (value?.trim()) await renameColumnAction(boardId, column.id, value.trim());
  }

  async function handleDelete() {
    if (window.confirm(`Excluir a coluna "${column.title}"?`)) {
      await deleteColumnAction(boardId, column.id);
    }
  }

  return (
    <div className="flex max-h-[calc(100vh-12rem)] w-72 shrink-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <div className="flex items-center justify-between gap-2 px-3.5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onDoubleClick={handleRename}
            className="truncate text-sm font-semibold"
            title="Duplo clique para renomear"
          >
            {column.title}
          </button>
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--surface-2)] px-1.5 text-[11px] font-medium text-[var(--muted)]">
            {column.cards.length}
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="shrink-0 rounded-md px-1 text-xs text-[var(--muted)] transition hover:text-red-500"
          aria-label="Excluir coluna"
        >
          ✕
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex min-h-2 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-2"
      >
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} boardId={boardId} />
          ))}
        </SortableContext>
      </div>

      <div className="px-3 pb-3 pt-1">
        {adding ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
                if (e.key === "Escape") setAdding(false);
              }}
              placeholder="Título do cartão…"
              rows={2}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-violet-400"
              >
                Adicionar
              </button>
              <button
                onClick={() => setAdding(false)}
                className="rounded-lg px-2 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
          >
            + Adicionar cartão
          </button>
        )}
      </div>
    </div>
  );
}
