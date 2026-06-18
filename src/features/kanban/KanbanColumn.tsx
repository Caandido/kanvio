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
    <div className="flex w-72 shrink-0 flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between px-3 py-2">
        <button
          onDoubleClick={handleRename}
          className="text-sm font-semibold"
          title="Duplo clique para renomear"
        >
          {column.title}
        </button>
        <button
          onClick={handleDelete}
          className="text-xs text-[var(--muted)] hover:text-red-500"
          aria-label="Excluir coluna"
        >
          ✕
        </button>
      </div>

      <div ref={setNodeRef} className="flex min-h-2 flex-col gap-2 px-3 pb-2">
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
              className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm outline-none focus:border-[var(--primary)]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="rounded-md bg-[var(--primary)] px-3 py-1 text-xs font-medium text-white"
              >
                Adicionar
              </button>
              <button
                onClick={() => setAdding(false)}
                className="px-2 py-1 text-xs text-[var(--muted)]"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded-md px-2 py-1.5 text-left text-sm text-[var(--muted)] hover:bg-[var(--background)]"
          >
            + Adicionar cartão
          </button>
        )}
      </div>
    </div>
  );
}
