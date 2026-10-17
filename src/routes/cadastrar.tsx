import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, Divider, GoogleButton } from "@/components/auth-card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cadastrar")({
  head: () => ({
    meta: [
      { title: "Criar conta — Ensinar.me" },
      { name: "description", content: "Crie sua conta grátis no Ensinar.me para comprar e vender materiais didáticos." },
      { property: "og:title", content: "Criar conta — Ensinar.me" },
      { property: "og:description", content: "Crie sua conta grátis no Ensinar.me." },
    ],
  }),
  component: Cadastrar,
});

const schema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    senha: z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(72),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, { message: "As senhas não coincidem" });

function Cadastrar() {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(f);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.senha,
      options: { emailRedirectTo: window.location.origin, data: { full_name: parsed.data.nome } },
    });
    setLoading(false);
    if (error) return toast.error(error.message.includes("registered") ? "Este e-mail já está cadastrado." : "Não foi possível criar a conta.");
    setEnviado(parsed.data.email);
  }

  if (enviado) {
    return (
      <AuthCard title="Confira seu e-mail">
        <div className="flex flex-col items-center text-center">
          <MailCheck className="h-12 w-12 text-primary" />
          <p className="mt-4 text-muted-foreground">
            Enviamos um link de confirmação para <strong className="text-foreground">{enviado}</strong>. Clique nele para ativar sua conta.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/entrar">Ir para o login</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Criar conta" subtitle="Comece como membro. Você pode ativar o perfil de vendedor depois.">
      <GoogleButton />
      <Divider />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" name="nome" autoComplete="name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" name="senha" type="password" autoComplete="new-password" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmar">Confirmar senha</Label>
          <Input id="confirmar" name="confirmar" type="password" autoComplete="new-password" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/entrar" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthCard>
  );
}
