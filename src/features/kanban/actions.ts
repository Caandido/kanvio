"use server";

import { revalidatePath } from "next/cache";
import {
  createColumn,
  renameColumn,
  deleteColumn,
} from "@/services/column.service";
import {
  createCard,
  updateCard,
  deleteCard,
  reorderCards,
} from "@/services/card.service";

/** Server Actions do quadro Kanban (colunas + cartões). */

// ---- Colunas ----
export async function createColumnAction(boardId: string, title: string) {
  if (!title.trim()) return;
  await createColumn(boardId, title.trim());
  revalidatePath(`/board/${boardId}`);
}

export async function renameColumnAction(
  boardId: string,
  columnId: string,
  title: string
) {
  if (!title.trim()) return;
  await renameColumn(columnId, title.trim());
  revalidatePath(`/board/${boardId}`);
}

export async function deleteColumnAction(boardId: string, columnId: string) {
  await deleteColumn(columnId);
  revalidatePath(`/board/${boardId}`);
}

// ---- Cartões ----
export async function createCardAction(
  boardId: string,
  columnId: string,
  title: string
) {
  if (!title.trim()) return;
  await createCard(columnId, title.trim());
  revalidatePath(`/board/${boardId}`);
}

export async function updateCardAction(
  boardId: string,
  cardId: string,
  data: { title?: string; description?: string | null; dueDate?: Date | null }
) {
  await updateCard(cardId, data);
  revalidatePath(`/board/${boardId}`);
}

export async function deleteCardAction(boardId: string, cardId: string) {
  await deleteCard(cardId);
  revalidatePath(`/board/${boardId}`);
}

/**
 * Persiste a ordenação após o drag-and-drop.
 * NÃO chamamos revalidatePath aqui: a UI já está otimista (atualizada
 * localmente), então revalidar causaria um "flash". A persistência é silenciosa.
 */
export async function reorderCardsAction(
  columns: { columnId: string; cardIds: string[] }[]
) {
  await reorderCards(columns);
}
