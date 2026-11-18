import { type FormEvent, type ReactNode, useEffect, useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { StreamingBlock } from "./StreamingBlock"

type Page = "agenda" | "espacios" | "contacto"
type IconProps = { size?: number; strokeWidth?: number }

const spaceImages = [
  "https://images.unsplash.com/photo-1590920212394-a92a59d15f7f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1584352604394-c2c6f06e00c1?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1612443016610-00c5fa0ec439?auto=format&fit=crop&w=900&q=85",
]

type EventImage = { src: string; alt: string }

type AgendaEvent = {
  id: string
  type: "EVENTO" | "LANZAMIENTO"
  title: string
  description: string
  date: string | null
  cover: EventImage | null
  content: string
  attachments: EventImage[]
}

type AgendaState =
  | { status: "loading" | "error" }
  | { status: "ready"; events: AgendaEvent[] }

const isEventPage = document.getElementById("root")?.dataset.page === "evento"
const siteRoot = new URL(isEventPage ? "../" : "./", window.location.href)
const eventsUrl = new URL("agenda/events.json", siteRoot)

function eventHref(id: string) {
  const url = new URL("evento/", siteRoot)
  url.searchParams.set("id", id)
  return url.href
}

function eventImageSrc(image: EventImage) {
  return new URL(image.src, siteRoot).href
}
const dateOnly = /^\d{4}-\d{2}-\d{2}$/
const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  timeZone: "Europe/Madrid",
})
const timeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
})

const spaces = [
  {
    kicker: "LAVAPIÉS · MADRID",
    title: "Quiosco Morrison",
    description:
      "Música, libros y encuentros a pie de calle. Un pequeño refugio cultural en pleno barrio.",
    meta: "QUIOSCO / TIENDA",
    image: spaceImages[0],
    alt: "Persona seleccionando música en una sesión",
  },
  {
    kicker: "POBLENOU · BARCELONA",
    title: "Nave 13",
    description:
      "Una antigua fábrica transformada en espacio para conciertos, instalaciones y residencias.",
    meta: "SALA / TALLER",
    image: spaceImages[1],
    alt: "Artista trabajando con una mesa de sonido",
  },
  {
    kicker: "RUZAFA · VALENCIA",
    title: "La Trastienda",
    description:
      "Galería independiente, estudio compartido y punto de encuentro para nuevas escenas.",
    meta: "GALERÍA / ESTUDIO",
    image: spaceImages[2],
    alt: "DJ mezclando en una sala",
  },
]

function SunIcon({ size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}

function MoonIcon({ size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M21 15.5A9 9 0 1 1 8.5 3 7 7 0 0 0 21 15.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}

function UserIcon({ size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M4.5 21a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}

function ArrowIcon({ size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}

function MenuIcon({ size = 22, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M4 7h16M4 17h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}

function CloseIcon({ size = 22, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}

function Logo() {
  return (
    <button
      className="logo"
      onClick={() => {
        if (isEventPage) window.location.assign(siteRoot)
        else window.scrollTo({ behavior: "smooth", top: 0 })
      }}
      type="button"
      aria-label="OTB — inicio"
    >
      <span>OUT</span>
      <span className="logo-outline">THE</span>
      <span>BOX</span>
    </button>
  )
}

function Header({
  page,
  setPage,
  dark,
  setDark,
  openLogin,
}: {
  page: Page
  setPage: (page: Page) => void
  dark: boolean
  setDark: (value: boolean) => void
  openLogin: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = (nextPage: Page) => {
    setPage(nextPage)
    setMenuOpen(false)
    window.scrollTo({ behavior: "smooth", top: 0 })
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav
          aria-label="Navegación principal"
          className={menuOpen ? "main-nav open" : "main-nav"}
        >
          {(["agenda", "espacios", "contacto"] as Page[]).map((item) => (
            <button
              className={page === item ? "nav-link active" : "nav-link"}
              key={item}
              onClick={() => navigate(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button
            aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
            className="icon-button"
            onClick={() => setDark(!dark)}
            type="button"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="login-button" onClick={openLogin} type="button">
            <UserIcon size={18} />
            <span>Acceder</span>
          </button>
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="icon-button menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  )
}

type EditorialCardProps = {
  image?: string
  alt: string
  kicker: string
  title: string
  description: string
  footer: ReactNode
  tone?: "release"
}

function EditorialCard({
  image,
  alt,
  kicker,
  title,
  description,
  footer,
  tone,
}: EditorialCardProps) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <article className="editorial-card" data-tone={tone}>
      <div className="card-image-wrap">
        {image && !imageFailed ? (
          <img
            alt={alt}
            className="card-image"
            loading="lazy"
            onError={() => setImageFailed(true)}
            referrerPolicy="no-referrer"
            src={image}
          />
        ) : (
          <div aria-hidden="true" className="card-image-placeholder">
            <div>OUT<br />THE<br />BOX</div>
          </div>
        )}
      </div>
      <div className="card-copy">
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        {description && <p className="card-description">{description}</p>}
        <div className="card-footer">{footer}</div>
      </div>
    </article>
  )
}

function PageIntro({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <div className="page-intro">
      <p className="section-number">{number}</p>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  )
}

function useAgenda() {
  const [agenda, setAgenda] = useState<AgendaState>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadEvents() {
      try {
        const response = await fetch(eventsUrl, {
          cache: "no-cache",
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const events: AgendaEvent[] = await response.json()
        if (!Array.isArray(events)) throw new Error("Agenda sin lista de eventos")
        if (!controller.signal.aborted) setAgenda({ status: "ready", events })
      } catch {
        if (!controller.signal.aborted) setAgenda({ status: "error" })
      }
    }

    void loadEvents()
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setAgenda({ status: "loading" })
    setAttempt((previous) => previous + 1)
  }

  return { agenda, retry }
}

function AgendaError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="agenda-message">
      <p role="alert">{message}</p>
      <button className="text-button" onClick={retry} type="button">
        Volver a intentar
      </button>
    </div>
  )
}

function EventDate({ date }: { date: string | null }) {
  if (!date) return <div className="date-block"><strong>FECHA POR CONFIRMAR</strong></div>
  return (
    <time className="date-block" dateTime={date}>
      <strong>{dateFormatter.format(new Date(date)).toLocaleUpperCase("es-ES")}</strong>
      {!dateOnly.test(date) && <span>{timeFormatter.format(new Date(date))} H</span>}
    </time>
  )
}

function Agenda() {
  const { agenda, retry } = useAgenda()

  return (
    <main className="page-shell">
      <PageIntro
        number="01"
        title="Lo próximo"
        text="Experiencias sonoras, arte en movimiento y encuentros que merecen salir de la caja."
      />
      <div className="card-list">
        {agenda.status === "loading" && (
          <p className="agenda-message" role="status">Cargando agenda…</p>
        )}
        {agenda.status === "error" && (
          <AgendaError message="No se pudo cargar la agenda." retry={retry} />
        )}
        {agenda.status === "ready" && agenda.events.length === 0 && (
          <p className="agenda-message" role="status">No hay entradas publicadas.</p>
        )}
        {agenda.status === "ready" && agenda.events.map((event) => (
          <EditorialCard
            alt={event.cover?.alt ?? ""}
            description={event.description}
            image={event.cover ? eventImageSrc(event.cover) : undefined}
            key={event.id}
            kicker={event.type === "LANZAMIENTO" ? "LANZAMIENTO" : "EVENTO"}
            title={event.title}
            tone={event.type === "LANZAMIENTO" ? "release" : undefined}
            footer={
              <>
                <EventDate date={event.date} />
                <a aria-label={`Ver ${event.title}`} className="arrow-button" href={eventHref(event.id)}>
                  <ArrowIcon />
                </a>
              </>
            }
          />
        ))}
      </div>
    </main>
  )
}

function EventDetail() {
  const { agenda, retry } = useAgenda()
  const id = new URLSearchParams(window.location.search).get("id")
  const event = agenda.status === "ready" ? agenda.events.find((entry) => entry.id === id) : undefined

  useEffect(() => {
    if (event) document.title = `${event.title} — OUT THE BOX`
  }, [event])

  return (
    <main className="page-shell event-page">
      <a className="primary-button event-back" href={siteRoot.href}>
        <ArrowIcon /> Volver a la agenda
      </a>
      {id && agenda.status === "loading" && (
        <p className="agenda-message" role="status">Cargando entrada…</p>
      )}
      {id && agenda.status === "error" && (
        <AgendaError message="No se pudo cargar la entrada." retry={retry} />
      )}
      {(!id || (agenda.status === "ready" && !event)) && (
        <h1 className="event-title">Entrada no encontrada</h1>
      )}
      {event && (
        <article className="event-article" data-tone={event.type === "LANZAMIENTO" ? "release" : undefined}>
          <header className="event-heading">
            <p className="eyebrow">{event.type === "LANZAMIENTO" ? "LANZAMIENTO" : "EVENTO"}</p>
            <h1 className="event-title">{event.title}</h1>
            <EventDate date={event.date} />
          </header>
          <div className="event-content">
            {event.content && (
              <Markdown
                remarkPlugins={[remarkGfm]}
                skipHtml
                components={{
                  h1: ({ children }) => <h2>{children}</h2>,
                  pre: StreamingBlock,
                  img: ({ src, alt, title }) => src
                    ? <img alt={alt ?? ""} loading="lazy" referrerPolicy="no-referrer" src={src} title={title} />
                    : alt || null,
                }}
              >
                {event.content}
              </Markdown>
            )}
            {event.attachments.map((image) => (
              <figure key={image.src}>
                <img alt={image.alt} loading="lazy" referrerPolicy="no-referrer" src={eventImageSrc(image)} />
              </figure>
            ))}
            {!event.content && event.attachments.length === 0 && (
              <p>Esta entrada aún no tiene contenido publicado.</p>
            )}
          </div>
        </article>
      )}
    </main>
  )
}

function Espacios() {
  return (
    <main className="page-shell">
      <PageIntro
        number="02"
        title="Espacios"
        text="Espacios independientes que sostienen la cultura, conectan escenas y hacen sitio a lo inesperado."
      />
      <div className="card-list">
        {spaces.map((space) => (
          <EditorialCard
            {...space}
            key={space.title}
            footer={
              <>
                <strong className="space-type">{space.meta}</strong>
                <button
                  aria-label={`Ver ${space.title}`}
                  className="arrow-button"
                  type="button"
                >
                  <ArrowIcon />
                </button>
              </>
            }
          />
        ))}
      </div>
    </main>
  )
}

function Contacto() {
  const [sent, setSent] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <main className="page-shell contact-page">
      <PageIntro
        number="03"
        title="Hablemos"
        text="¿Tienes un proyecto, un espacio o una idea difícil de etiquetar? Queremos escucharla."
      />
      <div className="contact-grid">
        <aside className="contact-aside">
          <p className="eyebrow">CONTACTO DIRECTO</p>
          <a href="mailto:hola@outthebox.es">hola@outthebox.es</a>
          <p>
            Madrid · Barcelona
            <br />
            Trabajamos en todas partes.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Instagram">
              Instagram ↗
            </a>
            <a href="#" aria-label="Soundcloud">
              Soundcloud ↗
            </a>
          </div>
        </aside>
        <form className="contact-form" onSubmit={submit}>
          <label>
            <span>Tu nombre</span>
            <input
              name="name"
              placeholder="Nombre o colectivo"
              required
              type="text"
            />
          </label>
          <label>
            <span>Email</span>
            <input
              name="email"
              placeholder="tu@email.com"
              required
              type="email"
            />
          </label>
          <label>
            <span>Cuéntanos</span>
            <textarea
              name="message"
              placeholder="¿Qué tienes entre manos?"
              required
              rows={5}
            />
          </label>
          <button className="primary-button" type="submit">
            {sent ? "Mensaje preparado" : "Enviar mensaje"}
            <ArrowIcon />
          </button>
          {sent && (
            <p className="form-note" role="status">
              Gracias. Te responderemos muy pronto.
            </p>
          )}
        </form>
      </div>
    </main>
  )
}

function LoginModal({ close }: { close: () => void }) {
  const [success, setSuccess] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccess(true)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) =>
      event.key === "Escape" && close()
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [close])

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div
        aria-labelledby="login-title"
        aria-modal="true"
        className="login-modal"
        role="dialog"
      >
        <div className="modal-topline">
          <p className="eyebrow">ÁREA OTB</p>
          <button
            aria-label="Cerrar"
            className="icon-button"
            onClick={close}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <h2 id="login-title">Entra en la caja.</h2>
        <p className="modal-subtitle">
          Guarda eventos y recibe selecciones sin ruido.
        </p>
        {success ? (
          <div className="success-panel">
            <span>✓</span>
            <strong>Todo listo</strong>
            <p>Hemos validado tus datos de acceso.</p>
            <button className="primary-button" onClick={close} type="button">
              Continuar <ArrowIcon />
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={submit}>
            <label>
              <span>Email</span>
              <input
                autoFocus
                name="email"
                placeholder="tu@email.com"
                required
                type="email"
              />
            </label>
            <label>
              <span>Contraseña</span>
              <input
                minLength={6}
                name="password"
                placeholder="Mínimo 6 caracteres"
                required
                type="password"
              />
            </label>
            <button className="primary-button" type="submit">
              Acceder <ArrowIcon />
            </button>
            <button className="text-button" type="button">
              Crear una cuenta
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Footer({ setPage }: { setPage: (page: Page) => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-statement">
        <p>OUT THE BOX © 2026</p>
        {/* <strong>SAL DE LA CAJA !<br />SIN ETIQUETAS.</strong> */}
        <strong>SAL DE LA CAJA !</strong>
      </div>
      <div className="footer-nav">
        {(["agenda", "espacios", "contacto"] as Page[]).map((item) => (
          <button key={item} onClick={() => setPage(item)} type="button">
            {item}
          </button>
        ))}
      </div>
    </footer>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    const section = new URLSearchParams(window.location.search).get("seccion")
    return !isEventPage && (section === "espacios" || section === "contacto") ? section : "agenda"
  })
  const [loginOpen, setLoginOpen] = useState(false)
  const [dark, setDark] = useState(
    () => localStorage.getItem("otb-theme") === "dark",
  )

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light"
    localStorage.setItem("otb-theme", dark ? "dark" : "light")
  }, [dark])

  function navigate(nextPage: Page) {
    if (isEventPage) {
      const url = new URL(siteRoot)
      if (nextPage !== "agenda") url.searchParams.set("seccion", nextPage)
      window.location.assign(url)
    } else {
      setPage(nextPage)
    }
  }

  return (
    <div className="app">
      <Header
        dark={dark}
        openLogin={() => setLoginOpen(true)}
        page={page}
        setDark={setDark}
        setPage={navigate}
      />
      {isEventPage ? <EventDetail /> : (
        <>
          {page === "agenda" && <Agenda />}
          {page === "espacios" && <Espacios />}
          {page === "contacto" && <Contacto />}
        </>
      )}
      <Footer
        setPage={(nextPage) => {
          navigate(nextPage)
          window.scrollTo({ behavior: "smooth", top: 0 })
        }}
      />
      {loginOpen && <LoginModal close={() => setLoginOpen(false)} />}
    </div>
  )
}
