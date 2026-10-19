import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { brl, capaDe, tipos, type ProdutoCard } from "@/lib/catalog";

export function Stars({ nota, className = "" }: { nota: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Star className="h-4 w-4 fill-highlight text-highlight" />
      <span className="font-semibold">{nota > 0 ? nota.toFixed(1).replace(".", ",") : "Novo"}</span>
    </span>
  );
}

export function ProductCard({ p }: { p: ProdutoCard }) {
  const t = tipos[p.tipo] ?? tipos["curso"]!;
  const Icon = t.icon;
  const capa = capaDe(p);
  return (
    <Link
      to="/produto/$id"
      params={{ id: p.id }}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-soft"
    >
      <div className="aspect-[16/10] overflow-hidden bg-accent">
        {capa ? (
          <img src={capa} alt={p.titulo} loading="lazy" width={800} height={500} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-accent-foreground">
            <Icon className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t.label}
          {p.categoria ? ` · ${p.categoria.nome}` : ""}
        </span>
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">{p.titulo}</h3>
        <span className="mt-1 text-sm text-muted-foreground">{p.professor?.nome}</span>
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="flex items-center gap-1">
            <Stars nota={p.nota} />
            {p.avaliacoes > 0 && <span className="text-muted-foreground">({p.avaliacoes})</span>}
          </span>
          <span className="text-base font-bold">{brl(p.preco_centavos)}</span>
        </div>
      </div>
    </Link>
  );
}
