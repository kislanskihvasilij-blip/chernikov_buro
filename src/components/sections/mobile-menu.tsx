import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { CONTACTS, NAV, SOCIALS } from "@/data/site"

interface MobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (href: string) => (e: React.MouseEvent) => void
}

/** Phone navigation drawer; loaded on demand by the header. */
export default function MobileMenu({ open, onOpenChange, onNavigate }: MobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-night text-on-night">
        <SheetTitle className="sr-only">Меню</SheetTitle>
        <SheetDescription className="sr-only">Разделы сайта и контакты</SheetDescription>
        <div className="flex h-full flex-col px-6 pt-20 pb-8">
          <ul className="space-y-1">
            {NAV.map((link, i) => (
              <li key={link.href} className="animate-in fade-in slide-in-from-right-4 fill-mode-both" style={{ animationDelay: `${80 + i * 50}ms` }}>
                <a href={link.href} onClick={onNavigate(link.href)} className="block py-2 font-serif text-3xl tracking-[-0.02em] transition hover:text-glow-soft">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-4 border-t border-on-night/10 pt-6">
            <a href={CONTACTS.phoneHref} className="block font-mono text-lg">
              {CONTACTS.phoneDisplay}
            </a>
            <div className="flex flex-wrap gap-2">
              {SOCIALS.map((s) => (
                <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-on-night/20 px-3 py-1.5 text-xs transition hover:border-glow">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
