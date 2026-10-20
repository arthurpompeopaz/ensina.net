import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";

export function StaticPage({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <>
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-12 leading-relaxed">
        <h1 className="text-3xl font-semibold">{titulo}</h1>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
