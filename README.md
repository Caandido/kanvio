# 📋 Kanvio

Gerenciador de projetos estilo Kanban (inspirado no Trello), feito com
**Next.js (App Router) + TypeScript + Tailwind + Prisma**.

🌐 **Demo ao vivo:** https://kanvio-tau.vercel.app

> 📖 Leia **[`PASSO-A-PASSO.txt`](./PASSO-A-PASSO.txt)** para a explicação
> completa da arquitetura e de cada arquivo do código.

## Funcionalidades atuais
- Criar / abrir / excluir (soft delete) quadros
- Criar, renomear (duplo clique) e excluir colunas
- Criar, editar (✎) e excluir (✕) cartões
- **Arrastar e soltar** cartões: reordenar e mover entre colunas (persistido)
- Tema claro/escuro automático

## Como rodar
```bash
npm install        # dependências
npm run db:push    # cria as tabelas (SQLite: prisma/dev.db)
npm run db:seed    # (opcional) quadro de exemplo
npm run dev        # http://localhost:3000
```

## Scripts
| Comando            | O que faz                                  |
|--------------------|--------------------------------------------|
| `npm run dev`      | Servidor de desenvolvimento                |
| `npm run build`    | Build de produção (checa tipos e lint)     |
| `npm run db:push`  | Sincroniza o schema com o banco            |
| `npm run db:seed`  | Popula dados de exemplo                    |
| `npm run db:studio`| UI visual do banco (Prisma Studio)         |

## Stack
Next.js 15 · React 19 · TypeScript (strict) · Tailwind v4 · Prisma 6 ·
@dnd-kit · SQLite (dev) / PostgreSQL (prod)

Banco em dev é **SQLite** (zero config). Para produção, troque o `provider`
no `prisma/schema.prisma` para `postgresql` — detalhes no passo a passo.
