import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, Zap, CreditCard, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { brl, capaDe, produtosQuery, tipos } from "@/lib/catalog";
import type { QueryClient } from "@tanstack/react-query";

const detalheQuery = (id: string, qc: QueryClient) =>
  queryOptions({
    queryKey: ["produto", id],
    queryFn: async () => {
      const todos = await qc.ensureQueryData(produtosQuery);
      const produto = todos.find((p) => p.id === id);
      if (!produto) throw notFound();
      const [mods, aulas, revs, prof] = await Promise.all([
        supabase.from("course_modules").select("id, titulo, ordem").eq("product_id", id).order("ordem"),
        supabase.from("lessons").select("id, module_id, titulo, ordem").eq("product_id", id).order("ordem"),
        supabase.from("reviews").select("id, nota, comentario, created_at, profiles(nome)").eq("product_id", id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("nome, username, avatar_url, bio, formacao").eq("id", produto.seller_id).maybeSingle(),
      ]);
      return {
        produto,
        modulos: (mods.data ?? []).map((m) => ({ ...m, aulas: (aulas.data ?? []).filter((a) => a.module_id === m.id) })),
        avaliacoes: (revs.data ?? []).map((r) => ({ id: r.id, nota: r.nota, comentario: r.comentario, autor: r.profiles?.nome ?? "Aluno" })),
        professor: prof.data,
      };
    },
  });

export const Route = createFileRoute("/produto/$id")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(detalheQuery(params.id, context.queryClient)),
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.produto.titulo} — Ensinar.me` : "Produto — Ensinar.me";
    const d = loaderData?.produto.descricao.slice(0, 155) ?? "Produto digital feito por professores.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "product" }] };
  },
  component: Produto,
  errorComponent: () => <p className="p-8">Não foi possível carregar este produto.</p>,
  notFoundComponent: () => (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Produto não encontrado</h1>
      <Link to="/explorar" className="mt-4 inline-block text-primary hover:underline">Explorar produtos</Link>
    </main>
  ),
});

function Produto() {
  const { id } = Route.useParams();
  const { queryClient } = Route.useRouteContext();
  const { data } = useSuspenseQuery(detalheQuery(id, queryClient));
  const { produto: p, modulos, avaliacoes, professor } = data;
  const capa = capaDe(p);
  const tipo = tipos[p.tipo]?.label ?? p.tipo;

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {capa && <img src={capa} alt={p.titulo} width={1024} height={656} className="aspect-[16/9] w-full rounded-2xl object-cover" />}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">{tipo}{p.categoria ? ` · ${p.categoria.nome}` : ""}</span>
              <h1 className="mt-1 text-3xl font-semibold md:text-4xl">{p.titulo}</h1>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <Stars nota={p.nota} className="text-foreground" /> {p.avaliacoes} avaliação(ões) · {p.vendas} venda(s)
              </div>
            </div>
            <section>
              <h2 className="text-xl font-semibold">Descrição</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed">{p.descricao}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">Conteúdo programático</h2>
              {modulos.length === 0 ? (
                <p className="mt-2 text-muted-foreground">O conteúdo completo é liberado logo após a compra.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {modulos.map((m, i) => (
                    <div key={m.id} className="rounded-xl border bg-card p-4">
                      <h3 className="font-semibold">Módulo {i + 1}: {m.titulo}</h3>
                      <ul className="mt-2 space-y-1">
                        {m.aulas.map((a) => (
                          <li key={a.id} className="flex items-center gap-2 text-sm text-muted-foreground"><PlayCircle className="h-4 w-4 text-primary" />{a.titulo}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
            {professor && (
              <section className="rounded-xl border bg-secondary p-5">
                <h2 className="text-xl font-semibold">Sobre o professor</h2>
                <div className="mt-3 flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                    {professor.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{professor.nome}</p>
                    {professor.formacao && <p className="text-sm text-muted-foreground">{professor.formacao}</p>}
                    {professor.bio && <p className="mt-2 line-clamp-3 text-sm">{professor.bio}</p>}
                    <Link to="/professor/$usuario" params={{ usuario: professor.username }} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">Ver perfil completo</Link>
                  </div>
                </div>
              </section>
            )}
            <section>
              <h2 className="text-xl font-semibold">Avaliações</h2>
              {avaliacoes.length === 0 ? <p className="mt-2 text-muted-foreground">Ainda sem avaliações.</p> : (
                <ul className="mt-3 space-y-3">
                  {avaliacoes.map((r) => (
                    <li key={r.id} className="rounded-xl border bg-card p-4">
                      <div className="flex items-center justify-between"><span className="font-semibold">{r.autor}</span><Stars nota={r.nota} /></div>
                      {r.comentario && <p className="mt-1 text-sm">{r.comentario}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <p className="text-3xl font-bold">{brl(p.preco_centavos)}</p>
              <p className="text-sm text-muted-foreground">em Pix ou cartão</p>
              <Button size="lg" className="mt-4 w-full" onClick={() => toast.info("O pagamento será liberado na próxima etapa.")}>Comprar</Button>
              <div className="mt-4 flex gap-3 rounded-lg bg-accent p-3 text-sm text-accent-foreground">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span><strong>Garantia de 7 dias.</strong> Se não gostar, peça o reembolso total em até 7 dias após a compra.</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Acesso imediato</li>
                <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Pagamento seguro</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
