import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/static-page";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [
    { title: "Política de Privacidade — Ensinar.me" },
    { name: "description", content: "Como o Ensinar.me cuida dos seus dados pessoais." },
    { property: "og:title", content: "Política de Privacidade — Ensinar.me" },
    { property: "og:description", content: "Como cuidamos dos seus dados, conforme a LGPD." },
  ] }),
  component: () => (
    <StaticPage titulo="Política de Privacidade">
      <p>Coletamos apenas os dados necessários para sua conta, compras e vendas, conforme a LGPD.</p>
      <p>Seu perfil só aparece para recrutadores se você ativar essa opção.</p>
      <p className="text-sm text-muted-foreground">Texto provisório — a versão definitiva será publicada em breve.</p>
    </StaticPage>
  ),
});
