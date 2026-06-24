"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { BoardWithColumns, ColumnWithCards, CardDTO } from "@/types";
import { reorderCardsAction, createColumnAction } from "./actions";
import { KanbanColumn } from "./KanbanColumn";
import { CardItem } from "./BoardCard";

export function KanbanBoard({ board }: { board: BoardWithColumns }) {
  // Estado local = fonte de verdade da UI durante o drag (otimista).
  const [columns, setColumns] = useState<ColumnWithCards[]>(board.columns);
  const [activeCard, setActiveCard] = useState<CardDTO | null>(null);

  // Ressincroniza quando o servidor revalida (criar/editar cartão, anexos…).
  // Durante interações puramente locais (drag) o `board` mantém a mesma
  // referência, então este efeito não dispara e não atropela o estado otimista.
  useEffect(() => {
    setColumns(board.columns);
  }, [board]);

  // Exige mover 6px antes de iniciar o drag — evita conflito com cliques.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const findColumnIndexByCard = (cardId: string) =>
    columns.findIndex((c) => c.cards.some((card) => card.id === cardId));

  const findColumnIndexById = (columnId: string) =>
    columns.findIndex((c) => c.id === columnId);

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    const colIdx = findColumnIndexByCard(id);
    if (colIdx >= 0) {
      const card = columns[colIdx].cards.find((c) => c.id === id) ?? null;
      setActiveCard(card);
    }
  }

  // Durante o arraste: move o cartão entre colunas no estado local.
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const fromCol = findColumnIndexByCard(activeId);
    if (fromCol < 0) return;

    // A coluna de destino: ou a coluna do cartão "over", ou a própria coluna (id).
    let toCol = findColumnIndexByCard(overId);
    if (toCol < 0) toCol = findColumnIndexById(overId);
    if (toCol < 0 || fromCol === toCol) return;

    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));
      const moving = next[fromCol].cards.find((c) => c.id === activeId);
      if (!moving) return prev;

      next[fromCol].cards = next[fromCol].cards.filter((c) => c.id !== activeId);

      const overIdxInTarget = next[toCol].cards.findIndex((c) => c.id === overId);
      const insertAt =
        overIdxInTarget >= 0 ? overIdxInTarget : next[toCol].cards.length;
      next[toCol].cards.splice(insertAt, 0, { ...moving, columnId: next[toCol].id });
      return next;
    });
  }

  // Ao soltar: reordena dentro da coluna final e persiste no banco.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const colIdx = findColumnIndexByCard(activeId);
    if (colIdx < 0) return;

    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));
      const cards = next[colIdx].cards;
      const oldIndex = cards.findIndex((c) => c.id === activeId);
      const newIndex = cards.findIndex((c) => c.id === overId);
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        next[colIdx].cards = arrayMove(cards, oldIndex, newIndex);
      }
      // Persiste a ordem de todas as colunas (simples e seguro).
      persist(next);
      return next;
    });
  }

  function persist(cols: ColumnWithCards[]) {
    const payload = cols.map((c) => ({
      columnId: c.id,
      cardIds: c.cards.map((card) => card.id),
    }));
    // "Fire and forget": a UI já está atualizada; persistência em segundo plano.
    void reorderCardsAction(board.id, payload);
  }

  async function handleAddColumn() {
    const title = window.prompt("Nome da nova coluna:");
    if (!title?.trim()) return;
    // A revalidação no servidor atualiza `board`, e o useEffect ressincroniza.
    await createColumnAction(board.id, title.trim());
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} boardId={board.id} column={column} />
        ))}

        <button
          onClick={handleAddColumn}
          className="h-11 w-72 shrink-0 rounded-2xl border border-dashed border-[var(--border)] text-sm font-medium text-[var(--muted)] transition hover:border-[var(--primary)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
        >
          + Adicionar coluna
        </button>
      </div>

      {/* Pré-visualização que segue o cursor durante o arraste. */}
      <DragOverlay>
        {activeCard ? <CardItem card={activeCard} boardId={board.id} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
