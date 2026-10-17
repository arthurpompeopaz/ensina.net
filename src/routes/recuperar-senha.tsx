import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth-card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Ensinar.me" },
      { name: "description", content: "Receba um link para redefinir sua senha do Ensinar.me." },
      { property: "og:title", content: "Recuperar senha — Ensinar.me" },
      { property: "og:description", content: "Redefina sua senha do Ensinar.me." },
    ],
  }),
  component: Recuperar,
});

function Recuperar() {
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = z.string().trim().email().safeParse(new FormData(e.currentTarget).get("email"));
    if (!parsed.success) return toast.error("E-mail inválido");
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setEnviado(true);
  }

  return (
    <AuthCard title="Recuperar senha" subtitle="Enviaremos um link para você criar uma nova senha.">
      {enviado ? (
        <p className="text-muted-foreground">Se houver uma conta com esse e-mail, você receberá o link em instantes.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            Enviar link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/entrar" className="text-primary hover:underline">
          Voltar para o login
        </Link>
      </p>
    </AuthCard>
  );
}
