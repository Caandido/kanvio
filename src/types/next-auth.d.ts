import type { DefaultSession } from "next-auth";

// Adiciona `id` ao usuário da sessão (preenchido no callback `session`).
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
