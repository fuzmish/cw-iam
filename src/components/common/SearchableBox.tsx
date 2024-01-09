import Fuse, { Expression, FuseOptionKeyObject, FuseResult, IFuseOptions } from "fuse.js"
import { ComponentPropsWithoutRef, ReactNode, SyntheticEvent } from "react"
import { FaFilter, FaFilterCircleXmark } from "react-icons/fa6"
import { ItemContent, Virtuoso } from "react-virtuoso"

export interface FuseSplitResult {
  value: string
  match: boolean
}

export function splitFuseResult<T>(
  result: FuseResult<T>,
  key: string | string[],
  defaultResult: FuseSplitResult[] = [],
  minHighlightLength: number = 2
): FuseSplitResult[] {
  const _key = JSON.stringify(key)
  const match = result.matches?.filter(m => JSON.stringify(m.key) === _key)[0]
  if (!match) {
    return defaultResult
  }
  const { value, indices } = match
  if (!value) {
    return []
  }
  const ret: FuseSplitResult[] = []
  let end = 0
  for (const [from, to] of indices.toSorted(([af, at], [bf, bt]) => (af === bf ? at - bt : af - bf))) {
    if (from < end) {
      // overlapped, ignore this item
      continue
    }
    if (end < from) {
      ret.push({ value: value.slice(end, from), match: false })
    }
    end = to + 1
    ret.push({ value: value.slice(from, end), match: end - from >= minHighlightLength })
  }
  if (end < value.length) {
    ret.push({ value: value.slice(end), match: false })
  }
  return ret
}

export function filterFuseResultLines<T>(
  result: FuseResult<T>,
  key: string | string[],
  defaultResult: FuseSplitResult[] = []
): FuseSplitResult[] {
  const ret = splitFuseResult(result, key, defaultResult)
  const lines: FuseSplitResult[] = []
  let lineBuffer: FuseSplitResult[] = []
  let lineMatched = false
  for (const item of ret) {
    for (const part of item.value.split(/(\n)/)) {
      if (part === "\n") {
        // store current line
        if (lineBuffer.length && lineMatched) {
          lines.push(...lineBuffer, { value: "\n", match: false })
        }
        // initialize next line
        lineBuffer = []
        lineMatched = false
      } else if (part) {
        // insert part into current line
        lineBuffer.push({ value: part, match: item.match })
        lineMatched ||= item.match
      }
    }
  }
  // store reamining parts
  if (lineBuffer.length && lineMatched) {
    lines.push(...lineBuffer)
  }

  return lines
}

export interface SearchableBoxKeyDefinition<T> extends FuseOptionKeyObject<T> {
  displayName?: string
  filterValue?: string | null
  onFilterValueChanged?: (event: SyntheticEvent<Element>, value: string) => void
  extractMatches?: (result: FuseResult<T>) => FuseSplitResult[]
  onResultItemClick?: (event: SyntheticEvent<Element>, value: FuseResult<T>) => void
  content?: (
    keyDefinition: SearchableBoxKeyDefinition<T>,
    data: FuseResult<T>,
    matches: FuseSplitResult[],
    context: SearchableBoxProps<T>
  ) => ReactNode
}

export interface SearchableBoxProps<T> {
  data: readonly T[]
  keys: SearchableBoxKeyDefinition<T>[]
  options?: Omit<IFuseOptions<T>, "keys">
  itemContent?: ItemContent<FuseResult<T>, SearchableBoxProps<T>>
}

function ExtendedSearchDocument() {
  return (
    <>
      <a href="https://www.fusejs.io/examples.html#extended-search" target="_blank" rel="noreferrer">
        (fuse.js)
      </a>{" "}
      White space acts as an <strong>AND</strong> operator, while a single pipe (<code>|</code>) character acts as an{" "}
      <strong>OR</strong> operator. To escape white space, use double quote ex.{" "}
      <code>=&quot;scheme language&quot;</code> for exact match.
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Match type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>jscript</code>
            </td>
            <td>fuzzy-match</td>
            <td>
              Items that fuzzy match <code>jscript</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>=scheme</code>
            </td>
            <td>exact-match</td>
            <td>
              Items that are <code>scheme</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>&apos;python</code>
            </td>
            <td>include-match</td>
            <td>
              Items that include <code>python</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>!ruby</code>
            </td>
            <td>inverse-exact-match</td>
            <td>
              Items that do not include <code>ruby</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>^java</code>
            </td>
            <td>prefix-exact-match</td>
            <td>
              Items that start with <code>java</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>!^earlang</code>
            </td>
            <td>inverse-prefix-exact-match</td>
            <td>
              Items that do not start with <code>earlang</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>.js$</code>
            </td>
            <td>suffix-exact-match</td>
            <td>
              Items that end with <code>.js</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>!.go$</code>
            </td>
            <td>inverse-suffix-exact-match</td>
            <td>
              Items that do not end with <code>.go</code>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export function SearchableBox<T>(props: SearchableBoxProps<T>) {
  const fuse = new Fuse(props.data, { ...props.options, keys: props.keys })
  const patterns: Expression[] = []
  for (const key of props.keys) {
    if (key.filterValue) {
      if (typeof key.name === "string") {
        patterns.push({ [key.name]: key.filterValue })
      } else {
        patterns.push({ $path: key.name, $val: key.filterValue })
      }
    }
  }
  const result: FuseResult<T>[] = patterns.length
    ? fuse.search({ $and: patterns })
    : props.data.map((item, refIndex) => ({ item, refIndex }))

  return (
    <div className="searchable-box">
      <div className="searchable-box-form">
        <details>
          <summary className="clickable">You can use extended search expressions.</summary>
          <div>
            <ExtendedSearchDocument />
          </div>
        </details>
        {(patterns.length && (
          <FaFilterCircleXmark
            className="icon clickable"
            title="Clear filter values"
            onClick={event => props.keys.forEach(k => k.onFilterValueChanged?.(event, ""))}
          />
        )) || <FaFilter className="icon" />}
        Filter by
        {props.keys.map(key => {
          const name = typeof key.name === "string" ? key.name : key.name.join(".")
          return (
            <label key={name}>
              {key.displayName || name}
              <input
                onChange={event => key.onFilterValueChanged?.(event, event.target.value)}
                type="text"
                value={key.filterValue || ""}
              />
            </label>
          )
        })}
      </div>
      <Virtuoso context={props} data={result} itemContent={props.itemContent || SearchableBoxResultItem} />
    </div>
  )
}

export function HighlightMatches({
  matches,
  className,
  ...rest
}: { matches: FuseSplitResult[] } & ComponentPropsWithoutRef<"span">) {
  return (
    <span {...rest} className={`${className || ""} searchable-box-result-matches`}>
      {matches.map((item, idx) => {
        if (item.value === "\n") {
          return <br key={idx} />
        }
        return (
          <span className={item.match ? "highlight" : undefined} key={idx}>
            {item.value}
          </span>
        )
      })}
    </span>
  )
}

export function SearchableBoxResultItem<T>(index: number, data: FuseResult<T>, context: SearchableBoxProps<T>) {
  return context.keys.map((key, idx) => {
    let matches: FuseSplitResult[] = []
    if (key.extractMatches) {
      matches = key.extractMatches(data)
    } else if (key.filterValue) {
      matches = filterFuseResultLines(data, key.name)
    }
    return (
      <div
        className={`searchable-box-result-depth-${idx}`}
        key={`${index}-${key.name}`}
        onClick={e => key.onResultItemClick?.(e, data)}
      >
        {(key.content && key.content(key, data, matches, context)) || <HighlightMatches matches={matches} />}
      </div>
    )
  })
}
