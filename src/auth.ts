import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Configuração central do Auth.js (NextAuth v5).
 *
 * Estratégia: login por e-mail + senha (Credentials provider), com sessão em
 * JWT (sem tabela de sessão no banco — mais simples e funciona em serverless).
 * A senha é verificada contra o hash bcrypt guardado em `User.password`.
 *
 * Por que JWT e não sessão no banco? O provider Credentials do Auth.js só
 * funciona com `session.strategy = "jwt"`. Como guardamos o `id` do usuário no
 * token, todas as queries conseguem escopar os dados por usuário.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // necessário atrás do proxy da Vercel
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // O retorno vira a base do token JWT.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    // Propaga o id do usuário do token para a sessão exposta à aplicação.
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
