// Tipos de domínio reutilizados pela UI.
// Derivamos do client do Prisma para manter uma única fonte de verdade.
import type { Board, Column, Card, Attachment } from "@prisma/client";

export type { Board, Column, Card, Attachment };

// Anexo (imagem/arquivo) já no formato consumido pela UI.
export type AttachmentDTO = Pick<
  Attachment,
  "id" | "name" | "type" | "url" | "size"
>;

// Estruturas "compostas" usadas pela tela do quadro:
export type CardDTO = Pick<
  Card,
  "id" | "title" | "description" | "position" | "columnId" | "dueDate"
> & {
  attachments: AttachmentDTO[];
};

export type ColumnWithCards = Pick<Column, "id" | "title" | "position"> & {
  cards: CardDTO[];
};

export type BoardWithColumns = Pick<Board, "id" | "title"> & {
  columns: ColumnWithCards[];
};
