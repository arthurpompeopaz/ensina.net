import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CreditCard, Download, Search, ShieldCheck, Upload, Wallet, Zap, ShoppingCart, BookOpenCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { categoriasDestaque, produtosQuery } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ensinar.me — Materiais e cursos feitos por professores" },
      { name: "description", content: "Compre e venda cursos, e-books, pesquisas e materiais didáticos criados por professores brasileiros." },
      { property: "og:title", content: "Ensinar.me — Materiais e cursos feitos por professores" },
      { property: "og:description", content: "O marketplace de produtos digitais feito para professores." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(produtosQuery),
  component: Index,
  errorComponent: () => <p className="p-8">Não foi possível carregar os produtos.</p>,
  notFoundComponent: () => <p className="p-8">Página não encontrada.</p>,
});

const passosCompra = [
  { icon: Search, t: "Encontre", d: "Busque por tema, etapa de ensino ou tipo de material." },
  { icon: ShoppingCart, t: "Compre", d: "Pague com Pix ou cartão de forma segura." },
  { icon: Download, t: "Use", d: "Acesse na hora pela sua área do aluno." },
];
const passosVenda = [
  { icon: UserPlus, t: "Crie seu perfil", d: "Mostre sua formação e experiência." },
  { icon: Upload, t: "Publique", d: "Envie cursos, e-books, pesquisas ou mentorias." },
  { icon: Wallet, t: "Receba", d: "Ganhe 90% de cada venda." },
];

function Index() {
  const { data } = useSuspenseQuery(produtosQuery);
  const navigate = useNavigate();
  const destaques = [...data].sort((a, b) => Number(b.destaque) - Number(a.destaque) || b.vendas - a.vendas).slice(0, 8);

  function buscar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    navigate({ to: "/explorar", search: q ? { q } : {} });
  }

  return (
    <>
      <main>
        <section className="bg-hero text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
              Conhecimento de professor para professor.
            </h1>
            <p className="mt-4 max-w-xl text-lg opacity-90">
              Cursos, e-books, pesquisas e materiais didáticos criados por quem vive a sala de aula.
            </p>
            <form onSubmit={buscar} className="mt-8 flex max-w-2xl gap-2 rounded-xl bg-card p-2 shadow-soft">
              <Search className="ml-2 mt-3 h-5 w-5 shrink-0 text-muted-foreground" />
              <Input name="q" placeholder="O que você quer aprender ou ensinar hoje?" className="h-12 border-0 text-base text-foreground shadow-none focus-visible:ring-0" />
              <Button type="submit" size="lg" className="h-12">Buscar</Button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold">Categorias</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categoriasDestaque.map(({ slug, nome, icon: Icon }) => (
              <Link key={slug} to="/explorar" search={{ cat: slug }}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary hover:bg-accent">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold">{nome}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold">Em destaque</h2>
            <Link to="/explorar" className="text-sm font-semibold text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destaques.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>

        <section className="bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="text-center text-2xl font-semibold">Como funciona</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {[{ t: "Para quem compra", p: passosCompra }, { t: "Para quem vende", p: passosVenda }].map((g) => (
                <div key={g.t} className="rounded-xl border bg-card p-6">
                  <h3 className="text-lg font-semibold text-primary">{g.t}</h3>
                  <ol className="mt-4 space-y-4">
                    {g.p.map(({ icon: Icon, t, d }, i) => (
                      <li key={t} className="flex gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span>
                        <span><span className="font-semibold">{i + 1}. {t}</span><span className="block text-sm text-muted-foreground">{d}</span></span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid items-center gap-6 rounded-2xl bg-hero p-8 text-primary-foreground md:grid-cols-[1fr_auto] md:p-12">
            <div>
              <h2 className="text-3xl font-semibold">Venda seu conhecimento</h2>
              <p className="mt-3 max-w-xl opacity-90">
                Transforme suas aulas, pesquisas e materiais em renda. Publicar é grátis: a plataforma fica com apenas
                <strong> 10% de comissão</strong> por venda e você recebe os outros <strong>90%</strong>.
              </p>
            </div>
            <Button variant="highlight" size="lg" asChild><Link to="/vender">Quero vender</Link></Button>
          </div>
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3">
            {[
              { icon: CreditCard, t: "Pagamento seguro", d: "Pix e cartão de crédito" },
              { icon: ShieldCheck, t: "Garantia de 7 dias", d: "Seu dinheiro de volta" },
              { icon: Zap, t: "Acesso imediato", d: "Comece logo após a compra" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex items-center gap-3">
                <Icon className="h-8 w-8 text-primary" />
                <span><span className="block font-semibold">{t}</span><span className="text-sm text-muted-foreground">{d}</span></span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

// keep icon import used
void BookOpenCheck;
