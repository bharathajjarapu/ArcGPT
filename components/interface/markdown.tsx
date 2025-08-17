import React, { Suspense, useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import Image from "next/image"
import { Loader2 } from 'lucide-react'

import { cn } from "@/lib/utils"
import { CopyButton } from "./copy"

interface MarkdownRendererProps {
  children: string
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  const normalized = normalizeMathDelimiters(children)
  return (
    <Markdown
      remarkPlugins={[
        remarkGfm,
        [remarkMath, { singleDollarTextMath: true }] as any,
      ]}
      rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false, trust: true }] as any]}
      components={COMPONENTS}
      className="space-y-3"
    >
      {normalized}
    </Markdown>
  )
}

function normalizeMathDelimiters(input: string): string {
  // Split out fenced code blocks to avoid touching math-like text inside
  const fencedSplit = input.split(/(```[\s\S]*?```)/g)
  const processInline = (segment: string) => {
    // Split out inline code as well
    const inlineSplit = segment.split(/(`[^`]*`)/g)
    return inlineSplit
      .map((part) => {
        if (part.startsWith("`") && part.endsWith("`")) return part
        // Convert \[ ... \] (block math) → $$ ... $$
        let replaced = part.replace(/\\\[([\s\S]*?)\\\]/g, (_m, p1) => `$$${p1}$$`)
        // Convert \( ... \) (inline math) → $ ... $
        replaced = replaced.replace(/\\\(([^]*?)\\\)/g, (_m, p1) => `$${p1}$`)
        return replaced
      })
      .join("")
  }
  return fencedSplit
    .map((seg) => (seg.startsWith("```") ? seg : processInline(seg)))
    .join("")
}

function formatLanguageLabel(language: string): string {
  const normalized = language.toLowerCase()
  switch (normalized) {
    case "ts":
    case "typescript":
      return "TypeScript"
    case "tsx":
      return "TSX"
    case "js":
    case "javascript":
      return "JavaScript"
    case "jsx":
      return "JSX"
    case "py":
    case "python":
      return "Python"
    case "sh":
    case "bash":
    case "zsh":
      return "Shell"
    case "json":
      return "JSON"
    case "html":
      return "HTML"
    case "css":
      return "CSS"
    case "md":
    case "markdown":
      return "Markdown"
    case "go":
      return "Go"
    case "java":
      return "Java"
    case "c":
      return "C"
    case "cpp":
    case "c++":
      return "C++"
    case "rs":
    case "rust":
      return "Rust"
    case "php":
      return "PHP"
    case "ruby":
    case "rb":
      return "Ruby"
    case "yaml":
    case "yml":
      return "YAML"
    default:
      return language.toUpperCase()
  }
}

interface HighlightedPre extends React.HTMLAttributes<HTMLPreElement> {
  children: string
  language: string
}

const HighlightedPre = React.memo(
  async ({ children, language, ...props }: HighlightedPre) => {
    const { codeToTokens, bundledLanguages } = await import("shiki")

    if (!(language in bundledLanguages)) {
      return <pre {...props}>{children}</pre>
    }

    const { tokens } = await codeToTokens(children, {
      lang: language as keyof typeof bundledLanguages,
      defaultColor: false,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    })

    return (
      <pre {...props}>
        <code>
          {tokens.map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              <span>
                {line.map((token, tokenIndex) => {
                  const style =
                    typeof token.htmlStyle === "string"
                      ? undefined
                      : token.htmlStyle

                  return (
                    <span
                      key={tokenIndex}
                      className="text-shiki-light bg-shiki-light-bg dark:text-shiki-dark dark:bg-shiki-dark-bg"
                      style={style}
                    >
                      {token.content}
                    </span>
                  )
                })}
              </span>
              {lineIndex !== tokens.length - 1 && "\n"}
            </React.Fragment>
          ))}
        </code>
      </pre>
    )
  }
)
HighlightedPre.displayName = "HighlightedCode"

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode
  className?: string
  language: string
}

const CodeBlock = ({
  children,
  className,
  language,
  ...restProps
}: CodeBlockProps) => {
  const code =
    typeof children === "string"
      ? children
      : childrenTakeAllStringContents(children)

  const preClass = cn(
    "relative overflow-x-auto rounded-lg border border-foreground/20 bg-muted/40 p-4 pt-10 font-mono text-sm leading-relaxed shadow-sm transition-colors hover:border-foreground/30 [scrollbar-width:none] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/10 hover:[&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent",
    className
  )

  return (
    <div className="group/code relative mb-4">
      {language && (
        <div className="pointer-events-none absolute left-3 top-2">
          <span className="rounded-md border border-foreground/10 bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground/70 shadow-sm backdrop-blur-sm">
            {formatLanguageLabel(language)}
          </span>
        </div>
      )}
      <Suspense
        fallback={
          <pre className={preClass} {...restProps}>
            {children}
          </pre>
        }
      >
        <HighlightedPre language={language} className={preClass}>
          {code}
        </HighlightedPre>
      </Suspense>

      <div className="invisible absolute right-2 top-2 flex space-x-1 rounded-lg p-1 opacity-0 transition-all duration-200 group-hover/code:visible group-hover/code:opacity-100">
        <CopyButton value={code} copyMessage="Copied code to clipboard" />
      </div>
    </div>
  )
}

function childrenTakeAllStringContents(element: any): string {
  if (typeof element === "string") {
    return element
  }

  if (element?.props?.children) {
    let children = element.props.children

    if (Array.isArray(children)) {
      return children
        .map((child) => childrenTakeAllStringContents(child))
        .join("")
    } else {
      return childrenTakeAllStringContents(children)
    }
  }

  return ""
}

const MarkdownImage = ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <span className="inline-block relative group">
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-6 w-6 animate-spin" />
        </span>
      )}
      
      {(() => {
        const { width: rawWidth, height: rawHeight, ...restImgProps } = props
        const parsedWidth = typeof rawWidth === 'string' ? parseInt(rawWidth, 10) : rawWidth
        const parsedHeight = typeof rawHeight === 'string' ? parseInt(rawHeight, 10) : rawHeight
        const safeWidth = parsedWidth && !Number.isNaN(parsedWidth as number) ? (parsedWidth as number) : 700
        const safeHeight = parsedHeight && !Number.isNaN(parsedHeight as number) ? (parsedHeight as number) : 400

        return (
          <Image
            src={src || ''}
            alt={alt || ''}
            width={safeWidth}
            height={safeHeight}
            className="rounded-md"
            onLoadingComplete={() => setIsLoading(false)}
            {...restImgProps}
          />
        )
      })()}
      
      <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton
          value={src || ''}
          onClick={() => {
            const link = document.createElement('a')
            link.href = src || ''
            link.download = alt || 'image'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }}
        />
      </span>
    </span>
  )
}



const COMPONENTS = {
  h1: withClass("h1", "text-2xl font-semibold"),
  h2: withClass("h2", "font-semibold text-xl"),
  h3: withClass("h3", "font-semibold text-lg"),
  h4: withClass("h4", "font-semibold text-base"),
  h5: withClass("h5", "font-medium"),
  strong: withClass("strong", "font-semibold"),
  a: withClass("a", "text-primary underline underline-offset-2"),
  blockquote: withClass("blockquote", "border-l-2 border-primary pl-4"),
  code: ({ children, className, node, ...rest }: any) => {
    const match = /language-(\w+)/.exec(className || "")
    return match ? (
      <CodeBlock className={className} language={match[1]} {...rest}>
        {children}
      </CodeBlock>
    ) : (
      <code
        className={cn(
          "font-mono text-[0.9em] [:not(pre)>&]:rounded-md [:not(pre)>&]:border [:not(pre)>&]:border-foreground/10 [:not(pre)>&]:bg-muted/40 [:not(pre)>&]:px-1.5 [:not(pre)>&]:py-0.5 [:not(pre)>&]:text-foreground/90"
        )}
        {...rest}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }: any) => children,
  ol: withClass("ol", "list-decimal space-y-2 pl-6"),
  ul: withClass("ul", "list-disc space-y-2 pl-6"),
  li: withClass("li", "my-1.5"),
  table: withClass(
    "table",
    "w-full border-collapse overflow-y-auto rounded-md border border-foreground/20"
  ),
  th: withClass(
    "th",
    "border border-foreground/20 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
  ),
  td: withClass(
    "td",
    "border border-foreground/20 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
  ),
  tr: withClass("tr", "m-0 border-t p-0 even:bg-muted"),
  p: withClass("p", "whitespace-pre-wrap"),
  hr: withClass("hr", "border-foreground/20"),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <MarkdownImage {...props} />
  ),
  // Let rehype-katex render math; no custom components needed here
}

function withClass(Tag: keyof JSX.IntrinsicElements, classes: string) {
  const Component = ({ node, ...props }: any) => (
    <Tag className={classes} {...props} />
  )
  Component.displayName = Tag
  return Component
}

