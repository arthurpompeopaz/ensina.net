import { queryOptions } from "@tanstack/react-query";
import {
  BookOpen,
  FileText,
  FlaskConical,
  Presentation,
  Users,
  Baby,
  School,
  GraduationCap,
  Library,
  Microscope,
  Lightbulb,
  Laptop,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import capa1 from "@/assets/capa-1.jpg";
import capa2 from "@/assets/capa-2.jpg";
import capa3 from "@/assets/capa-3.jpg";
import capa4 from "@/assets/capa-4.jpg";
import capa5 from "@/assets/capa-5.jpg";
import capa6 from "@/assets/capa-6.jpg";
import capa7 from "@/assets/capa-7.jpg";
import capa8 from "@/assets/capa-8.jpg";

export const tipos: Record<string, { label: string; icon: LucideIcon }> = {
  curso: { label: "Curso", icon: Presentation },
  ebook: { label: "E-book", icon: BookOpen },
  pesquisa: { label: "Pesquisa/estudo", icon: FileText },
  material_didatico: { label: "Material didático", icon: FlaskConical },
  mentoria: { label: "Mentoria", icon: Users },
};

/** Categorias exibidas na página inicial, na ordem pedida. */
export const categoriasDestaque: { slug: string; nome: string; icon: LucideIcon }[] = [
  { slug: "educacao-infantil", nome: "Educação Infantil", icon: Baby },
  { slug: "fundamental", nome: "Fundamental", icon: School },
  { slug: "medio", nome: "Médio", icon: Library },
  { slug: "superior", nome: "Superior", icon: GraduationCap },
  { slug: "pesquisa-academica", nome: "Pesquisa Acadêmica", icon: Microscope },
  { slug: "pedagogia", nome: "Metodologias", icon: Lightbulb },
  { slug: "tecnologia-educacional", nome: "Tecnologia na Educação", icon: Laptop },
  { slug: "concursos", nome: "Concursos", icon: ClipboardCheck },
];

const capasExemplo: Record<string, string> = {
  "a0000000-0000-0000-0000-000000000001": capa1,
  "a0000000-0000-0000-0000-000000000002": capa2,
  "a0000000-0000-0000-0000-000000000003": capa3,
  "a0000000-0000-0000-0000-000000000004": capa4,
  "a0000000-0000-0000-0000-000000000005": capa5,
  "a0000000-0000-0000-0000-000000000006": capa6,
  "a0000000-0000-0000-0000-000000000007": capa7,
  "a0000000-0000-0000-0000-000000000008": capa8,
};

export function capaDe(p: { id: string; capa_url: string | null }) {
  return p.capa_url || capasExemplo[p.id] || null;
}

export const brl = (c: number) =>
  (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export type ProdutoCard = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  preco_centavos: number;
  capa_url: string | null;
  destaque: boolean;
  created_at: string;
  seller_id: string;
  professor: { nome: string; username: string } | null;
  categoria: { nome: string; slug: string } | null;
  nota: number;
  avaliacoes: number;
  vendas: number;
};

async function fetchProdutos(): Promise<ProdutoCard[]> {
  const [{ data, error }, { data: stats, error: e2 }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, titulo, descricao, tipo, preco_centavos, capa_url, destaque, created_at, seller_id, profiles(nome, username), categories(nome, slug)",
      )
      .eq("publicado", true),
    supabase.rpc("get_product_stats"),
  ]);
  if (error) throw error;
  if (e2) throw e2;
  const map = new Map((stats ?? []).map((s) => [s.product_id, s]));
  return (data ?? []).map((p) => {
    const s = map.get(p.id);
    return {
      id: p.id,
      titulo: p.titulo,
      descricao: p.descricao,
      tipo: p.tipo,
      preco_centavos: p.preco_centavos,
      capa_url: p.capa_url,
      destaque: p.destaque,
      created_at: p.created_at,
      seller_id: p.seller_id,
      professor: p.profiles ? { nome: p.profiles.nome, username: p.profiles.username } : null,
      categoria: p.categories ? { nome: p.categories.nome, slug: p.categories.slug } : null,
      nota: Number(s?.nota_media ?? 0),
      avaliacoes: Number(s?.total_avaliacoes ?? 0),
      vendas: Number(s?.total_vendas ?? 0),
    };
  });
}

export const produtosQuery = queryOptions({ queryKey: ["produtos"], queryFn: fetchProdutos });

export const categoriasQuery = queryOptions({
  queryKey: ["categorias"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("id, slug, nome").order("nome");
    if (error) throw error;
    return data;
  },
});
