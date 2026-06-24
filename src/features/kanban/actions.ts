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
  userOwnsCard,
} from "@/services/card.service";
import {
  addAttachment,
  deleteAttachment,
  getAttachmentCardId,
  MAX_ATTACHMENT_BYTES,
} from "@/services/attachment.service";
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

// ---- Anexos (imagens/arquivos) ----
export async function addAttachmentAction(
  boardId: string,
  cardId: string,
  file: { name: string; type: string; url: string; size: number }
) {
  const userId = await assertOwner(boardId);
  if (!(await userOwnsCard(cardId, userId))) {
    throw new Error("Cartão não pertence a este quadro.");
  }
  if (!file.url.startsWith("data:")) {
    throw new Error("Anexo inválido.");
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error("Arquivo muito grande (máx. 3 MB).");
  }
  await addAttachment(cardId, {
    name: file.name.slice(0, 200),
    type: file.type || "application/octet-stream",
    url: file.url,
    size: file.size,
  });
  revalidatePath(`/board/${boardId}`);
}

export async function deleteAttachmentAction(
  boardId: string,
  attachmentId: string
) {
  const userId = await assertOwner(boardId);
  const cardId = await getAttachmentCardId(attachmentId);
  if (!cardId || !(await userOwnsCard(cardId, userId))) {
    throw new Error("Anexo não encontrado.");
  }
  await deleteAttachment(attachmentId);
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
