import { prisma } from "@/lib/prisma";

/** Serviço de anexos (imagens/arquivos) de um cartão. */

/** Limite por arquivo. Anexos são salvos inline (data URL) no banco. */
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024; // 3 MB

/** Adiciona um anexo a um cartão. */
export async function addAttachment(
  cardId: string,
  data: { name: string; type: string; url: string; size: number }
) {
  return prisma.attachment.create({ data: { cardId, ...data } });
}

/** Retorna o cardId do anexo (para validar permissão antes de excluir). */
export async function getAttachmentCardId(attachmentId: string) {
  const att = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    select: { cardId: true },
  });
  return att?.cardId ?? null;
}

export async function deleteAttachment(attachmentId: string) {
  return prisma.attachment.delete({ where: { id: attachmentId } });
}
