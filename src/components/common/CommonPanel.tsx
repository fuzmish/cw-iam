import { FaGripLinesVertical } from "react-icons/fa6"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { GroupSelectionButtons, HighlightMatches, SearchableBox } from "."
import { useFilterValue, useSelection, useStateKeyPrefix } from "../../context"
import { SearchableBoxKeyDefinition } from "./SearchableBox"

export type SearchKeyDefinition<T> = Omit<
  SearchableBoxKeyDefinition<T>,
  "name" | "filterValue" | "onFilterValueChanged"
>

export interface ICommonPanelProps<T> {
  data: Record<string, T> | undefined
  error?: unknown
  keys?: (
    | (SearchKeyDefinition<{ key: string; value: T }> & { primary: true; noSelection?: boolean })
    | (SearchKeyDefinition<{ key: string; value: T }> & { primary?: never; name: string | string[] })
  )[]
}

export function CommonPanel<T>({ data, error, keys = [{ primary: true }] }: ICommonPanelProps<T>) {
  const stateKeyPrefix = useStateKeyPrefix()
  const [filterValue, setFilterValue] = useFilterValue(stateKeyPrefix)
  const [availableGroups, selectionState, dispatchSelection] = useSelection(stateKeyPrefix)
  const navigate = useNavigate()

  if (error) {
    return <div className="error">${`${error}`}</div>
  }
  if (!data) {
    return <div className="info">Loading...</div>
  }

  // record to entries
  const entries = Object.entries(data)
    .map(([key, value]) => ({ key, value }))
    .toSorted((a, b) => (a.key < b.key ? -1 : 1))

  // fill keys
  const _keys: SearchableBoxKeyDefinition<{ key: string; value: T }>[] = []
  for (const key of keys) {
    if (key.primary) {
      // default key definition for entry.key
      _keys.push({
        ...key,
        name: "key",
        filterValue: filterValue["key"],
        onFilterValueChanged: (_, value) => setFilterValue({ key: "key", value }),
        content: (keyDefinition, data, matches, context) => (
          <>
            {!key.noSelection && (
              <GroupSelectionButtons
                availableGroups={availableGroups}
                entryKey={data.item.key}
                onSelectionStateChange={(_, key, value) => {
                  dispatchSelection({
                    type: "setSelection",
                    key,
                    value
                  })
                  if (value) {
                    // when the selection is added, navigate to comparison page
                    navigate("compare")
                  }
                }}
                selectionState={selectionState}
              />
            )}
            {key.content ? (
              key.content(keyDefinition, data, matches, context)
            ) : (
              <NavLink to={`./${data.item.key}`}>
                <HighlightMatches matches={matches.length ? matches : [{ value: data.item.key, match: false }]} />
              </NavLink>
            )}
          </>
        )
      })
    } else {
      // use given key definition, extends filter state
      const filterKey = typeof key.name === "string" ? key.name : key.name.join(".")
      _keys.push({
        ...key,
        filterValue: filterValue[filterKey],
        onFilterValueChanged: (_, value) => setFilterValue({ key: filterKey, value })
      })
    }
  }
  return (
    <PanelGroup autoSaveId="page" direction="horizontal">
      <Panel>
        <SearchableBox data={entries} keys={_keys} options={{ includeMatches: true, useExtendedSearch: true }} />
      </Panel>
      <PanelResizeHandle>
        <FaGripLinesVertical />
      </PanelResizeHandle>
      <Panel style={{ overflowY: "auto" }}>
        <Outlet />
      </Panel>
    </PanelGroup>
  )
}
