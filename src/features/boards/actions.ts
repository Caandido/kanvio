"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createBoard,
  renameBoard,
  deleteBoard,
} from "@/services/board.service";

/**
 * Server Actions de quadros. Rodam no servidor, podem ser chamadas
 * diretamente de <form action={...}> ou de componentes client.
 */

export async function createBoardAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const board = await createBoard(title);
  revalidatePath("/");
  redirect(`/board/${board.id}`);
}

export async function renameBoardAction(boardId: string, title: string) {
  const clean = title.trim();
  if (!clean) return;
  await renameBoard(boardId, clean);
  revalidatePath(`/board/${boardId}`);
  revalidatePath("/");
}

export async function deleteBoardAction(boardId: string) {
  await deleteBoard(boardId);
  revalidatePath("/");
  redirect("/");
}
