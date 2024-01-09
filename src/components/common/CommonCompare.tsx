import { ReactNode } from "react"
import { FaFilter } from "react-icons/fa6"
import { CopyToClipboard, GroupSelectionButtons, HighlightCode, HoverMenu, NavigateButton } from "."
import { useFilterValue, useSelection, useStateKeyPrefix } from "../../context"
import { fromStateKey, toStateKey } from "./GroupSelectionButtons"

export interface ICommonCompareProps<T, U extends { key: string }> {
  data: Record<string, T> | undefined
  error?: unknown
  title: string
  minSelectionAvailableGroups?: number
  maxSelectionAvailableGroups?: number
  titleForSelection?: string
  getLabelForKey?: (entry: T) => ReactNode
  routePrefixForKeyDetail?: string
  titleForComparison?: string
  entryToItems: (entry: T) => U[]
  filterKeyForItems?: string
  routePrefixForItemsDetail?: string
}

export function CommonCompare<T, U extends { key: string }>({
  data,
  error,
  title,
  minSelectionAvailableGroups = 2,
  maxSelectionAvailableGroups = 5,
  titleForSelection: selectionTitle = "Select",
  getLabelForKey,
  routePrefixForKeyDetail = "../",
  titleForComparison: comparisonTitle = "Compare",
  entryToItems,
  filterKeyForItems,
  routePrefixForItemsDetail
}: ICommonCompareProps<T, U>) {
  const stateKeyPrefix = useStateKeyPrefix()
  const [_, setFilterValue] = useFilterValue(stateKeyPrefix)
  const [availableGroups, selectionState, dispatchSelection] = useSelection(stateKeyPrefix)

  if (error) {
    return <div className="error">${`${error}`}</div>
  }
  if (!data) {
    return <div className="info">Loading...</div>
  }

  // compute groups and comparison table
  const keys: Set<string> = new Set()
  const items: Record<string, U> = {}
  const comparison: Record<string, { [key: string]: boolean }> = {}
  for (const [key, value] of Object.entries(selectionState)) {
    if (!value) {
      continue
    }
    const { group, entryKey } = fromStateKey(key)
    if (!entryKey || !(entryKey in data)) {
      continue
    }
    keys.add(entryKey)
    for (const item of entryToItems(data[entryKey])) {
      if (!(item.key in items)) {
        items[item.key] = item
      }
      if (!(item.key in comparison)) {
        comparison[item.key] = {}
      }
      comparison[item.key][toStateKey(group, item.key)] = true
    }
  }
  const exportJson = JSON.stringify({ keys: [...keys], items, comparison }, null, 2)

  return (
    <>
      <h3>{title}</h3>
      <h3>{selectionTitle}</h3>
      <div>
        <label>
          Number of groups{" "}
          <input
            max={maxSelectionAvailableGroups}
            min={minSelectionAvailableGroups}
            onChange={e => {
              let value = Math.max(minSelectionAvailableGroups, Math.min(maxSelectionAvailableGroups, +e.target.value))
              if (isNaN(value)) {
                value = 2
              }
              dispatchSelection({ type: "setAvailableGroups", value })
            }}
            type="number"
            value={availableGroups}
          />
        </label>{" "}
        {(keys.size && <button onClick={() => dispatchSelection({ type: "clearSelection" })}>Unselect All</button>) ||
          undefined}
      </div>
      {[...keys].toSorted().map(key => {
        const label = getLabelForKey ? getLabelForKey(data[key]) : key
        return (
          <div key={key}>
            <GroupSelectionButtons
              availableGroups={availableGroups}
              entryKey={key}
              onSelectionStateChange={(_, key, value) => dispatchSelection({ type: "setSelection", key, value })}
              selectionState={selectionState}
            />
            <HoverMenu label={label}>
              <CopyToClipboard buttonOnly text={typeof label == "string" ? label : key} />
              <NavigateButton title="Go to detail" to={`${routePrefixForKeyDetail}${key}`} />
            </HoverMenu>
          </div>
        )
      })}
      {Object.keys(comparison).length > 0 && (
        <>
          <h3>{comparisonTitle}</h3>
          {Object.keys(comparison)
            .toSorted()
            .map(key => {
              const item = items[key]
              const groups = comparison[key]
              let labelClassName: string | undefined = undefined
              if (Object.keys(groups).length === 1) {
                const { group } = fromStateKey(Object.keys(groups)[0])
                labelClassName = `cg-${group}`
              }
              return (
                <div key={key}>
                  <GroupSelectionButtons
                    availableGroups={availableGroups}
                    entryKey={key}
                    iconType="square"
                    selectionState={groups}
                  />
                  <HoverMenu label={<span className={labelClassName}>{key}</span>}>
                    <CopyToClipboard buttonOnly text={key} />
                    {filterKeyForItems && (
                      <FaFilter
                        className="icon clickable"
                        onClick={() => setFilterValue({ key: filterKeyForItems, value: `'${item.key}` })}
                        title="Apply this item to filter"
                      />
                    )}
                    {routePrefixForItemsDetail && (
                      <NavigateButton title="Go to item detail" to={`${routePrefixForItemsDetail}${item.key}`} />
                    )}
                  </HoverMenu>
                </div>
              )
            })}
          <h3>
            <CopyToClipboard alwaysOpen label="JSON" text={exportJson} />
          </h3>
          <HighlightCode code={exportJson} language="json" />
        </>
      )}
    </>
  )
}
