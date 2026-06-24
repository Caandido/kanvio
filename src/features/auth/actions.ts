"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { ensureWorkspace } from "@/services/board.service";

/**
 * Server Actions de autenticação, no formato de `useActionState`:
 * recebem (estadoAnterior, formData) e devolvem `{ error }` quando algo falha.
 *
 * Em caso de sucesso, `signIn`/`signOut` lançam um redirecionamento interno do
 * Next (NEXT_REDIRECT) — por isso só capturamos `AuthError` e relançamos o resto.
 */

export type AuthState = { error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Informe seu nome." };
  if (!EMAIL_RE.test(email)) return { error: "E-mail inválido." };
  if (password.length < 6)
    return { error: "A senha precisa ter ao menos 6 caracteres." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Já existe uma conta com esse e-mail." };

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hash },
    select: { id: true },
  });
  // Cria o workspace pessoal já no cadastro.
  await ensureWorkspace(user.id);

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Conta criada, mas o login automático falhou. Entre manualmente." };
    }
    throw error; // NEXT_REDIRECT — deixa o Next redirecionar
  }
  return {};
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password)
    return { error: "Preencha e-mail e senha." };

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos." };
    }
    throw error; // NEXT_REDIRECT
  }
  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
