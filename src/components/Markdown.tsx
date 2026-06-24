import type { ReactNode } from "react";

/**
 * Renderizador de Markdown minimalista e seguro.
 *
 * Produz elementos React (texto puro) — nunca injeta HTML — então não há risco
 * de XSS mesmo com conteúdo do usuário. Cobre o essencial de formatação:
 * títulos, negrito, itálico, código, links, listas e citações.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

/** Converte trechos inline (negrito, itálico, código, link) em nós React. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;

  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;

    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-[var(--surface-2)] px-1 py-0.5 font-mono text-[0.85em]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[")) {
      const m = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      const label = m?.[1] ?? token;
      const href = m?.[2] ?? "#";
      const safe = /^(https?:|mailto:)/i.test(href) ? href : "#";
      nodes.push(
        <a
          key={key}
          href={safe}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline underline-offset-2"
        >
          {label}
        </a>
      );
    } else {
      // *itálico* ou _itálico_
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Linha em branco → separa blocos.
    if (!line.trim()) {
      i++;
      continue;
    }

    // Títulos
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const cls =
        level === 1
          ? "text-lg font-bold"
          : level === 2
            ? "text-base font-bold"
            : "text-sm font-semibold";
      blocks.push(
        <p key={`h-${i}`} className={`${cls} mt-1`}>
          {renderInline(heading[2], `h${i}`)}
        </p>
      );
      i++;
      continue;
    }

    // Lista não ordenada
    if (/^\s*[-*]\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const text = lines[i].replace(/^\s*[-*]\s+/, "");
        items.push(<li key={`li-${i}`}>{renderInline(text, `ul${i}`)}</li>);
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="ml-4 list-disc space-y-0.5">
          {items}
        </ul>
      );
      continue;
    }

    // Lista ordenada
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const text = lines[i].replace(/^\s*\d+\.\s+/, "");
        items.push(<li key={`oli-${i}`}>{renderInline(text, `ol${i}`)}</li>);
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="ml-4 list-decimal space-y-0.5">
          {items}
        </ol>
      );
      continue;
    }

    // Citação
    if (/^\s*>\s?/.test(line)) {
      const text = line.replace(/^\s*>\s?/, "");
      blocks.push(
        <blockquote
          key={`q-${i}`}
          className="border-l-2 border-[var(--border)] pl-3 text-[var(--muted)]"
        >
          {renderInline(text, `q${i}`)}
        </blockquote>
      );
      i++;
      continue;
    }

    // Parágrafo (agrupa linhas consecutivas não-especiais)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3}\s|\s*[-*]\s|\s*\d+\.\s|\s*>\s?)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {renderInline(para.join(" "), `p${i}`)}
      </p>
    );
  }

  return <div className="space-y-2 text-sm">{blocks}</div>;
}
