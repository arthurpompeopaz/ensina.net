import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Status = Database["public"]["Enums"]["status_profissional"];

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Ensinar.me" },
      { name: "description", content: "Edite seu perfil de professor no Ensinar.me." },
      { property: "og:title", content: "Meu perfil — Ensinar.me" },
      { property: "og:description", content: "Edite seu perfil de professor." },
    ],
  }),
  component: Perfil,
});

const statusOpcoes: { v: Status; l: string }[] = [
  { v: "empregado", l: "Empregado" },
  { v: "desempregado", l: "Desempregado" },
  { v: "buscando_emprego", l: "Buscando emprego" },
  { v: "freelancer", l: "Freelancer" },
];

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  username: z.string().trim().regex(/^[a-z0-9._-]{3,30}$/, "Usuário: 3 a 30 letras minúsculas, números, ponto ou traço"),
  bio: z.string().max(1000),
  formacao: z.string().max(200),
  area_atuacao: z.string().max(200),
  cidade: z.string().max(100),
  estado: z.string().max(2),
  link_lattes: z.string().url("Link inválido").or(z.literal("")),
  link_linkedin: z.string().url("Link inválido").or(z.literal("")),
  link_site: z.string().url("Link inválido").or(z.literal("")),
});

function Perfil() {
  const { user } = Route.useRouteContext();
  const [p, setP] = useState<Profile | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => setP(data));
  }, [user.id]);

  if (!p) return <main className="mx-auto max-w-2xl px-4 py-10 text-muted-foreground">Carregando…</main>;

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP({ ...p, [k]: v });

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!p) return;
    const parsed = schema.safeParse({
      nome: p.nome, username: p.username, bio: p.bio ?? "", formacao: p.formacao ?? "",
      area_atuacao: p.area_atuacao ?? "", cidade: p.cidade ?? "", estado: p.estado ?? "",
      link_lattes: p.link_lattes ?? "", link_linkedin: p.link_linkedin ?? "", link_site: p.link_site ?? "",
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message);
    setSalvando(true);
    const d = parsed.data;
    const { error } = await supabase.from("profiles").update({
      ...Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v === "" ? null : v])),
      nome: d.nome, username: d.username,
      status_profissional: p.status_profissional,
      visivel_recrutadores: p.visivel_recrutadores,
    }).eq("id", p.id);
    setSalvando(false);
    if (error) toast.error(error.code === "23505" ? "Esse nome de usuário já está em uso" : "Não foi possível salvar");
    else toast.success("Perfil salvo!");
  }

  const campo = (k: keyof Profile, label: string, ph = "") => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} placeholder={ph} value={(p[k] as string | null) ?? ""} onChange={(e) => set(k, e.target.value as never)} />
    </div>
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold">Meu perfil</h1>
        <Link to="/professor/$usuario" params={{ usuario: p.username }} className="text-sm text-primary hover:underline">
          Ver página pública
        </Link>
      </div>
      <form onSubmit={salvar} className="mt-6 space-y-5 rounded-xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {campo("nome", "Nome")}
          {campo("username", "Nome de usuário")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={4} value={p.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {campo("formacao", "Formação", "Ex.: Mestre em Educação")}
          {campo("area_atuacao", "Área de atuação")}
          {campo("cidade", "Cidade")}
          {campo("estado", "Estado (UF)", "SP")}
          {campo("link_lattes", "Currículo Lattes", "https://")}
          {campo("link_linkedin", "LinkedIn", "https://")}
        </div>
        {campo("link_site", "Site", "https://")}

        <div className="space-y-1.5">
          <Label>Status profissional</Label>
          <Select value={p.status_profissional ?? undefined} onValueChange={(v) => set("status_profissional", v as Status)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {statusOpcoes.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <span>
            <span className="block font-medium">Visível para recrutadores</span>
            <span className="text-sm text-muted-foreground">Permite que escolas e instituições encontrem seu perfil.</span>
          </span>
          <Switch checked={p.visivel_recrutadores} onCheckedChange={(v) => set("visivel_recrutadores", v)} />
        </label>
        <Button type="submit" disabled={salvando}>{salvando ? "Salvando…" : "Salvar perfil"}</Button>
      </form>
    </main>
  );
}
