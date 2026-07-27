import { profile } from "@/lib/content"
import { BrandIcon } from "@/components/site/BrandIcon"

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden">
      {/* Contact row */}
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-16 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2 font-mono text-sm text-muted-foreground">
          <a
            href={`mailto:${profile.email}`}
            className="w-fit transition-colors hover:text-foreground"
          >
            {profile.email}
          </a>
          <a
            href={profile.calendar}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit transition-colors hover:text-foreground"
          >
            book time →
          </a>
        </div>

        <nav
          aria-label="Social links"
          className="flex items-center gap-5 font-mono text-sm text-muted-foreground"
        >
          <a
            href={profile.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`X, ${profile.xHandle}`}
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <BrandIcon name="x" size={16} />
            <span>{profile.xHandle}</span>
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="transition-colors hover:text-foreground"
          >
            <BrandIcon name="linkedin" size={18} />
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="transition-colors hover:text-foreground"
          >
            <BrandIcon name="github" size={18} />
          </a>
        </nav>
      </div>

      {/* Fine print above the signature */}
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {profile.location.split(",")[0]} · © {YEAR}
        </p>
      </div>

      {/* Giant ghosted wordmark — flush at the viewport bottom, clipped by the
          overflow-hidden footer container. */}
      <div
        aria-hidden="true"
        className="-mb-[0.26em] select-none text-center font-display leading-none tracking-[0.02em]"
        style={{
          fontSize: "clamp(86px, 18vw, 300px)",
          backgroundImage:
            "linear-gradient(rgb(26,19,16) 0%, rgb(38,29,23) 42%, rgb(50,38,30) 74%, rgb(74,58,46) 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          maskImage:
            "linear-gradient(rgb(0,0,0) 0%, rgb(0,0,0) 58%, rgba(0,0,0,0.45) 84%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(rgb(0,0,0) 0%, rgb(0,0,0) 58%, rgba(0,0,0,0.45) 84%, transparent 100%)",
        }}
      >
        MANUEL
      </div>
    </footer>
  )
}
