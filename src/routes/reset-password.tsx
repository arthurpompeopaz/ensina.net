import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth-card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — Ensinar.me" },
      { name: "description", content: "Defina uma nova senha para sua conta Ensinar.me." },
      { property: "og:title", content: "Nova senha — Ensinar.me" },
      { property: "og:description", content: "Defina uma nova senha." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const senha = String(f.get("senha") ?? "");
    if (senha.length < 8) { toast.error("A senha deve ter ao menos 8 caracteres"); return; }
    if (senha !== f.get("confirmar")) { toast.error("As senhas não coincidem"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);
    if (error) { toast.error("Link inválido ou expirado. Solicite um novo."); return; }
    toast.success("Senha atualizada!");
    navigate({ to: "/" });
  }

  return (
    <AuthCard title="Criar nova senha">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="senha">Nova senha</Label>
          <Input id="senha" name="senha" type="password" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmar">Confirmar senha</Label>
          <Input id="confirmar" name="confirmar" type="password" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          Salvar nova senha
        </Button>
      </form>
    </AuthCard>
  );
}
