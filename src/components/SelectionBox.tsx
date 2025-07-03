import { createContext, type ReactNode, use } from "react"

export interface SelectionState {
  readonly indices: ReadonlySet<string>
  readonly state: Readonly<Record<string, Readonly<Record<string, boolean>>>>
}

export interface SelectionManager {
  setIndices(indices: Iterable<string>): void
  setState(key: string, index: string, value: boolean): void
}

export const SelectionStateContext = createContext<SelectionState | null>(null)
export const SelectionManagerContext = createContext<SelectionManager | null>(null)

export function SelectionBox({
  selectionKey,
  readonly = false
}: {
  selectionKey: string
  readonly?: boolean
}): ReactNode {
  const roleSelectionManager = use(SelectionManagerContext)
  const roleSelectionState = use(SelectionStateContext)

  // normalize state
  const state = Object.fromEntries(
    [...(roleSelectionState?.indices || [])].map(index => [index, false])
  )
  for (const [index, value] of Object.entries(roleSelectionState?.state[selectionKey] || {})) {
    if (index in state) {
      state[index] = value
    }
  }

  return (
    <span className="selectionBox">
      {Object.keys(state).map(index => (
        // biome-ignore lint/a11y/noStaticElementInteractions: This span acts as a selection button
        <span
          key={index}
          className={[
            "selectionBoxButton",
            ...(state[index] ? ["selected"] : []),
            ...(readonly ? ["readonly"] : [])
          ].join(" ")}
          role={readonly ? undefined : "button"}
          tabIndex={readonly ? undefined : 0}
          onMouseDown={
            readonly
              ? undefined
              : e => {
                  e.preventDefault()
                  roleSelectionManager?.setState(selectionKey, index, !state[index])
                  return false
                }
          }
        />
      ))}
    </span>
  )
}
