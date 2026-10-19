import { Link } from "@tanstack/react-router";
import { GraduationCap, Instagram, Linkedin, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
            <GraduationCap className="h-5 w-5" /> Ensinar.me
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Conhecimento de professor para professor.</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/termos" className="hover:text-primary">Termos de Uso</Link>
          <Link to="/privacidade" className="hover:text-primary">Privacidade</Link>
          <Link to="/contato" className="hover:text-primary">Contato</Link>
        </nav>
        <div className="flex gap-3 md:justify-end">
          {[
            { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
            { href: "https://linkedin.com", label: "LinkedIn", Icon: Linkedin },
            { href: "https://youtube.com", label: "YouTube", Icon: Youtube },
          ].map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-primary hover:bg-accent">
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
      <p className="border-t py-4 text-center text-xs text-muted-foreground">© 2026 Ensinar.me. Todos os direitos reservados.</p>
    </footer>
  );
}
