import Fuse from "fuse.js"
import { useEffect, useState } from "react"
import { Layout } from "./Layout"
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

const MAX_SELECTION = 5

export function App() {
  const [globalStaticData, setGlobalStaticData] = useState<GlobalStaticData | null>(null)

  useEffect(() => {
    fetchRoleData().then(({ roles, rolesById }) => {
      const fuseForRoles = new Fuse(roles, {
        includeMatches: true,
        keys: ["id", "name", "permissions"],
        useExtendedSearch: true,
        shouldSort: true,
        minMatchCharLength: 2
      })
      setGlobalStaticData({
        rolesById,
        roles,
        fuseForRoles
      })
    })
  }, [])

  const [roleSelectionState, setRoleSelectionState] = useState<SelectionState>({
    indices: new Set([...Array(MAX_SELECTION).keys()].map(i => `${i}`)),
    state: {}
  })
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

  const [filterByName, setFilterByName] = useState("")
  const [filterByPermission, setFilterByPermission] = useState("")
  const searchArgs: Record<string, string> = {}
  if (filterByName) {
    searchArgs.id = filterByName
    searchArgs.name = filterByName
  }
  if (filterByPermission) {
    searchArgs.permissions = filterByPermission
  }
  const isFiltered = !!(globalStaticData?.fuseForRoles && Object.keys(searchArgs).length > 0)
  const allRoles = globalStaticData?.roles.map((item, refIndex) => ({ item, refIndex })) || []
  const result = isFiltered ? globalStaticData?.fuseForRoles.search(searchArgs) : allRoles
  const roleSearchManager: RoleSearchManager = { setFilterByName, setFilterByPermission }
  const roleSearchState: RoleSearchState = {
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

  const [tabState, setTabState] = useState<TabState>({ currentTab: null })
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
