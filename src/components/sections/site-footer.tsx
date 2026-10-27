import { Logo } from "@/components/ui/logo"
import { CONTACTS, LEGAL, NAV, SOCIALS } from "@/data/site"
import { useScrollTo } from "@/lib/smooth-scroll"

export function SiteFooter() {
  const scrollTo = useScrollTo()
  return (
    <footer data-header="dark" className="bg-night-2 px-5 pt-16 pb-8 text-on-night md:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 border-b border-on-night/10 pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo className="w-[200px]" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-on-night/60">Столярное бюро. Светильники и мебель из дерева собственного производства.</p>
          </div>
          <nav aria-label="Разделы">
            <p className="mb-4 font-mono text-[11px] tracking-[0.14em] text-on-night-muted uppercase">Разделы</p>
            <ul className="space-y-2 text-sm">
              {NAV.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollTo(l.href)
                    }}
                    className="text-on-night/75 transition hover:text-glow-soft"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="mb-4 font-mono text-[11px] tracking-[0.14em] text-on-night-muted uppercase">Связь</p>
            <ul className="space-y-2 text-sm text-on-night/75">
              <li>
                <a href={CONTACTS.phoneHref} className="transition hover:text-glow-soft">
                  {CONTACTS.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACTS.email}`} className="transition hover:text-glow-soft">
                  {CONTACTS.email}
                </a>
              </li>
              <li>{CONTACTS.address}</li>
            </ul>
          </div>
          <div>
            <p className="mb-4 font-mono text-[11px] tracking-[0.14em] text-on-night-muted uppercase">Соцсети</p>
            <ul className="space-y-2 text-sm">
              {SOCIALS.map((s) => (
                <li key={s.id}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-on-night/75 transition hover:text-glow-soft">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-8 text-xs text-on-night/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {LEGAL.owner} · ИНН {LEGAL.inn} · ОГРНИП {LEGAL.ogrnip}
          </p>
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <a href={LEGAL.privacyHref} target="_blank" rel="noopener noreferrer" className="transition hover:text-on-night">
              Политика конфиденциальности
            </a>
            <a href={LEGAL.personalDataHref} target="_blank" rel="noopener noreferrer" className="transition hover:text-on-night">
              Обработка персональных данных
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
