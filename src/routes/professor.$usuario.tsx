import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { GraduationCap, MapPin, Briefcase, Link2 } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { produtosQuery } from "@/lib/catalog";

const perfilQuery = (usuario: string) =>
  queryOptions({
    queryKey: ["professor", usuario],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, username, avatar_url, bio, formacao, area_atuacao, cidade, estado, link_lattes, link_linkedin, link_site")
        .eq("username", usuario)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/professor/$usuario")({
  loader: async ({ params, context }) => {
    const [perfil] = await Promise.all([
      context.queryClient.ensureQueryData(perfilQuery(params.usuario)),
      context.queryClient.ensureQueryData(produtosQuery),
    ]);
    return perfil;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.nome} — Professor no Ensinar.me` : "Professor — Ensinar.me";
    const d = loaderData?.bio?.slice(0, 155) || "Conheça os produtos deste professor no Ensinar.me.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "profile" }] };
  },
  component: Professor,
  errorComponent: () => <p className="p-8">Não foi possível carregar este perfil.</p>,
  notFoundComponent: () => (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Professor não encontrado</h1>
      <Link to="/explorar" className="mt-4 inline-block text-primary hover:underline">Explorar produtos</Link>
    </main>
  ),
});

function Professor() {
  const { usuario } = Route.useParams();
  const { data: p } = useSuspenseQuery(perfilQuery(usuario));
  const { data: todos } = useSuspenseQuery(produtosQuery);
  const produtos = todos.filter((x) => x.seller_id === p.id);
  const links = [
    { href: p.link_lattes, l: "Lattes" },
    { href: p.link_linkedin, l: "LinkedIn" },
    { href: p.link_site, l: "Site" },
  ].filter((x) => x.href);

  return (
    <>
      <main>
        <section className="bg-hero text-primary-foreground">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center">
            {p.avatar_url ? (
              <img src={p.avatar_url} alt={p.nome} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-highlight text-4xl font-semibold text-highlight-foreground">{p.nome.charAt(0)}</div>
            )}
            <div>
              <h1 className="text-3xl font-semibold">{p.nome}</h1>
              <p className="opacity-80">@{p.username}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm opacity-90">
                {p.formacao && <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{p.formacao}</span>}
                {p.area_atuacao && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{p.area_atuacao}</span>}
                {p.cidade && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{p.cidade}{p.estado ? `/${p.estado}` : ""}</span>}
              </div>
            </div>
          </div>
        </section>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-4">
            <h2 className="text-xl font-semibold">Sobre</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed">{p.bio || "Este professor ainda não escreveu uma bio."}</p>
            {links.map((x) => (
              <a key={x.l} href={x.href!} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                <Link2 className="h-4 w-4" />{x.l}
              </a>
            ))}
          </aside>
          <section>
            <h2 className="text-xl font-semibold">Produtos à venda</h2>
            {produtos.length === 0 ? <p className="mt-3 text-muted-foreground">Nenhum produto publicado ainda.</p> : (
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {produtos.map((x) => <ProductCard key={x.id} p={x} />)}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
