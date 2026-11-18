import type { Components } from "react-markdown"

const providers: Record<string, { name: string; path: RegExp; height: number }> = {
  "embed.music.apple.com": {
    name: "Apple Music",
    path: /^\/(?:[a-z]{2}\/)?(?:album|playlist|song|music-video)\/[^/]+\/[^/]+\/?$/,
    height: 450,
  },
  "open.spotify.com": {
    name: "Spotify",
    path: /^\/embed\/(?:album|artist|episode|playlist|show|track)\/[a-zA-Z0-9]+\/?$/,
    height: 352,
  },
  "player-widget.mixcloud.com": {
    name: "Mixcloud",
    path: /^\/widget\/iframe\/?$/,
    height: 130,
  },
  "w.soundcloud.com": {
    name: "SoundCloud",
    path: /^\/player\/?$/,
    height: 166,
  },
  "bandcamp.com": {
    name: "Bandcamp",
    path: /^\/EmbeddedPlayer\/(?:album|track)=\d+(?:\/[^/]+)*\/?$/,
    height: 120,
  },
  "www.bandlab.com": {
    name: "BandLab",
    path: /^\/embed\/?$/,
    height: 202,
  },
  "bandlab.com": {
    name: "BandLab",
    path: /^\/embed\/?$/,
    height: 202,
  },
  "widget.deezer.com": {
    name: "Deezer",
    path: /^\/widget\/(?:auto|dark|light)\/(?:album|artist|episode|playlist|show|track)\/\d+\/?$/,
    height: 300,
  },
  "player.vimeo.com": {
    name: "Vimeo",
    path: /^\/video\/\d+\/?$/,
    height: 360,
  },
  "www.youtube-nocookie.com": {
    name: "YouTube",
    path: /^\/embed\/(?:[a-zA-Z0-9_-]{11}|videoseries)\/?$/,
    height: 315,
  },
  "www.youtube.com": {
    name: "YouTube",
    path: /^\/embed\/(?:[a-zA-Z0-9_-]{11}|videoseries)\/?$/,
    height: 315,
  },
}

function parsePlayer(html: string) {
  // The template is inert. Only a newly created iframe can reach the page.
  const template = document.createElement("template")
  template.innerHTML = html.trim()
  const iframe = template.content.firstElementChild
  if (template.content.childNodes.length !== 1 || iframe?.localName !== "iframe") return null

  const url = URL.parse(iframe.getAttribute("src") ?? "")
  if (!url || url.protocol !== "https:" || url.username || url.password || url.port) return null
  if (!Object.prototype.hasOwnProperty.call(providers, url.hostname)) return null
  const provider = providers[url.hostname]
  if (!provider.path.test(url.pathname)) return null

  const height = iframe.getAttribute("height") ?? ""
  return {
    name: provider.name,
    src: url.href,
    height: /^\d+$/.test(height) ? Math.min(660, Math.max(80, Number(height))) : provider.height,
  }
}

export const StreamingBlock: NonNullable<Components["pre"]> = ({ node, children }) => {
  const code = node?.children[0]
  if (code?.type !== "element" || code.tagName !== "code" ||
      !Array.isArray(code.properties.className) || !code.properties.className.includes("language-html")) {
    return <pre>{children}</pre>
  }

  const html = code.children.map((part) => part.type === "text" ? part.value : "").join("")
  if (!/^\s*<iframe\b/i.test(html)) return <pre>{children}</pre>

  const player = parsePlayer(html)
  if (!player) return <p>Este reproductor no es compatible.</p>

  return (
    <figure className="streaming-player">
      <iframe
        allow="autoplay; encrypted-media; fullscreen"
        height={player.height}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-storage-access-by-user-activation"
        src={player.src}
        title={`Reproductor de ${player.name}`}
      />
      <figcaption>
        <a href={player.src} rel="noopener noreferrer" target="_blank">
          Abrir reproductor de {player.name}
        </a>
      </figcaption>
    </figure>
  )
}
