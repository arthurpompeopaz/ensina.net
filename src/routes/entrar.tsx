import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, Divider, GoogleButton } from "@/components/auth-card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Ensinar.me" },
      { name: "description", content: "Acesse sua conta no Ensinar.me, o marketplace de materiais para professores." },
      { property: "og:title", content: "Entrar — Ensinar.me" },
      { property: "og:description", content: "Acesse sua conta no Ensinar.me." },
    ],
  }),
  component: Entrar,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

function Entrar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: f.get("email"), senha: f.get("senha") });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.senha,
    });
    setLoading(false);
    if (error) { toast.error(error.message.includes("confirmed") ? "Confirme seu e-mail antes de entrar." : "E-mail ou senha incorretos."); return; }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/" });
  }

  return (
    <AuthCard title="Entrar" subtitle="Que bom ver você de novo.">
      <GoogleButton />
      <Divider />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label htmlFor="senha">Senha</Label>
            <Link to="/recuperar-senha" className="text-xs text-primary hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <Input id="senha" name="senha" type="password" autoComplete="current-password" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link to="/cadastrar" className="font-semibold text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </AuthCard>
  );
}
