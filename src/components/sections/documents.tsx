import { ArrowUpRight, FileText } from "lucide-react"

import { GlowCard } from "@/components/ui/glow-card"
import { DOCUMENTS, PARTNERS } from "@/data/site"
import { asset } from "@/lib/utils"

export function Documents() {
  return (
    <section id="documents" aria-labelledby="documents-title" className="border-t bg-muted/60 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-14 xl:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow mb-6 text-muted-foreground">Документы</p>
          <h2 id="documents-title" className="max-w-md text-[clamp(28px,3vw,44px)] leading-[1.05] font-medium tracking-[-0.035em]">
            Всё, что нужно для <span className="font-serif font-normal text-primary italic">установки и спокойствия</span>
          </h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {DOCUMENTS.map((doc) => (
            <li key={doc.title}>
              <GlowCard as="a" href={doc.href} target="_blank" rel="noopener noreferrer" className="group flex h-full min-h-[180px] flex-col rounded-xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-warm">
                <span className="flex items-center justify-between">
                  <FileText className="size-6 text-primary" />
                  <ArrowUpRight className="size-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                </span>
                <span className="mt-auto pt-8 font-serif text-xl leading-tight">{doc.title}</span>
                <span className="mt-2 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">Открыть</span>
              </GlowCard>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-20 max-w-[1440px] border-t pt-10">
        <p className="mb-8 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Наши партнёры</p>
        <ul className="flex flex-wrap items-center gap-x-16 gap-y-8">
          {PARTNERS.map((p) => (
            <li key={p.logo}>
              <img src={asset(p.logo)} alt={p.name} loading="lazy" className="h-7 w-auto opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0 md:h-9" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
