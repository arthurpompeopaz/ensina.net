import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { categoriasQuery, produtosQuery, tipos } from "@/lib/catalog";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  tipo: fallback(z.string().array(), []).default([]),
  cat: fallback(z.string(), "").default(""),
  min: fallback(z.number(), 0).default(0),
  max: fallback(z.number(), 0).default(0),
  nota: fallback(z.number(), 0).default(0),
  ordem: fallback(z.string(), "vendidos").default("vendidos"),
});

export const Route = createFileRoute("/explorar")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Explorar produtos — Ensinar.me" },
      { name: "description", content: "Encontre cursos, e-books, pesquisas, materiais didáticos e mentorias feitos por professores." },
      { property: "og:title", content: "Explorar produtos — Ensinar.me" },
      { property: "og:description", content: "Cursos e materiais feitos por professores brasileiros." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(produtosQuery), context.queryClient.ensureQueryData(categoriasQuery)]),
  component: Explorar,
  errorComponent: () => <p className="p-8">Não foi possível carregar os produtos.</p>,
  notFoundComponent: () => <p className="p-8">Página não encontrada.</p>,
});

function Explorar() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/explorar" });
  const { data: produtos } = useSuspenseQuery(produtosQuery);
  const { data: categorias } = useSuspenseQuery(categoriasQuery);
  const upd = (patch: Partial<typeof s>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const termo = s.q.trim().toLowerCase();
  const lista = produtos
    .filter((p) => !termo || `${p.titulo} ${p.descricao} ${p.professor?.nome ?? ""}`.toLowerCase().includes(termo))
    .filter((p) => s.tipo.length === 0 || s.tipo.includes(p.tipo))
    .filter((p) => !s.cat || p.categoria?.slug === s.cat)
    .filter((p) => !s.min || p.preco_centavos >= s.min * 100)
    .filter((p) => !s.max || p.preco_centavos <= s.max * 100)
    .filter((p) => !s.nota || p.nota >= s.nota)
    .sort((a, b) =>
      s.ordem === "recentes" ? b.created_at.localeCompare(a.created_at)
      : s.ordem === "preco" ? a.preco_centavos - b.preco_centavos
      : b.vendas - a.vendas,
    );

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-semibold">Explorar</h1>
        <form className="relative mt-4" onSubmit={(e) => { e.preventDefault(); upd({ q: String(new FormData(e.currentTarget).get("q") ?? "") }); }}>
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input key={s.q} name="q" defaultValue={s.q} placeholder="Buscar por título, tema ou professor" className="h-11 pl-10" />
        </form>

        <div className="mt-6 grid gap-8 md:grid-cols-[240px_1fr]">
          <aside className="space-y-6">
            <div>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Tipo</h2>
              {Object.entries(tipos).map(([k, t]) => (
                <label key={k} className="flex items-center gap-2 py-1 text-sm">
                  <Checkbox checked={s.tipo.includes(k)}
                    onCheckedChange={(c) => upd({ tipo: c ? [...s.tipo, k] : s.tipo.filter((x) => x !== k) })} />
                  {t.label}
                </label>
              ))}
            </div>
            <div>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Categoria</h2>
              <Select value={s.cat || "todas"} onValueChange={(v) => upd({ cat: v === "todas" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {categorias.map((c) => <SelectItem key={c.id} value={c.slug}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Faixa de preço (R$)</h2>
              <div className="flex gap-2">
                <Input type="number" min={0} placeholder="Mín." defaultValue={s.min || ""} onBlur={(e) => upd({ min: Number(e.target.value) || 0 })} />
                <Input type="number" min={0} placeholder="Máx." defaultValue={s.max || ""} onBlur={(e) => upd({ max: Number(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Avaliação mínima</h2>
              <div className="flex flex-wrap gap-1">
                {[0, 3, 4, 4.5].map((n) => (
                  <Button key={n} type="button" size="sm" variant={s.nota === n ? "default" : "outline"} onClick={() => upd({ nota: n })}>
                    {n === 0 ? "Todas" : <><Star className="fill-current" />{String(n).replace(".", ",")}+</>}
                  </Button>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate({ search: {} })}>Limpar filtros</Button>
          </aside>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">{lista.length} produto(s)</p>
              <Select value={s.ordem} onValueChange={(v) => upd({ ordem: v })}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendidos">Mais vendidos</SelectItem>
                  <SelectItem value="recentes">Mais recentes</SelectItem>
                  <SelectItem value="preco">Menor preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {lista.length === 0 ? (
              <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">Nenhum produto encontrado com esses filtros.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {lista.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
