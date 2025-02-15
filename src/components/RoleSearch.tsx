import type { FuseResult } from "fuse.js"
import { type ReactNode, createContext, use } from "react"
import { Virtuoso } from "react-virtuoso"
import type { Role } from "../data"
import { HighlightMatch } from "./HighlightMatch"
import { RoleDetailManagerContext, RoleDetailStateContext } from "./RoleDetails"
import { SelectionBox } from "./SelectionBox"
import { TabManagerContext } from "./TabGroup"

const MAX_MATCHED_PERMISSIONS = 10

export interface RoleSearchState {
  readonly filterByName: string
  readonly filterByPermission: string
  readonly isFiltered: boolean
  readonly result: ReadonlyArray<Readonly<FuseResult<Role>>>
}

export interface RoleSearchManager {
  setFilterByName(value: string): void
  setFilterByPermission(value: string): void
}

export const RoleSearchStateContext = createContext<RoleSearchState | null>(null)
export const RoleSearchManagerContext = createContext<RoleSearchManager | null>(null)

export function RoleSearchForm() {
  const roleSearchState = use(RoleSearchStateContext)
  const roleSearchManager = use(RoleSearchManagerContext)
  return (
    <div>
      Filter by role name{" "}
      <input
        type="text"
        value={roleSearchState?.filterByName}
        onChange={e => roleSearchManager?.setFilterByName(e.target.value)}
      />{" "}
      and permissions{" "}
      <input
        type="text"
        value={roleSearchState?.filterByPermission}
        onChange={e => roleSearchManager?.setFilterByPermission(e.target.value)}
      />
      <details>
        <summary>You can use extended search expressions.</summary>
        <a
          href="https://www.fusejs.io/examples.html#extended-search"
          target="_blank"
          rel="noreferrer"
        >
          (fuse.js)
        </a>{" "}
        White space acts as an <strong>AND</strong> operator, while a single pipe (<code>|</code>)
        character acts as an <strong>OR</strong> operator. To escape white space, use double quote
        ex. <code>=&quot;scheme language&quot;</code> for exact match.
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
      </details>
      <span>
        {roleSearchState?.isFiltered ? "Found" : "Total"} {roleSearchState?.result.length || 0}{" "}
        roles.
      </span>
    </div>
  )
}

export function RoleSearchResult() {
  const roleSearchState = use(RoleSearchStateContext)
  return (
    <Virtuoso
      data={roleSearchState?.result}
      computeItemKey={(_index, item, _context) => item.item.id}
      itemContent={(_index, item, _context) => <RoleSearchResultItem {...item} />}
    />
  )
}

export function RoleSearchResultItem({
  item,
  matches
}: Pick<FuseResult<Role>, "item" | "matches">) {
  const roleSearchState = use(RoleSearchStateContext)
  const roleDetailManager = use(RoleDetailManagerContext)
  const roleDetailState = use(RoleDetailStateContext)
  const tabManager = use(TabManagerContext)
  const matchId = matches?.find(m => m.key === "id")
  const matchName = matches?.find(m => m.key === "name")
  const permissions: { key: string; node: ReactNode }[] = []
  if (roleSearchState?.filterByPermission) {
    const matchPermissions = matches?.filter(m => m.key === "permissions") || []
    for (const matchPermission of matchPermissions.slice(0, MAX_MATCHED_PERMISSIONS)) {
      permissions.push({
        key: matchPermission.value || "",
        node: <HighlightMatch {...matchPermission} />
      })
    }
    if (matchPermissions.length > MAX_MATCHED_PERMISSIONS) {
      permissions.push({
        key: "",
        node: `(... and ${matchPermissions.length - MAX_MATCHED_PERMISSIONS} more)`
      })
    }
  }

  return (
    <div>
      <SelectionBox selectionKey={item.id} />{" "}
      <span
        className="hoverHighlight"
        onMouseDown={e => {
          e.preventDefault()
          if (roleDetailState?.selectedRoleId === item.id) {
            roleDetailManager?.selectedRole(null)
          } else {
            roleDetailManager?.selectedRole(item.id)
            tabManager?.setCurrentTab("role")
          }
          return false
        }}
      >
        <span className="roleId">roles/{matchId ? <HighlightMatch {...matchId} /> : item.id}</span>{" "}
        <span className="roleName">
          {matchName ? <HighlightMatch {...matchName} /> : item.name}
        </span>
      </span>
      {permissions ? (
        <ul className="permissionMatches">
          {permissions.map(p => (
            <li key={p.key}>{p.node}</li>
          ))}
        </ul>
      ) : undefined}
    </div>
  )
}
