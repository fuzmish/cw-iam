import { createContext, use } from "react"
import { Virtuoso } from "react-virtuoso"
import { GlobalStaticDataContext } from "../context"
import { CopyBox } from "./CopyBox"

export interface RoleDetailState {
  selectedRoleId?: string | null
}

export interface RoleDetailManager {
  selectedRole(id: string | null): void
}

export const RoleDetailStateContext = createContext<RoleDetailState | null>(null)
export const RoleDetailManagerContext = createContext<RoleDetailManager | null>(null)

export function RoleDetails() {
  const globalStaticData = use(GlobalStaticDataContext)
  const roleDetailState = use(RoleDetailStateContext)
  const role = roleDetailState?.selectedRoleId
    ? globalStaticData?.rolesById?.[roleDetailState.selectedRoleId]
    : undefined

  return (
    <div className="stacked">
      {role ? (
        <>
          <div>
            <h2>Role Details</h2>
            <span>
              ID: <CopyBox className="breakAll">roles/{role.id}</CopyBox>
            </span>
            <br />
            <span>
              Name: <CopyBox className="breakAll">{role.name}</CopyBox>
            </span>
            <h3>Permissions</h3>
            <span>This role has {role.permissions.length} permissions.</span>
          </div>
          <Virtuoso
            data={role.permissions}
            itemContent={(_index, item, _context) => <CopyBox className="breakAll">{item}</CopyBox>}
            computeItemKey={(_index, item, _context) => item}
          />
        </>
      ) : (
        <h2>No selected role.</h2>
      )}
    </div>
  )
}
