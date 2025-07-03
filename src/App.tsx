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
import { type SubstringMatch, search } from "./lib/search"
import { fromXson, toXson } from "./lib/xson"

const MAX_SELECTION = 5

export function App() {
  const [globalStaticData, setGlobalStaticData] = useState<GlobalStaticData | null>(null)
  const [permissionRoleList, setPermissionRoleList] = useState<
    { permission: string; roles: Role[] }[]
  >([])

  useEffect(() => {
    fetchRoleData().then(({ roles, rolesById }) => {
      setGlobalStaticData({
        rolesById,
        roles
      })
      const permissionToRoles: Record<string, Set<Role>> = {}
      for (const role of roles) {
        for (const perm of role.permissions) {
          const p = perm.toLowerCase()
          if (!permissionToRoles[p]) permissionToRoles[p] = new Set()
          permissionToRoles[p].add(role)
        }
      }
      setPermissionRoleList(
        Object.entries(permissionToRoles).map(([permission, roles]) => ({
          permission,
          roles: Array.from(roles)
        }))
      )
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

  let filteredRoles: Role[] = globalStaticData?.roles || []
  const idMatches: { [id: string]: SubstringMatch } = {}
  const nameMatches: { [id: string]: SubstringMatch } = {}
  const permissionMatches: { [id: string]: SubstringMatch[] } = {}
  if (globalStaticData) {
    // filter by role id
    const idResult = search(filteredRoles, r => r.id, filterById)
    filteredRoles = idResult.map(r => r.item)
    for (const r of idResult) {
      if (r.match) {
        idMatches[r.item.id] = { ...r.match, key: "id" }
      }
    }

    // filter by role name
    const nameResult = search(filteredRoles, r => r.name, filterByName)
    filteredRoles = nameResult.map(r => r.item)
    for (const r of nameResult) {
      if (r.match) {
        nameMatches[r.item.id] = { ...r.match, key: "name" }
      }
    }

    // filter by permission
    let filteredPermissionRoles: {
      item: { permission: string; roles: Role[] }
      match?: SubstringMatch
    }[] = permissionRoleList.map(item => ({ item }))
    if (filterByPermission) {
      filteredPermissionRoles = search(permissionRoleList, pz => pz.permission, filterByPermission)
      const allowedRoleIds = new Set(
        filteredPermissionRoles.flatMap(pz => pz.item.roles.map(r => r.id))
      )
      filteredRoles = filteredRoles.filter(r => allowedRoleIds.has(r.id))
      for (const pz of filteredPermissionRoles) {
        for (const role of pz.item.roles) {
          if (!permissionMatches[role.id]) {
            permissionMatches[role.id] = []
          }
          if (pz.match) {
            permissionMatches[role.id].push({ ...pz.match, key: "permissions" })
          }
        }
      }
    }
  }

  // generate matches array
  let result: { item: Role; matches: SubstringMatch[]; refIndex: number }[] = []
  if (filteredRoles.length > 0) {
    result = filteredRoles.map((role, refIndex) => {
      const matches: SubstringMatch[] = []
      if (idMatches[role.id]) matches.push(idMatches[role.id])
      if (nameMatches[role.id]) matches.push(nameMatches[role.id])
      if (permissionMatches[role.id]) matches.push(...permissionMatches[role.id])
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
