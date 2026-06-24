"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import type { CardDTO } from "@/types";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/utils";
import {
  updateCardAction,
  deleteCardAction,
  addAttachmentAction,
  deleteAttachmentAction,
} from "./actions";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

/** Converte um File em data URL (base64) no cliente. */
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Date | string → valor "yyyy-mm-dd" para <input type="date">. */
function toDateInput(value: CardDTO["dueDate"]): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function CardModal({
  card,
  boardId,
  onClose,
}: {
  card: CardDTO;
  boardId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [dueDate, setDueDate] = useState(toDateInput(card.dueDate));
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fecha com Esc e trava o scroll do fundo enquanto aberto.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  /** Envolve a seleção do textarea com marcadores (negrito, itálico, etc.). */
  function wrap(before: string, after = before, placeholder = "") {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = description.slice(start, end) || placeholder;
    const next =
      description.slice(0, start) + before + selected + after + description.slice(end);
    setDescription(next);
    // Reposiciona o cursor logo após o conteúdo inserido.
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + selected.length;
      el.setSelectionRange(pos, pos);
    });
  }

  /** Insere um prefixo no início da linha (listas, título, citação). */
  function prefixLine(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = description.lastIndexOf("\n", start - 1) + 1;
    const next =
      description.slice(0, lineStart) + prefix + description.slice(lineStart);
    setDescription(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      await updateCardAction(boardId, card.id, {
        title: title.trim() || card.title,
        description: description.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      });
      onClose();
    });
  }

  function handleDelete() {
    if (!window.confirm("Excluir este cartão?")) return;
    startTransition(async () => {
      await deleteCardAction(boardId, card.id);
      onClose();
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" excede 3 MB.`);
        continue;
      }
      try {
        const url = await readAsDataURL(file);
        await new Promise<void>((resolve) => {
          startTransition(async () => {
            await addAttachmentAction(boardId, card.id, {
              name: file.name,
              type: file.type,
              url,
              size: file.size,
            });
            resolve();
          });
        });
      } catch {
        setError(`Falha ao ler "${file.name}".`);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleDeleteAttachment(id: string) {
    startTransition(async () => {
      await deleteAttachmentAction(boardId, id);
    });
  }

  const toolbar = [
    { label: "B", title: "Negrito", on: () => wrap("**", "**", "texto") },
    { label: "I", title: "Itálico", on: () => wrap("_", "_", "texto"), italic: true },
    { label: "Código", title: "Código", on: () => wrap("`", "`", "código") },
    { label: "H", title: "Título", on: () => prefixLine("## ") },
    { label: "• Lista", title: "Lista", on: () => prefixLine("- ") },
    { label: "1. Lista", title: "Lista numerada", on: () => prefixLine("1. ") },
    { label: "❝", title: "Citação", on: () => prefixLine("> ") },
  ];

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-in my-auto w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        {/* Cabeçalho */}
        <div className="flex items-start gap-3 border-b border-[var(--border)] p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="focus-ring flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-lg font-bold outline-none transition hover:border-[var(--border)]"
            placeholder="Título do cartão"
          />
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 p-5">
          {/* Prazo */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-[var(--muted)]">Prazo</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="focus-ring rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm outline-none"
            />
            {dueDate && (
              <button
                onClick={() => setDueDate("")}
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                limpar
              </button>
            )}
          </div>

          {/* Descrição com formatação */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Descrição</span>
              <div className="flex gap-1 rounded-lg bg-[var(--surface-2)] p-0.5 text-xs">
                <button
                  onClick={() => setTab("edit")}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium transition",
                    tab === "edit"
                      ? "bg-[var(--surface)] shadow-sm"
                      : "text-[var(--muted)]"
                  )}
                >
                  Editar
                </button>
                <button
                  onClick={() => setTab("preview")}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium transition",
                    tab === "preview"
                      ? "bg-[var(--surface)] shadow-sm"
                      : "text-[var(--muted)]"
                  )}
                >
                  Visualizar
                </button>
              </div>
            </div>

            {tab === "edit" ? (
              <>
                <div className="flex flex-wrap gap-1">
                  {toolbar.map((b) => (
                    <button
                      key={b.title}
                      title={b.title}
                      onClick={b.on}
                      className={cn(
                        "rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs font-semibold transition hover:border-[var(--primary)]",
                        b.italic && "italic"
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder="Use **negrito**, _itálico_, listas, links… Markdown é suportado."
                  className="focus-ring w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3 text-sm leading-relaxed outline-none transition"
                />
              </>
            ) : (
              <div className="min-h-[8rem] rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3">
                {description.trim() ? (
                  <Markdown content={description} />
                ) : (
                  <p className="text-sm text-[var(--muted)]">Nada por aqui ainda.</p>
                )}
              </div>
            )}
          </div>

          {/* Anexos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                Anexos{" "}
                {card.attachments.length > 0 && (
                  <span className="text-[var(--muted)]">
                    ({card.attachments.length})
                  </span>
                )}
              </span>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={pending}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium transition hover:border-[var(--primary)] disabled:opacity-50"
              >
                + Adicionar arquivo
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {card.attachments.length > 0 && (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {card.attachments.map((a) => {
                  const isImage = a.type.startsWith("image/");
                  return (
                    <li
                      key={a.id}
                      className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]"
                    >
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={a.name}
                        className="block"
                      >
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.url}
                            alt={a.name}
                            className="h-24 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-24 items-center justify-center text-3xl">
                            📄
                          </div>
                        )}
                        <div className="px-2 py-1.5">
                          <p className="truncate text-xs font-medium">{a.name}</p>
                          <p className="text-[10px] text-[var(--muted)]">
                            {formatBytes(a.size)}
                          </p>
                        </div>
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(a.id)}
                        aria-label="Remover anexo"
                        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-md bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="text-xs text-[var(--muted)]">
              Imagens, PDFs e outros arquivos — até 3 MB cada.
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-[var(--foreground)]/25 bg-[var(--surface-2)] px-3 py-2 text-sm">
              {error}
            </p>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] p-4">
          <button
            onClick={handleDelete}
            disabled={pending}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)] disabled:opacity-50"
          >
            Excluir cartão
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={pending}
              className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Portal evita que o modal herde transform/overflow das colunas.
  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
