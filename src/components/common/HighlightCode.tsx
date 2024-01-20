import { Emitter, HLJSOptions, HighlightOptions } from "highlight.js"
import hljs from "highlight.js/lib/core"
import json from "highlight.js/lib/languages/json"
import { ReactNode } from "react"

const AVAILABLE_LANGUAGES = { json } as const

interface HighlightNode {
  scope?: string
  language?: string
  sublanguage?: boolean
}

interface JsxHighlightNode extends HighlightNode {
  parent?: JsxHighlightNode
  children: ReactNode[]
}

class JsxEmitter implements Emitter {
  options: HLJSOptions
  node: JsxHighlightNode

  constructor(options: HLJSOptions) {
    this.options = options
    this.node = { children: [] }
  }
  // taken from https://github.com/highlightjs/highlight.js/blob/14a5dcf36c8ea993d646fc37f27fbaabd086c7d5/src/lib/html_renderer.js#L27C1-L47C3
  private scopeToCSSClass(name: string): string {
    const prefix = this.options.classPrefix
    // sub-language
    if (name.startsWith("language:")) {
      return name.replace("language:", "language-")
    }
    // tiered scope: comment.line
    if (name.includes(".")) {
      const pieces = name.split(".")
      return [`${prefix}${pieces.shift()}`, ...pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`)].join(" ")
    }
    // simple scope
    return `${prefix}${name}`
  }
  __addSublanguage(emitter: Emitter, subLanguageName: string): void {
    const node: HighlightNode = { sublanguage: true }
    if (subLanguageName) {
      node.language = subLanguageName
      node.scope = `language:${subLanguageName}`
    }
    this.openNode(node)
  }
  openNode(node: string | HighlightNode): void {
    if (typeof node === "string") {
      node = { scope: node }
    }
    this.node = { ...node, parent: this.node, children: [] }
  }
  closeNode(): void {
    const { parent, children, scope } = this.node
    if (!parent) {
      return
    }
    if (children.length) {
      parent.children.push(
        <span className={scope ? this.scopeToCSSClass(scope) : undefined} key={parent.children.length}>
          {...children}
        </span>
      )
    }
    this.node = parent
  }
  addText(text: string): void {
    this.node.children.push(text)
  }
  startScope(scope: string): void {
    this.openNode(scope)
  }
  endScope(): void {
    this.closeNode()
  }
  finalize(): void {
    // close all nodes
    do {
      this.closeNode()
    } while (this.node.parent)
  }
  toHTML(): string {
    return "" // dummy response
  }
}

export function HighlightCode({
  code,
  language,
  options = {},
  highlightOptions = {}
}: {
  code: string
  language: keyof typeof AVAILABLE_LANGUAGES
  options?: Partial<HLJSOptions>
  highlightOptions?: Omit<HighlightOptions, "language">
}) {
  const instance = hljs.newInstance()
  instance.configure({ ...options, __emitter: JsxEmitter })
  instance.registerLanguage(language, AVAILABLE_LANGUAGES[language])
  const result = instance.highlight(code, { ...highlightOptions, language })

  return (
    <pre>
      <code className="hljs">{(result._emitter as JsxEmitter).node.children}</code>
    </pre>
  )
}
