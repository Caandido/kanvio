# CLAUDE.md

## Projeto

Sistema web de gerenciamento de projetos baseado em Kanban, inspirado no Trello.

O objetivo é permitir que usuários organizem tarefas através de quadros, listas e cartões, com foco em simplicidade, produtividade e colaboração.

---

## Visão Geral

A aplicação deve permitir:

* Criação de contas e autenticação.
* Criação de múltiplos quadros.
* Organização de tarefas em colunas Kanban.
* Arrastar e soltar cartões entre colunas.
* Convite de membros para colaboração.
* Comentários e histórico de atividades.
* Interface moderna, responsiva e intuitiva.

---

## Stack Tecnológica

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Shadcn/UI
* React Query (TanStack Query)
* DnD Kit para drag-and-drop

### Backend

* Next.js API Routes ou NestJS
* TypeScript
* Prisma ORM
* PostgreSQL

### Autenticação

* Auth.js (NextAuth)
* Login via Email
* OAuth Google (opcional)

### Infraestrutura

* Docker
* Vercel (Frontend)
* Railway ou Supabase (Banco)

---

## Entidades Principais

### User

```ts
{
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
}
```

### Workspace

```ts
{
  id: string
  name: string
  ownerId: string
  createdAt: Date
}
```

### Board

```ts
{
  id: string
  title: string
  workspaceId: string
  createdAt: Date
}
```

### Column

```ts
{
  id: string
  title: string
  boardId: string
  position: number
}
```

### Card

```ts
{
  id: string
  title: string
  description?: string
  columnId: string
  position: number
  dueDate?: Date
  createdBy: string
}
```

### Comment

```ts
{
  id: string
  cardId: string
  userId: string
  content: string
  createdAt: Date
}
```

---

## Funcionalidades MVP

### Autenticação

* Cadastro
* Login
* Logout
* Recuperação de senha

### Workspaces

* Criar workspace
* Editar workspace
* Convidar membros

### Boards

* Criar board
* Editar board
* Excluir board

### Colunas

* Criar coluna
* Renomear coluna
* Reordenar coluna
* Excluir coluna

### Cartões

* Criar cartão
* Editar cartão
* Excluir cartão
* Mover cartão entre colunas
* Reordenar cartão
* Adicionar descrição
* Definir prazo

### Comentários

* Adicionar comentário
* Listar comentários
* Excluir comentário próprio

---

## Funcionalidades Futuras

### Colaboração em Tempo Real

Utilizar:

* Socket.IO
* WebSockets
* Supabase Realtime

Eventos:

* CardMoved
* CardCreated
* CardUpdated
* CommentAdded

### Notificações

* Menções
* Prazo próximo
* Convites

### Etiquetas

```ts
{
  id: string
  name: string
  color: string
}
```

### Checklist

```ts
{
  id: string
  cardId: string
  title: string
  completed: boolean
}
```

### Anexos

Upload de:

* Imagens
* PDFs
* Arquivos diversos

---

## Regras de Negócio

### Permissões

Owner:

* Controle total

Member:

* Criar e editar cartões
* Comentar
* Mover cartões

Guest:

* Apenas leitura

### Exclusão

* Soft delete sempre que possível.
* Nenhum dado deve ser removido permanentemente sem confirmação.

### Auditoria

Registrar:

* Criação de cartão
* Edição
* Exclusão
* Movimentação
* Comentários

---

## Padrões de Código

### Estrutura

```
src/
 ├── app/
 ├── components/
 ├── features/
 ├── hooks/
 ├── services/
 ├── lib/
 ├── types/
 └── prisma/
```

### Convenções

* TypeScript strict mode.
* Componentes pequenos e reutilizáveis.
* Server Components por padrão.
* Client Components apenas quando necessário.
* Evitar lógica de negócio dentro dos componentes.

### Nomenclatura

Componentes:

```tsx
BoardCard.tsx
KanbanColumn.tsx
CardModal.tsx
```

Hooks:

```ts
useBoard()
useCards()
useWorkspace()
```

Services:

```ts
board.service.ts
card.service.ts
workspace.service.ts
```

---

## UI/UX

Inspirado em:

* Trello
* Linear
* Notion

Características:

* Design limpo
* Tema claro e escuro
* Responsivo
* Feedback visual para drag-and-drop
* Skeleton loaders
* Toast notifications

---

## Critérios de Qualidade

Antes de concluir qualquer funcionalidade:

* Código compilando sem erros.
* ESLint sem warnings.
* TypeScript sem erros.
* Testes passando.
* Responsividade validada.
* Acessibilidade básica implementada.

---

## Objetivo Final

Construir uma plataforma Kanban moderna, escalável e colaborativa que combine a simplicidade do Trello com a experiência refinada de ferramentas como Linear e Notion.
