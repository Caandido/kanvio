"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createBoard,
  renameBoard,
  deleteBoard,
  userOwnsBoard,
} from "@/services/board.service";
import { requireUserId } from "@/lib/session";

/**
 * Server Actions de quadros. Rodam no servidor, escopadas pelo usuário logado.
 */

export async function createBoardAction(formData: FormData) {
  const userId = await requireUserId();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const board = await createBoard(userId, title);
  revalidatePath("/");
  redirect(`/board/${board.id}`);
}

export async function renameBoardAction(boardId: string, title: string) {
  const userId = await requireUserId();
  const clean = title.trim();
  if (!clean || !(await userOwnsBoard(boardId, userId))) return;
  await renameBoard(boardId, clean);
  revalidatePath(`/board/${boardId}`);
  revalidatePath("/");
}

export async function deleteBoardAction(boardId: string) {
  const userId = await requireUserId();
  if (!(await userOwnsBoard(boardId, userId))) return;
  await deleteBoard(boardId);
  revalidatePath("/");
  redirect("/");
}
