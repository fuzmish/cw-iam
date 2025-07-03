import { createContext } from "react"
import type { Role } from "./data"

export interface GlobalStaticData {
  rolesById: Record<string, Role>
  roles: Role[]
}

export const GlobalStaticDataContext = createContext<GlobalStaticData | null>(null)
