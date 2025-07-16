import { use } from "react"
import { Virtuoso } from "react-virtuoso"
import { GlobalStaticDataContext } from "../context"
import { CopyBox } from "./CopyBox"
import { RoleDetailManagerContext } from "./RoleDetails"
import { SelectionBox, SelectionManagerContext, SelectionStateContext } from "./SelectionBox"
import { TabManagerContext } from "./TabGroup"

export function CompareRoles() {
  const globalStaticData = use(GlobalStaticDataContext)
  const roleSelectionState = use(SelectionStateContext)
  const roleDetailManager = use(RoleDetailManagerContext)
  const tabManager = use(TabManagerContext)

  const state = roleSelectionState?.state || {}
  const indices = roleSelectionState?.indices || new Set()
  const selectedRoles = Object.keys(state)
    .filter(key => Object.values(state[key]).some(v => v))
    .sort()
  const selectedPermissions: Record<string, Record<string, boolean>> = {}
  for (const [roleKey, roleState] of Object.entries(roleSelectionState?.state || {})) {
    for (const permission of globalStaticData?.rolesById[roleKey]?.permissions || []) {
      for (const index of Object.keys(roleState).filter(index => roleState[index])) {
        if (!(permission in selectedPermissions)) {
          selectedPermissions[permission] = {}
        }
        selectedPermissions[permission][index] = true
      }
    }
  }

  return (
    <div className="stacked">
      <div>
        {selectedRoles.length === 0 ? <h2>No selected roles.</h2> : <h2>Selected roles</h2>}
        <div>
          {selectedRoles.map(roleId => (
            <div key={roleId}>
              <SelectionBox selectionKey={roleId} />{" "}
              {/** biome-ignore lint/a11y/useSemanticElements: This is a clickable role link */}
              <span
                className="hoverHighlight"
                role="button"
                tabIndex={0}
                onMouseDown={e => {
                  e.preventDefault()
                  roleDetailManager?.selectedRole(roleId)
                  tabManager?.setCurrentTab("role")
                  return false
                }}
              >
                roles/{roleId}
              </span>
            </div>
          ))}
        </div>
        {selectedRoles.length > 0 ? <h3>Compare permissions</h3> : undefined}
      </div>
      <SelectionManagerContext.Provider value={null}>
        <SelectionStateContext.Provider value={{ state: selectedPermissions, indices }}>
          <Virtuoso
            data={Object.keys(selectedPermissions).sort()}
            itemContent={(_, key) => {
              const selectedIndices = Object.keys(selectedPermissions[key]).filter(
                index => selectedPermissions[key][index]
              )
              return (
                <div>
                  <SelectionBox
                    selectionKey={key}
                    readonly
                  />{" "}
                  <CopyBox
                    className={[
                      "breakAll",
                      ...(selectedIndices.length === 1 ? [`unique-${selectedIndices[0]}`] : [])
                    ].join(" ")}
                  >
                    {key}
                  </CopyBox>
                </div>
              )
            }}
            computeItemKey={(_, key) => key}
          />
        </SelectionStateContext.Provider>
      </SelectionManagerContext.Provider>
    </div>
  )
}
