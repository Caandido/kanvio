# 📋 Kanvio

Gerenciador de projetos estilo Kanban (inspirado no Trello), feito com
**Next.js (App Router) + TypeScript + Tailwind + Prisma**.

🌐 **Demo ao vivo:** https://kanvio-tau.vercel.app

> 📖 Leia **[`PASSO-A-PASSO.txt`](./PASSO-A-PASSO.txt)** para a explicação
> completa da arquitetura e de cada arquivo do código.

## Funcionalidades atuais
- **Login por e-mail e senha** (Auth.js / NextAuth) — cada conta tem seus
  próprios quadros, **sincronizados entre dispositivos**
- Criar / abrir / excluir (soft delete) quadros
- Criar, renomear (duplo clique) e excluir colunas
- Criar, editar (✎) e excluir (✕) cartões
- **Arrastar e soltar** cartões: reordenar e mover entre colunas (persistido)
- Visual moderno (paleta índigo/violeta, header glass) e tema claro/escuro automático

## Como rodar
```bash
npm install        # dependências
# .env precisa de DATABASE_URL (PostgreSQL) e AUTH_SECRET
#   AUTH_SECRET: gere com  npx auth secret  (ou openssl rand -base64 32)
npm run db:push    # cria as tabelas no PostgreSQL
npm run db:seed    # (opcional) conta demo + quadro de exemplo
npm run dev        # http://localhost:3000
```

> Conta demo do seed: **demo@kanvio.local** / senha **demo123**.

## Scripts
| Comando            | O que faz                                  |
|--------------------|--------------------------------------------|
| `npm run dev`      | Servidor de desenvolvimento                |
| `npm run build`    | Build de produção (checa tipos e lint)     |
| `npm run db:push`  | Sincroniza o schema com o banco            |
| `npm run db:seed`  | Popula dados de exemplo                    |
| `npm run db:studio`| UI visual do banco (Prisma Studio)         |

## Stack
Next.js 16 · React 19 · TypeScript (strict) · Tailwind v4 · Prisma 6 ·
Auth.js (NextAuth v5) · @dnd-kit · PostgreSQL (Neon)

Banco em dev e produção é **PostgreSQL** (Neon). A autenticação usa
**Auth.js** com provider de credenciais (e-mail + senha, hash bcrypt) e
sessão em JWT.
