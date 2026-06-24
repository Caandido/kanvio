import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Helpers de sessão usados pelos Server Components e Server Actions.
 * Centralizam a regra "precisa estar logado" num só lugar.
 */

/** Retorna o usuário logado ou `null`. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Exige um usuário logado. Em páginas, redireciona para /login.
 * Retorna o id do usuário (garantidamente presente).
 */
export async function requireUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");
  return user.id;
}
