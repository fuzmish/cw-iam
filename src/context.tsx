import { Dispatch, ReactNode, createContext, useContext, useReducer } from "react"

export interface DefaultContextValue {
  availableGroups: number
  filterValue: Record<string, Record<string, string | null>>
  selection: Record<string, Record<string, boolean>>
}

const defaultContextInitialValue: DefaultContextValue = {
  availableGroups: 2,
  filterValue: {},
  selection: {}
}

export type DefaultContextAction = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof DefaultContextValue]: DefaultContextValue[K] extends Function
    ? never
    : { type: "set"; property: K; value: DefaultContextValue[K] }
}[keyof DefaultContextValue]

function defaultContextReducer(state: DefaultContextValue, action: DefaultContextAction): DefaultContextValue {
  switch (action.type) {
    case "set": {
      return { ...state, [action.property]: action.value }
    }
  }
}

const DefaultContext = createContext<DefaultContextValue>(defaultContextInitialValue)
const DefaultContextDispatchContext = createContext<Dispatch<DefaultContextAction>>(() => {})

export function DefaultContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(defaultContextReducer, defaultContextInitialValue)
  return (
    <DefaultContext.Provider value={state}>
      <DefaultContextDispatchContext.Provider value={dispatch}>{children}</DefaultContextDispatchContext.Provider>
    </DefaultContext.Provider>
  )
}

export function useDefaultState(): [DefaultContextValue, Dispatch<DefaultContextAction>] {
  return [useContext(DefaultContext), useContext(DefaultContextDispatchContext)]
}

const StateKeyPrefixContext = createContext<string>("")

export const StateKeyPrefixContextProvider = StateKeyPrefixContext.Provider

export function useStateKeyPrefix() {
  return useContext(StateKeyPrefixContext)
}

export interface IDispatchFilterValueAction {
  key: string
  value?: string | null
}

export function useFilterValue(
  keyPrefix: string
): [Record<string, string | null>, Dispatch<IDispatchFilterValueAction>] {
  const [state, dispatch] = useDefaultState()
  const currentValue = keyPrefix in state.filterValue ? state.filterValue[keyPrefix] : {}
  const setFilterValue = function ({ key, value = null }: IDispatchFilterValueAction): void {
    dispatch({
      type: "set",
      property: "filterValue",
      value: { ...state.filterValue, [keyPrefix]: { ...currentValue, [key]: value } }
    })
  }
  return [currentValue, setFilterValue]
}

export type IDispatchSelectionAction =
  | {
      type: "setAvailableGroups"
      value: number
    }
  | {
      type: "setSelection"
      key: string
      value: boolean
    }
  | {
      type: "clearSelection"
    }

export function useSelection(key: string): [number, Record<string, boolean>, Dispatch<IDispatchSelectionAction>] {
  const [state, dispatch] = useDefaultState()
  const currentAvailableGroups = state.availableGroups
  const currentSelectionState = key in state.selection ? state.selection[key] : {}
  const dispatchSelection = function (action: IDispatchSelectionAction): void {
    switch (action.type) {
      case "setAvailableGroups": {
        dispatch({
          type: "set",
          property: "availableGroups",
          value: action.value
        })
        break
      }
      case "setSelection": {
        const nextValue = { ...currentSelectionState }
        if (action.value) {
          nextValue[action.key] = true
        } else {
          delete nextValue[action.key]
        }
        dispatch({
          type: "set",
          property: "selection",
          value: { ...state.selection, [key]: nextValue }
        })
        break
      }
      case "clearSelection": {
        dispatch({
          type: "set",
          property: "selection",
          value: { ...state.selection, [key]: {} }
        })
        break
      }
    }
  }
  return [currentAvailableGroups, currentSelectionState, dispatchSelection]
}
