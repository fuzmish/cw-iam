export interface SubstringMatch {
  value: string
  indices: [number, number][]
  key: string
}

export interface SearchResult<T> {
  item: T
  matches: SubstringMatch[]
  refIndex?: number
}

export function substringMatch(
  haystack: string,
  needle: string,
  key: string
): SubstringMatch | undefined {
  if (!needle) return undefined
  const lowerHay = haystack.toLowerCase()
  const lowerNeedle = needle.toLowerCase()
  const start = lowerHay.indexOf(lowerNeedle)
  if (start === -1) return undefined
  return {
    value: haystack,
    indices: [[start, start + needle.length - 1]],
    key
  }
}

export function searchWithIndices<T>(
  items: T[],
  needle: string,
  keyFn: (item: T) => string,
  keyName: string
): { item: T; matches: SubstringMatch[] }[] {
  if (!needle) return items.map(item => ({ item, matches: [] }))
  const result: { item: T; matches: SubstringMatch[] }[] = []
  for (const item of items) {
    const match = substringMatch(keyFn(item), needle, keyName)
    if (match) {
      result.push({ item, matches: [match] })
    }
  }
  return result
}
