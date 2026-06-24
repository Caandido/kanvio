"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, registerAction, type AuthState } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold"
    >
      {pending ? "Aguarde…" : label}
    </button>
  );
}

const inputClass =
  "focus-ring h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm outline-none transition placeholder:text-[var(--muted)]";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});

  const isLogin = mode === "login";

  return (
    <form action={formAction} className="space-y-4">
      {!isLogin && (
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Nome
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Como devemos te chamar?"
            required
            className={inputClass}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
          required
          minLength={6}
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p className="flex items-start gap-2 rounded-lg border border-[var(--foreground)]/25 bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)]">
          <span aria-hidden className="mt-px font-bold">!</span>
          {state.error}
        </p>
      )}

      <SubmitButton label={isLogin ? "Entrar" : "Criar conta"} />

      <p className="pt-1 text-center text-sm text-[var(--muted)]">
        {isLogin ? (
          <>
            Não tem conta?{" "}
            <Link
              href="/register"
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Cadastre-se
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Entrar
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
