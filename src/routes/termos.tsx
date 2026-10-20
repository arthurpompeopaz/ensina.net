import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/static-page";

export const Route = createFileRoute("/termos")({
  head: () => ({ meta: [
    { title: "Termos de Uso — Ensinar.me" },
    { name: "description", content: "Termos de Uso do marketplace Ensinar.me." },
    { property: "og:title", content: "Termos de Uso — Ensinar.me" },
    { property: "og:description", content: "Regras de uso da plataforma Ensinar.me." },
  ] }),
  component: () => (
    <StaticPage titulo="Termos de Uso">
      <p>Ao usar o Ensinar.me você concorda em publicar apenas conteúdos de sua autoria ou com direito de venda.</p>
      <p>A plataforma cobra comissão de 10% sobre cada venda. Compradores podem pedir reembolso em até 7 dias após a compra.</p>
      <p className="text-sm text-muted-foreground">Texto provisório — a versão definitiva será publicada em breve.</p>
    </StaticPage>
  ),
});
