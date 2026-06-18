import { prisma } from "@/lib/prisma";
import type { BoardWithColumns } from "@/types";

/**
 * Serviço de quadros: toda leitura/escrita de Board passa por aqui.
 * Mantém o acesso ao Prisma isolado dos componentes (CLAUDE.md).
 */

/** Lista os quadros não excluídos (soft delete) de forma resumida. */
export async function listBoards() {
  return prisma.board.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      _count: { select: { columns: true } },
    },
  });
}

/** Carrega um quadro completo (colunas + cartões) já ordenado por posição. */
export async function getBoard(boardId: string): Promise<BoardWithColumns | null> {
  const board = await prisma.board.findFirst({
    where: { id: boardId, deletedAt: null },
    select: {
      id: true,
      title: true,
      columns: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          cards: {
            where: { deletedAt: null },
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              position: true,
              columnId: true,
              dueDate: true,
            },
          },
        },
      },
    },
  });

  return board;
}

/**
 * Cria um quadro. Precisa de um workspace; para o MVP usamos/garantimos
 * um workspace e usuário "demo" padrão.
 */
export async function createBoard(title: string) {
  const workspace = await ensureDemoWorkspace();
  return prisma.board.create({
    data: { title, workspaceId: workspace.id },
    select: { id: true },
  });
}

export async function renameBoard(boardId: string, title: string) {
  return prisma.board.update({ where: { id: boardId }, data: { title } });
}

/** Soft delete: marca deletedAt em vez de apagar (regra de negócio do CLAUDE.md). */
export async function deleteBoard(boardId: string) {
  return prisma.board.update({
    where: { id: boardId },
    data: { deletedAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// Helpers de "demo" — substituídos por autenticação real (Auth.js) no futuro.
// ---------------------------------------------------------------------------

const DEMO_EMAIL = "demo@kanvio.local";

export async function ensureDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { name: "Usuário Demo", email: DEMO_EMAIL },
  });
}

export async function ensureDemoWorkspace() {
  const user = await ensureDemoUser();
  const existing = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
  });
  if (existing) return existing;
  return prisma.workspace.create({
    data: { name: "Meu Workspace", ownerId: user.id },
  });
}
