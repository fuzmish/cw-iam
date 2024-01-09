import { Fragment } from "react"
import { FaFilter } from "react-icons/fa6"
import { useFilterValue, useSelection, useStateKeyPrefix } from "../../context"
import { CopyToClipboard } from "./CopyToClipboard"
import { GroupSelectionButtons } from "./GroupSelectionButtons"
import { HighlightCode } from "./HighlightCode"
import { HoverMenu } from "./HoverMenu"
import { NavigateButton } from "./NavigateButton"

export interface ICommonDetail<T, U> {
  data?: Record<string, T>
  entry?: T
  error?: unknown
  entryKey?: string
  titleForKey: string
  displayProperties?: (keyof T)[]
  noSelection?: boolean
  titleForItems?: string
  entryToItems?: (entry: T) => U[]
  filterKeyForItems?: string
  routePrefixForItemsDetail?: string
  displayPropertiesForJson?: (keyof T)[]
}

export function CommonDetail<T, U>({
  data,
  entry,
  error,
  entryKey,
  titleForKey,
  displayProperties,
  noSelection,
  titleForItems,
  entryToItems,
  filterKeyForItems,
  routePrefixForItemsDetail,
  displayPropertiesForJson
}: ICommonDetail<T, U>) {
  const stateKeyPrefix = useStateKeyPrefix()
  const [_, setFilterValue] = useFilterValue(stateKeyPrefix)
  const [availableGroups, selectionState, dispatchSelection] = useSelection(stateKeyPrefix)

  if (error) {
    return <div className="error">${`${error}`}</div>
  }
  if (!data && !entry) {
    return <div className="info">Loading...</div>
  }
  if (data && entryKey && !entry) {
    entry = data[entryKey]
  }
  if (!entry || !entryKey) {
    return <div className="error">Unable to load entry</div>
  }
  let displayEntryJson: string | null = null
  if (displayPropertiesForJson?.length) {
    const displayEntry: Record<string | number | symbol, unknown> = {}
    for (const key of displayPropertiesForJson) {
      displayEntry[key] = entry[key]
    }
    displayEntryJson = JSON.stringify(displayEntry, null, 2)
  }

  return (
    <>
      <h3>{titleForKey}</h3>
      <dl>
        {displayProperties?.map((key, index) => {
          const value = entry?.[key]
          if (typeof value === "undefined" || value === null) {
            return
          }
          if (typeof value === "string" && !value) {
            return
          }
          const textValue = `${value}`
          return (
            <Fragment key={String(key)}>
              <dt>
                {String(key)[0].toUpperCase()}
                {String(key).slice(1)}
              </dt>
              <dd>
                <HoverMenu label={textValue}>
                  <CopyToClipboard buttonOnly text={textValue} />
                  {index === 0 && !noSelection && (
                    <>
                      <GroupSelectionButtons
                        availableGroups={availableGroups}
                        entryKey={entryKey}
                        onSelectionStateChange={(_, key, value) =>
                          dispatchSelection({ type: "setSelection", key, value })
                        }
                        selectionState={selectionState}
                      />
                      <NavigateButton title="Compare" to="../compare" type="link" />
                    </>
                  )}
                </HoverMenu>
              </dd>
            </Fragment>
          )
        })}
      </dl>
      {entryToItems && (
        <>
          {titleForItems && <h3>{titleForItems}</h3>}
          <ul>
            {entryToItems(entry).map((item, index) => {
              const label = typeof item === "string" ? item : `${item}`
              return (
                <li key={index}>
                  <HoverMenu label={label}>
                    <CopyToClipboard buttonOnly text={label} />
                    {filterKeyForItems && typeof item === "string" && (
                      <FaFilter
                        className="icon clickable"
                        onClick={() => setFilterValue({ key: filterKeyForItems, value: `'${item}` })}
                        title="Apply this item to filter"
                      />
                    )}
                    {typeof item === "string" && routePrefixForItemsDetail && (
                      <NavigateButton title="Go to item detail" to={`${routePrefixForItemsDetail}${item}`} />
                    )}
                  </HoverMenu>
                </li>
              )
            })}
          </ul>
        </>
      )}
      {displayEntryJson && (
        <>
          <h3>
            <CopyToClipboard alwaysOpen label="JSON" text={displayEntryJson} />
          </h3>
          <HighlightCode code={displayEntryJson} language="json" />
        </>
      )}
    </>
  )
}
