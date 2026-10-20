import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StaticPage } from "@/components/static-page";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/catalog";

export const Route = createFileRoute("/vender")({
  head: () => ({ meta: [
    { title: "Quero vender — Ensinar.me" },
    { name: "description", content: "Venda seus cursos, e-books e materiais no Ensinar.me e fique com 90% de cada venda." },
    { property: "og:title", content: "Quero vender — Ensinar.me" },
    { property: "og:description", content: "Transforme seu conhecimento em renda." },
  ] }),
  component: Vender,
});

function Vender() {
  const { user } = useAuth();
  const [ok, setOk] = useState(false);
  async function ativar() {
    const { error } = await supabase.rpc("become_seller");
    if (error) return toast.error("Não foi possível ativar sua conta de vendedor");
    setOk(true);
    toast.success("Pronto! Você já pode vender.");
  }
  return (
    <StaticPage titulo="Venda seu conhecimento">
      <p>Publique cursos, e-books, pesquisas, materiais didáticos e mentorias. Publicar é grátis.</p>
      <div className="rounded-xl border bg-card p-5">
        <p className="font-semibold">Como funciona a comissão</p>
        <p className="mt-1 text-sm">A plataforma fica com 10% de cada venda. Exemplo: num produto de {brl(10000)}, você recebe {brl(9000)}.</p>
      </div>
      {user ? (
        ok ? <p className="font-semibold text-primary">Conta de vendedor ativada. O painel de vendas chega na próxima etapa.</p>
          : <Button size="lg" onClick={ativar}>Quero vender</Button>
      ) : (
        <Button size="lg" asChild><Link to="/cadastrar">Criar conta para vender</Link></Button>
      )}
    </StaticPage>
  );
}
