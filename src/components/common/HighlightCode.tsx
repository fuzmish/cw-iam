import hljs from "highlight.js/lib/core"
import json from "highlight.js/lib/languages/json"
import sanitizeHtml from "sanitize-html"

hljs.registerLanguage("json", json)

export function HighlightCode({
  code,
  language,
  ignoreIllegals
}: {
  code: string
  language: "json"
  ignoreIllegals?: boolean
}) {
  const __html = sanitizeHtml(hljs.highlight(code, { language, ignoreIllegals }).value, {
    allowedTags: ["span"],
    allowedClasses: { span: ["hljs*"] }
  })
  return (
    <pre>
      <code className="hljs" dangerouslySetInnerHTML={{ __html }}></code>
    </pre>
  )
}
