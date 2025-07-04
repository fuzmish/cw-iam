import { createContext } from "react"
import type { Role } from "./data"
import type { RoleSearcher } from "./lib/search"

export interface GlobalStaticData {
  readonly rolesById: Record<string, Role>
  readonly roles: Role[]
  readonly roleSearcher: RoleSearcher
}

export const GlobalStaticDataContext = createContext<GlobalStaticData | null>(null)
