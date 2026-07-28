"use client"

import { memo, useMemo, type ReactNode } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { Chart, parseChartSpec } from "@/components/chat/Chart"

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

// Stable module-level plugin array so react-markdown doesn't re-instantiate
// plugins on every render (a new [remarkGfm] literal each render defeats its
// internal memoization).
const REMARK_PLUGINS = [remarkGfm]

/**
 * Extracts the raw text of a markdown code node's single text child.
 * react-markdown passes fenced-block content as the code element's children.
 */
function codeText(children: ReactNode): string {
  if (typeof children === "string") return children
  if (Array.isArray(children)) return children.map(codeText).join("")
  return ""
}

/**
 * Markdown renderers styled for the espresso palette. Headings in cream, code
 * in mono on a subtle glass background, links in tan, tidy lists. A ```chart
 * fenced block is intercepted and rendered as a real <Chart> instead of code.
 * react-markdown is XSS-safe by default (no raw HTML passthrough).
 *
 * Built as a factory so the ```chart renderer can know whether the message is
 * still streaming. While streaming, a chart block may only be partially
 * received — parsing its half-written JSON would render code, then flip to a
 * chart the moment the closing fence lands, which reads as a flicker. So while
 * streaming we render the raw chart source as plain code and only swap to the
 * real <Chart> once the stream is done and the block is complete.
 */
function buildComponents(streaming: boolean): Components {
  return {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 font-display text-lg uppercase tracking-tight text-foreground">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-1.5 mt-3 font-mono text-[13px] font-semibold uppercase tracking-[0.1em] text-foreground">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1 mt-2.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-foreground/90">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-2.5 leading-relaxed text-foreground/85 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline decoration-primary/40 decoration-1 underline-offset-2 transition-colors hover:decoration-primary"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-2.5 ml-1 space-y-1 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2.5 ml-4 list-decimal space-y-1 last:mb-0 marker:text-muted-foreground">{children}</ol>,
  li: ({ children }) => (
    <li className="relative pl-4 leading-relaxed text-foreground/85 marker:text-muted-foreground before:absolute before:left-0 before:top-[0.62em] before:h-1 before:w-1 before:rounded-full before:bg-primary/70 [ol_&]:pl-1 [ol_&]:before:hidden">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2.5 border-l-2 border-primary/40 pl-3 text-foreground/70">{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-border/60" />,
  code: ({ className, children, ...props }) => {
    const lang = /language-(\w+)/.exec(className ?? "")?.[1]

    // ```chart fenced block → real chart, but only once streaming is done so a
    // partially-received block doesn't render-then-swap (flicker). While
    // streaming it falls through to the plain code branch below.
    if (lang === "chart" && !streaming) {
      const spec = parseChartSpec(codeText(children))
      if (spec) return <Chart spec={spec} />
    }

    // Fenced code block (has a language) → pre-styled block
    if (lang) {
      return (
        <code className="font-mono text-[12.5px] text-foreground/90" {...props}>
          {children}
        </code>
      )
    }

    // Inline code
    return (
      <code
        className="rounded-[4px] border border-border/60 bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="my-2.5 overflow-x-auto rounded-lg border border-border/60 bg-foreground/[0.05] p-3 leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-2.5 overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-2 py-1.5 text-left font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{children}</th>
  ),
    td: ({ children }) => <td className="border-b border-border/40 px-2 py-1.5 text-foreground/85">{children}</td>,
  }
}

// The two component maps (streaming / settled) are stable module singletons so
// react-markdown gets referentially-identical `components` across renders.
const COMPONENTS_STREAMING = buildComponents(true)
const COMPONENTS_SETTLED = buildComponents(false)

function MessageImpl({
  message,
  streaming = false,
}: {
  message: ChatMessage
  streaming?: boolean
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md border border-primary/25 bg-primary/[0.14] px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    )
  }

  // useMemo keyed on the exact inputs that affect output. When this assistant
  // message is settled (not streaming) and its content is unchanged, the parsed
  // markdown tree is reused verbatim — so a *different* message streaming next
  // to it never re-parses this one.
  const rendered = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        components={streaming ? COMPONENTS_STREAMING : COMPONENTS_SETTLED}
      >
        {message.content}
      </ReactMarkdown>
    ),
    [message.content, streaming]
  )

  return <div className="max-w-[92%] text-[14px]">{rendered}</div>
}

export const Message = memo(MessageImpl)
