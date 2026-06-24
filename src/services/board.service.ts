import { prisma } from "@/lib/prisma";
import type { BoardWithColumns } from "@/types";

/**
 * Serviço de quadros: toda leitura/escrita de Board passa por aqui.
 * Mantém o acesso ao Prisma isolado dos componentes (CLAUDE.md).
 *
 * Tudo é escopado por `userId` (dono do workspace) — assim cada usuário só
 * enxerga e altera os próprios quadros, e os dados sincronizam entre
 * dispositivos pela mesma conta.
 */

/** Lista os quadros (não excluídos) que pertencem ao usuário. */
export async function listBoards(userId: string) {
  return prisma.board.findMany({
    where: { deletedAt: null, workspace: { ownerId: userId } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      _count: { select: { columns: { where: { deletedAt: null } } } },
    },
  });
}

/**
 * Carrega um quadro completo (colunas + cartões) já ordenado por posição.
 * Só retorna se o quadro pertencer ao usuário — caso contrário `null`.
 */
export async function getBoard(
  boardId: string,
  userId: string
): Promise<BoardWithColumns | null> {
  const board = await prisma.board.findFirst({
    where: { id: boardId, deletedAt: null, workspace: { ownerId: userId } },
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
              attachments: {
                orderBy: { createdAt: "asc" },
                select: {
                  id: true,
                  name: true,
                  type: true,
                  url: true,
                  size: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return board;
}

/** Cria um quadro no workspace do usuário (criando o workspace se necessário). */
export async function createBoard(userId: string, title: string) {
  const workspace = await ensureWorkspace(userId);
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

/** Confirma que o quadro pertence ao usuário (para ações de escrita). */
export async function userOwnsBoard(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, workspace: { ownerId: userId } },
    select: { id: true },
  });
  return Boolean(board);
}

/**
 * Garante que o usuário tenha um workspace pessoal (o primeiro vira o padrão).
 * Substitui o antigo "workspace demo" global agora que há login real.
 */
export async function ensureWorkspace(userId: string) {
  const existing = await prisma.workspace.findFirst({
    where: { ownerId: userId },
  });
  if (existing) return existing;
  return prisma.workspace.create({
    data: { name: "Meu Workspace", ownerId: userId },
  });
}
