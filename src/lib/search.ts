export interface SubstringMatch {
  value: string
  indices: [number, number][]
  key: string
}

export interface SearchResult<T> {
  item: T
  matches: SubstringMatch[]
}

export function search<T>(
  items: T[],
  keyFn: (item: T) => string,
  value: string
): { item: T; match?: SubstringMatch }[] {
  if (!value) return items.map(item => ({ item }))
  const v = value.toLowerCase()
  return items
    .map(item => {
      const str = keyFn(item)
      const lowerStr = str.toLowerCase()
      const start = lowerStr.indexOf(v)
      if (start === -1) return undefined
      return {
        item,
        match: {
          value: str,
          indices: [[start, start + value.length - 1]],
          key: ""
        }
      }
    })
    .filter((x): x is { item: T; match: SubstringMatch } => !!x)
}
