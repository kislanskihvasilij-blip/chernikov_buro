import * as React from "react"
import { ArrowUpRight, Mail, MapPin, Phone, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { GlowField } from "@/components/ui/glow-field"
import { Input, Textarea } from "@/components/ui/input"
import { CONTACTS, LEGAL, SOCIALS } from "@/data/site"
import { buildLeadMessage, isValidPhone, mailtoHref, sendLeadToWhatsapp, whatsappHref, type Lead } from "@/lib/leads"
import { useRequest } from "@/lib/request-store"
import { formatPrice } from "@/lib/utils"

type Status = "idle" | "sent" | "blocked"

export function Contact() {
  const rootRef = React.useRef<HTMLElement>(null)
  const { lines, count, total, setOpen, toLeadLines } = useRequest()
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [comment, setComment] = React.useState("")
  const [consent, setConsent] = React.useState(false)
  const [touched, setTouched] = React.useState(false)
  const [status, setStatus] = React.useState<Status>("idle")
  const [lastLead, setLastLead] = React.useState<Lead | null>(null)

  const errors = {
    name: name.trim().length < 2 ? "Как к вам обращаться?" : null,
    phone: !isValidPhone(phone) ? "Укажите телефон, например +7 900 000-00-00" : null,
    consent: !consent ? "Нужно согласие на обработку данных" : null,
  }
  const hasErrors = Object.values(errors).some(Boolean)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (hasErrors) return
    const lead: Lead = { name, phone, comment, items: toLeadLines() }
    setLastLead(lead)
    setStatus(sendLeadToWhatsapp(lead) ? "sent" : "blocked")
  }

  return (
    <section ref={rootRef} id="contact" data-header="dark" aria-labelledby="contact-title" className="relative isolate overflow-hidden bg-night px-5 py-24 text-on-night md:px-10 md:py-32">
      <GlowField className="absolute inset-0 -z-10" rootRef={rootRef} leak={1.15} />
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0 -z-[5]" />

      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow mb-6 text-on-night-muted">Контакты</p>
          <h2 id="contact-title" className="text-[clamp(38px,5vw,76px)] leading-[0.98] font-medium tracking-[-0.045em]">
            Подберём свет
            <br />
            <span className="font-serif font-normal italic text-glow">под ваш интерьер</span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-on-night/70">
            Оставьте телефон — рассчитаем комплектацию и предложим варианты. Или напишите сразу в удобный мессенджер.
          </p>

          <ul className="mt-10 space-y-4 text-[15px]">
            <li>
              <a href={CONTACTS.phoneHref} className="inline-flex items-center gap-3 font-mono text-xl transition hover:text-glow-soft">
                <Phone className="size-4 text-glow" /> {CONTACTS.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACTS.email}`} className="inline-flex items-center gap-3 transition hover:text-glow-soft">
                <Mail className="size-4 text-glow" /> {CONTACTS.email}
              </a>
            </li>
            <li>
              <a href={CONTACTS.mapHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 transition hover:text-glow-soft">
                <MapPin className="size-4 text-glow" /> {CONTACTS.address}
                <ArrowUpRight className="size-3.5 opacity-60" />
              </a>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-2">
            {SOCIALS.map((s) => (
              <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-on-night/15 px-4 py-2 text-sm transition hover:border-glow/70 hover:bg-on-night/5 hover:text-glow-soft">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <GlowCard className="rounded-2xl border border-on-night/10 bg-night-2/80 p-6 backdrop-blur-md md:p-9">
          {status === "idle" ? (
            <form noValidate onSubmit={handleSubmit} className="space-y-5">
              {count > 0 && (
                <div className="flex items-center justify-between gap-4 rounded-lg border border-glow/25 bg-glow/[0.06] px-4 py-3 text-sm">
                  <span>
                    В корзине {count} {count === 1 ? "позиция" : count < 5 ? "позиции" : "позиций"} · <span className="font-mono">{formatPrice(total)}</span>
                  </span>
                  <button type="button" onClick={() => setOpen(true)} className="cursor-pointer text-glow-soft underline-offset-4 hover:underline">
                    Изменить
                  </button>
                </div>
              )}
              <Field label="Имя" error={touched ? errors.name : null}>
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Анна" className="border-on-night/15" aria-invalid={touched && !!errors.name} />
              </Field>
              <Field label="Телефон" error={touched ? errors.phone : null}>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 900 000-00-00" className="border-on-night/15" aria-invalid={touched && !!errors.phone} />
              </Field>
              <Field label="Что ищете (необязательно)">
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Например: светильник над обеденным столом 1,8 м" className="border-on-night/15" />
              </Field>
              <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-on-night/70">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--ember)]" />
                <span>
                  Согласен на{" "}
                  <a href={LEGAL.personalDataHref} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-glow-soft">
                    обработку персональных данных
                  </a>{" "}
                  и с{" "}
                  <a href={LEGAL.privacyHref} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-glow-soft">
                    политикой конфиденциальности
                  </a>
                </span>
              </label>
              {touched && errors.consent && <p className="text-[13px] text-[#f0a080]">{errors.consent}</p>}
              <Button type="submit" variant="ember" size="lg" className="w-full">
                <Send /> Отправить в WhatsApp
              </Button>
              <p className="text-center text-xs text-on-night/50">Откроется WhatsApp с готовым сообщением — останется нажать «Отправить».</p>
            </form>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
              <span className="grid size-16 place-items-center rounded-full bg-glow/15 text-glow shadow-[0_0_60px_-10px_rgb(255_160_90/0.8)]">
                <Send className="size-6" />
              </span>
              <h3 className="mt-6 font-serif text-3xl">{status === "sent" ? "Почти готово" : "Откройте WhatsApp"}</h3>
              <p className="mt-3 max-w-sm text-on-night/70">
                {status === "sent"
                  ? "Мы открыли WhatsApp с вашей заявкой — отправьте сообщение, и мы свяжемся с вами."
                  : "Браузер заблокировал новое окно. Откройте чат по кнопке ниже или напишите на почту."}
              </p>
              {lastLead && (
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Button variant="ember" asChild>
                    <a href={whatsappHref(buildLeadMessage(lastLead))} target="_blank" rel="noopener noreferrer">
                      Открыть WhatsApp
                    </a>
                  </Button>
                  <Button variant="night" asChild>
                    <a href={mailtoHref("Заявка с сайта Черников Бюро", buildLeadMessage(lastLead))}>Написать на почту</a>
                  </Button>
                </div>
              )}
              <button type="button" onClick={() => setStatus("idle")} className="mt-6 cursor-pointer text-sm text-on-night/60 underline-offset-4 hover:underline">
                Вернуться к форме
              </button>
              {lines.length > 0 && <p className="sr-only">Позиций в корзине: {count}</p>}
            </div>
          )}
        </GlowCard>
      </div>
    </section>
  )
}

function Field({ label, error, children }: { label: string; error?: string | null; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[11px] tracking-[0.12em] text-on-night-muted uppercase">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-[13px] text-[#f0a080]">{error}</span>}
    </label>
  )
}
