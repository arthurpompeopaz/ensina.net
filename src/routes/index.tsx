import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileText, FlaskConical, Presentation, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ensinar.me — Materiais e cursos feitos por professores" },
      { name: "description", content: "Compre e venda cursos, e-books, pesquisas e materiais didáticos criados por professores brasileiros." },
      { property: "og:title", content: "Ensinar.me — Materiais e cursos feitos por professores" },
      { property: "og:description", content: "O marketplace de produtos digitais feito para professores." },
    ],
  }),
  component: Index,
});

const tipos: Record<string, { label: string; icon: typeof BookOpen }> = {
  curso: { label: "Curso", icon: Presentation },
  ebook: { label: "E-book", icon: BookOpen },
  pesquisa: { label: "Pesquisa", icon: FileText },
  material_didatico: { label: "Material didático", icon: FlaskConical },
  mentoria: { label: "Mentoria", icon: Users },
};

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Index() {
  const { data: produtos } = useQuery({
    queryKey: ["produtos-recentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, titulo, descricao, tipo, preco_centavos, profiles(nome), categories(nome)")
        .eq("publicado", true)
        .order("destaque", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <main>
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
            Conhecimento de professor para professor.
          </h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">
            Cursos, e-books, pesquisas e materiais didáticos criados por quem vive a sala de aula.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="highlight" size="lg" asChild>
              <Link to="/cadastrar">Começar agora</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold">Em destaque</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {produtos?.map((p) => {
            const t = tipos[p.tipo] ?? tipos.curso!;
            const Icon = t.icon;
            return (
              <article key={p.id} className="flex flex-col rounded-xl border bg-card p-5 transition-shadow hover:shadow-soft">
                <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-10 w-10" />
                </div>
                <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">
                  {t.label} · {p.categories?.nome}
                </span>
                <h3 className="mt-1 text-lg font-semibold leading-snug">{p.titulo}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.descricao}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-sm text-muted-foreground">{p.profiles?.nome}</span>
                  <span className="font-semibold">{brl(p.preco_centavos)}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
