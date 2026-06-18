import { prisma } from "@/lib/prisma";

/** Serviço de colunas (listas Kanban). */

/** Cria uma coluna no fim do quadro (maior posição + 1). */
export async function createColumn(boardId: string, title: string) {
  const last = await prisma.column.findFirst({
    where: { boardId, deletedAt: null },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? -1) + 1;
  return prisma.column.create({ data: { boardId, title, position } });
}

export async function renameColumn(columnId: string, title: string) {
  return prisma.column.update({ where: { id: columnId }, data: { title } });
}

export async function deleteColumn(columnId: string) {
  return prisma.column.update({
    where: { id: columnId },
    data: { deletedAt: new Date() },
  });
}
