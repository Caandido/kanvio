import { prisma } from "@/lib/prisma";
import { ensureDemoUser } from "./board.service";

/** Serviço de cartões. */

/** Cria um cartão no fim da coluna. */
export async function createCard(columnId: string, title: string) {
  const user = await ensureDemoUser();
  const last = await prisma.card.findFirst({
    where: { columnId, deletedAt: null },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? -1) + 1;
  return prisma.card.create({
    data: { columnId, title, position, createdBy: user.id },
  });
}

export async function updateCard(
  cardId: string,
  data: { title?: string; description?: string | null; dueDate?: Date | null }
) {
  return prisma.card.update({ where: { id: cardId }, data });
}

export async function deleteCard(cardId: string) {
  return prisma.card.update({
    where: { id: cardId },
    data: { deletedAt: new Date() },
  });
}

/**
 * Persiste a nova ordenação após um drag-and-drop.
 *
 * O cliente envia, para cada coluna afetada, a lista de IDs de cartões já na
 * ordem final. Reescrevemos columnId + position (índice) de cada cartão dentro
 * de uma transação — assim a operação é atômica e as posições ficam sempre
 * como inteiros sequenciais (0,1,2,...), evitando "buracos".
 */
export async function reorderCards(
  columns: { columnId: string; cardIds: string[] }[]
) {
  const updates = columns.flatMap((col) =>
    col.cardIds.map((cardId, index) =>
      prisma.card.update({
        where: { id: cardId },
        data: { columnId: col.columnId, position: index },
      })
    )
  );
  return prisma.$transaction(updates);
}
