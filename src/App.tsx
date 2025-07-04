import { useEffect, useState } from "react"
import {
  type RoleDetailManager,
  RoleDetailManagerContext,
  type RoleDetailState,
  RoleDetailStateContext
} from "./components/RoleDetails"
import {
  type RoleSearchManager,
  RoleSearchManagerContext,
  type RoleSearchState,
  RoleSearchStateContext
} from "./components/RoleSearch"
import {
  type SelectionManager,
  SelectionManagerContext,
  type SelectionState,
  SelectionStateContext
} from "./components/SelectionBox"
import {
  type TabManager,
  TabManagerContext,
  type TabState,
  TabStateContext
} from "./components/TabGroup"
import { type GlobalStaticData, GlobalStaticDataContext } from "./context"
import { fetchRoleData } from "./data"
import { Layout } from "./Layout"
import { RoleSearcher } from "./lib/search"
import { fromXson, toXson } from "./lib/xson"

const MAX_SELECTION = 5

export function App() {
  const [globalStaticData, setGlobalStaticData] = useState<GlobalStaticData | null>(null)

  useEffect(() => {
    fetchRoleData().then(({ roles, rolesById }) => {
      const roleSearcher = new RoleSearcher(roles)
      setGlobalStaticData({ rolesById, roles, roleSearcher })
    })
  }, [])

  const [roleSelectionState, setRoleSelectionState] = useState<SelectionState>({
    indices: new Set([...Array(MAX_SELECTION).keys()].map(i => `${i}`)),
    state: {}
  })
  const [roleSelectionInitialized, setRoleSelectionInitialized] = useState(false)

  useEffect(() => {
    // skip during data loading
    if (!globalStaticData?.rolesById) {
      return
    }
    // if initialized, sync the search value to the current selection state
    if (roleSelectionInitialized) {
      try {
        const compact: Record<string, string[]> = Object.fromEntries(
          Object.entries(roleSelectionState.state)
            .map(([key, state]) => [key, Object.keys(state).filter(index => state[index])])
            .filter(([_, indices]) => indices.length)
        )
        if (Object.keys(compact).length) {
          const payload = toXson(compact)
          history.replaceState(null, "", `${location.origin}${location.pathname}?${payload}`)
        } else {
          history.replaceState(null, "", `${location.origin}${location.pathname}`)
        }
      } catch (err) {
        console.warn(err)
      }
    }
    // else, do initialization; attempt to restore the selection state from the search value
    else {
      try {
        const payload = fromXson(location.search.slice(1))
        console.log(payload)
        if (payload) {
          const state: Record<string, Record<string, boolean>> = {}
          for (const [key, indices] of Object.entries(payload)) {
            if (key in globalStaticData.rolesById && Array.isArray(indices)) {
              state[key] = Object.fromEntries(
                indices
                  .filter(index => roleSelectionState.indices.has(index))
                  .map(index => [`${index}`, true])
              )
            }
          }
          if (Object.keys(state).length > 0) {
            setRoleSelectionState({ ...roleSelectionState, state })
          }
        }
      } catch (err) {
        console.warn(err)
      } finally {
        setRoleSelectionInitialized(true)
      }
    }
  }, [globalStaticData, roleSelectionState, roleSelectionInitialized])

  const roleSelectionManager: SelectionManager = {
    setIndices(indices) {
      setRoleSelectionState({ ...roleSelectionState, indices: new Set(indices) })
    },
    setState(key, index, value) {
      setRoleSelectionState({
        ...roleSelectionState,
        state: {
          ...roleSelectionState.state,
          [key]: {
            ...roleSelectionState.state[key],
            [index]: value
          }
        }
      })
      setTabState({ ...tabState, currentTab: "compare" })
    }
  }

  const [filterById, setFilterIdName] = useState("")
  const [filterByName, setFilterByName] = useState("")
  const [filterByPermission, setFilterByPermission] = useState("")
  const isFiltered = !!(globalStaticData && (filterById || filterByName || filterByPermission))
  const result =
    globalStaticData?.roleSearcher.search(filterById, filterByName, filterByPermission) || []

  const roleSearchManager: RoleSearchManager = {
    setFilterIdName,
    setFilterByName,
    setFilterByPermission
  }
  const roleSearchState: RoleSearchState = {
    filterById,
    filterByName,
    filterByPermission,
    isFiltered,
    result
  }

  const [roleDetailState, setRoleDetailState] = useState<RoleDetailState>({ selectedRoleId: null })
  const roleDetailManager: RoleDetailManager = {
    selectedRole(selectedRoleId) {
      setRoleDetailState({ selectedRoleId })
    }
  }

  const [tabState, setTabState] = useState<TabState>({ currentTab: "compare" })
  const tabManager: TabManager = {
    setCurrentTab(currentTab) {
      setTabState({ currentTab })
    }
  }

  return (
    <GlobalStaticDataContext.Provider value={globalStaticData}>
      <SelectionManagerContext.Provider value={roleSelectionManager}>
        <SelectionStateContext.Provider value={roleSelectionState}>
          <RoleSearchManagerContext.Provider value={roleSearchManager}>
            <RoleSearchStateContext.Provider value={roleSearchState}>
              <RoleDetailManagerContext.Provider value={roleDetailManager}>
                <RoleDetailStateContext.Provider value={roleDetailState}>
                  <TabManagerContext.Provider value={tabManager}>
                    <TabStateContext.Provider value={tabState}>
                      <Layout />
                    </TabStateContext.Provider>
                  </TabManagerContext.Provider>
                </RoleDetailStateContext.Provider>
              </RoleDetailManagerContext.Provider>
            </RoleSearchStateContext.Provider>
          </RoleSearchManagerContext.Provider>
        </SelectionStateContext.Provider>
      </SelectionManagerContext.Provider>
    </GlobalStaticDataContext.Provider>
  )
}
