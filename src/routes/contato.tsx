import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/static-page";

export const Route = createFileRoute("/contato")({
  head: () => ({ meta: [
    { title: "Contato — Ensinar.me" },
    { name: "description", content: "Fale com a equipe do Ensinar.me." },
    { property: "og:title", content: "Contato — Ensinar.me" },
    { property: "og:description", content: "Fale com a equipe do Ensinar.me." },
  ] }),
  component: () => (
    <StaticPage titulo="Contato">
      <p>Dúvidas, sugestões ou suporte? Escreva para <a className="font-semibold text-primary" href="mailto:contato@ensinar.me">contato@ensinar.me</a>.</p>
    </StaticPage>
  ),
});
