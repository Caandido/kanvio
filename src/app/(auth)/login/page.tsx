import { AuthForm } from "@/features/auth/AuthForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="text-sm text-[var(--muted)]">
          Entre para acessar seus quadros.
        </p>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
