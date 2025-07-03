import type { ReactNode } from "react"
import type { SubstringMatch } from "../lib/search"

export function HighlightMatch({
  value,
  indices,
  className = "highlight"
}: Pick<SubstringMatch, "value" | "indices"> & { className?: string }): ReactNode {
  if (!value || !indices) {
    return value
  }
  const result: ReactNode[] = []
  let current = 0
  for (const [start, end] of indices) {
    result.push(value.slice(current, start))
    result.push(<span className={className}>{value.slice(start, end + 1)}</span>)
    current = end + 1
  }
  if (current < value.length) {
    result.push(value.slice(current))
  }
  return result
}
