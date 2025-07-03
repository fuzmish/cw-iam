import { createContext, type ReactNode, use } from "react"
import { Virtuoso } from "react-virtuoso"
import type { Role } from "../data"
import type { SearchResult } from "../lib/search"
import { HighlightMatch } from "./HighlightMatch"
import { RoleDetailManagerContext, RoleDetailStateContext } from "./RoleDetails"
import { SelectionBox } from "./SelectionBox"
import { TabManagerContext } from "./TabGroup"

const MAX_MATCHED_PERMISSIONS = 10

export interface RoleSearchState {
  readonly filterById: string
  readonly filterByName: string
  readonly filterByPermission: string
  readonly isFiltered: boolean
  readonly result: ReadonlyArray<Readonly<SearchResult<Role>>>
}

export interface RoleSearchManager {
  setFilterIdName(value: string): void
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
      Filter by role id{" "}
      <input
        type="text"
        value={roleSearchState?.filterById}
        onChange={e => roleSearchManager?.setFilterIdName(e.target.value)}
      />
      , name{" "}
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
      <br />
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
}: Pick<SearchResult<Role>, "item" | "matches">) {
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
      {/* biome-ignore lint/a11y/noStaticElementInteractions: This span acts as a clickable role selection */}
      {/* biome-ignore lint/a11y/useButtonType: Changing to button would require significant styling changes */}
      <span
        className="hoverHighlight"
        role="button"
        tabIndex={0}
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
