import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/entrar", replace: true });
  }

  const link = "rounded-md px-2 py-1 text-sm font-medium hover:text-primary";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-primary">
          <GraduationCap className="h-6 w-6" />
          <span className="hidden sm:inline">Ensinar.me</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link to="/explorar" className={link} activeProps={{ className: "text-primary" }}>Explorar</Link>
          <Link to="/vender" className={link} activeProps={{ className: "text-primary" }}>Quero vender</Link>
          {loading ? null : user ? (
            <>
              <Link to="/perfil" className={link}>Meu perfil</Link>
              <Button variant="outline" size="sm" onClick={sair}>Sair</Button>
            </>
          ) : (
            <>
              <Link to="/entrar" className={link}>Entrar</Link>
              <Button size="sm" asChild>
                <Link to="/cadastrar">Criar conta</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
