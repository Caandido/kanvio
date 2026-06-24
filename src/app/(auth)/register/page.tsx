import { AuthForm } from "@/features/auth/AuthForm";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Criar sua conta</h1>
        <p className="text-sm text-[var(--muted)]">
          Leva menos de um minuto — e é grátis.
        </p>
      </div>
      <AuthForm mode="register" />
    </div>
  );
}
