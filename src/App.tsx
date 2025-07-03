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
import { fetchRoleData, type Role } from "./data"
import { Layout } from "./Layout"
import { type SubstringMatch, searchWithIndices, substringMatch } from "./lib/search"
import { fromXson, toXson } from "./lib/xson"

const MAX_SELECTION = 5

export function App() {
  const [globalStaticData, setGlobalStaticData] = useState<GlobalStaticData | null>(null)
  const [permissionToRoleIds, setPermissionToRoleIds] = useState<Map<string, Set<string>> | null>(
    null
  )

  useEffect(() => {
    fetchRoleData().then(({ roles, rolesById }) => {
      setGlobalStaticData({
        rolesById,
        roles
      })
      // permission→role idの辞書を構築
      const map = new Map<string, Set<string>>()
      for (const role of roles) {
        for (const perm of role.permissions) {
          const p = perm.toLowerCase()
          if (!map.has(p)) map.set(p, new Set())
          map.get(p)?.add(role.id)
        }
      }
      setPermissionToRoleIds(map)
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
      const compact: Record<string, string[]> = Object.fromEntries(
        Object.entries(roleSelectionState.state)
          .map(([key, state]) => [key, Object.keys(state).filter(index => state[index])])
          .filter(([_, indices]) => indices.length)
      )
      if (Object.keys(compact).length) {
        toXson(compact)
          .then(payload =>
            history.replaceState(null, "", `${location.origin}${location.pathname}?${payload}`)
          )
          .catch(err => console.warn(err))
      } else {
        history.replaceState(null, "", `${location.origin}${location.pathname}`)
      }
    }
    // else, do initialization; attempt to restore the selection state from the search value
    else {
      fromXson(location.search.slice(1))
        .then(ret => {
          if (!ret) {
            return
          }
          const state: Record<string, Record<string, boolean>> = {}
          for (const [key, indices] of Object.entries(ret)) {
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
        })
        .catch(err => console.warn(err))
        .finally(() => setRoleSelectionInitialized(true))
    }
  }, [roleSelectionInitialized, globalStaticData, roleSelectionState])

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
  let filteredRoles = globalStaticData?.roles || []
  // id, name, permissionごとに部分一致したroleのみを残す
  if (isFiltered && globalStaticData) {
    if (filterById) {
      filteredRoles = searchWithIndices(filteredRoles, filterById, r => r.id, "id").map(r => r.item)
    }
    if (filterByName) {
      filteredRoles = searchWithIndices(filteredRoles, filterByName, r => r.name, "name").map(
        r => r.item
      )
    }
    if (filterByPermission && permissionToRoleIds) {
      const matchedRoleIds = new Set<string>()
      const q = filterByPermission.toLowerCase()
      for (const [perm, ids] of permissionToRoleIds) {
        if (perm.includes(q)) {
          for (const id of ids) matchedRoleIds.add(id)
        }
      }
      filteredRoles = filteredRoles.filter(role => matchedRoleIds.has(role.id))
    }
  }
  // matches配列を生成
  let result: { item: Role; matches: SubstringMatch[]; refIndex: number }[] = []
  if (globalStaticData) {
    result = filteredRoles.map((role, refIndex) => {
      const matches: SubstringMatch[] = []
      if (filterById) {
        const m = substringMatch(role.id, filterById, "id")
        if (m) matches.push(m)
      }
      if (filterByName) {
        const m = substringMatch(role.name, filterByName, "name")
        if (m) matches.push(m)
      }
      if (filterByPermission) {
        for (const perm of role.permissions) {
          const m = substringMatch(perm, filterByPermission, "permissions")
          if (m) matches.push(m)
        }
      }
      return { item: role, matches, refIndex }
    })
  }
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
