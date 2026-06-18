// Tipos de domínio reutilizados pela UI.
// Derivamos do client do Prisma para manter uma única fonte de verdade.
import type { Board, Column, Card } from "@prisma/client";

export type { Board, Column, Card };

// Estruturas "compostas" usadas pela tela do quadro:
export type CardDTO = Pick<
  Card,
  "id" | "title" | "description" | "position" | "columnId" | "dueDate"
>;

export type ColumnWithCards = Pick<Column, "id" | "title" | "position"> & {
  cards: CardDTO[];
};

export type BoardWithColumns = Pick<Board, "id" | "title"> & {
  columns: ColumnWithCards[];
};
