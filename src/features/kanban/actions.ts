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
import { userOwnsBoard } from "@/services/board.service";
import { requireUserId } from "@/lib/session";

/** Server Actions do quadro Kanban (colunas + cartões). */

/** Garante que o usuário logado é dono do quadro; senão aborta. */
async function assertOwner(boardId: string) {
  const userId = await requireUserId();
  if (!(await userOwnsBoard(boardId, userId))) {
    throw new Error("Sem permissão para este quadro.");
  }
  return userId;
}

// ---- Colunas ----
export async function createColumnAction(boardId: string, title: string) {
  await assertOwner(boardId);
  if (!title.trim()) return;
  await createColumn(boardId, title.trim());
  revalidatePath(`/board/${boardId}`);
}

export async function renameColumnAction(
  boardId: string,
  columnId: string,
  title: string
) {
  await assertOwner(boardId);
  if (!title.trim()) return;
  await renameColumn(columnId, title.trim());
  revalidatePath(`/board/${boardId}`);
}

export async function deleteColumnAction(boardId: string, columnId: string) {
  await assertOwner(boardId);
  await deleteColumn(columnId);
  revalidatePath(`/board/${boardId}`);
}

// ---- Cartões ----
export async function createCardAction(
  boardId: string,
  columnId: string,
  title: string
) {
  const userId = await assertOwner(boardId);
  if (!title.trim()) return;
  await createCard(columnId, title.trim(), userId);
  revalidatePath(`/board/${boardId}`);
}

export async function updateCardAction(
  boardId: string,
  cardId: string,
  data: { title?: string; description?: string | null; dueDate?: Date | null }
) {
  await assertOwner(boardId);
  await updateCard(cardId, data);
  revalidatePath(`/board/${boardId}`);
}

export async function deleteCardAction(boardId: string, cardId: string) {
  await assertOwner(boardId);
  await deleteCard(cardId);
  revalidatePath(`/board/${boardId}`);
}

/**
 * Persiste a ordenação após o drag-and-drop.
 * NÃO chamamos revalidatePath aqui: a UI já está otimista (atualizada
 * localmente), então revalidar causaria um "flash". A persistência é silenciosa.
 */
export async function reorderCardsAction(
  boardId: string,
  columns: { columnId: string; cardIds: string[] }[]
) {
  await assertOwner(boardId);
  await reorderCards(columns);
}
