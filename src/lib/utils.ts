/**
 * Concatena classes condicionalmente, ignorando valores falsy.
 * Versão minimalista do "clsx" — suficiente para o MVP, sem dependência extra.
 *
 *   cn("btn", isActive && "btn-active", undefined) => "btn btn-active"
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Formata uma data para exibição curta (ex.: 18 jun). */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
