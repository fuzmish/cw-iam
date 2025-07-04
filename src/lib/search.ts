import type { Role } from "../data"

export interface SubstringMatch {
  value: string
  indices: [number, number][]
  key: string
}

export interface SearchResult<T> {
  item: T
  matches: SubstringMatch[]
}

export function search<T>(
  filterValue: string,
  items: T[],
  key: string | null = null
): SearchResult<T>[] {
  if (!filterValue) {
    return items.map(item => ({ item, matches: [] }))
  }
  const v = filterValue.toLowerCase()
  const result: SearchResult<T>[] = []
  for (const item of items) {
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic property access requires any type
    let value = item as any
    if (key) {
      value = value[key]
    }
    if (typeof value !== "string") {
      continue
    }
    const index = value.toLowerCase().indexOf(v)
    if (index === -1) {
      continue
    }
    result.push({
      item,
      matches: [{ value, indices: [[index, index + filterValue.length - 1]], key: key || "" }]
    })
  }
  return result
}

export class RoleSearcher {
  private readonly roles: Readonly<Record<string, Role>>
  private readonly permissions: Readonly<Record<string, Set<string>>>

  constructor(roles: Role[]) {
    this.roles = Object.fromEntries(roles.map(role => [role.id, role]))
    // transpose roles to permission map
    const permissions: Record<string, Set<string>> = {}
    for (const role of roles) {
      for (const permission of role.permissions) {
        permissions[permission] = (permissions[permission] || new Set()).add(role.id)
      }
    }
    this.permissions = permissions
  }

  search(
    roleId: string | null = null,
    roleName: string | null = null,
    permission: string | null = null
  ): SearchResult<Role>[] {
    let resultRoles = Object.values(this.roles)
    const resultMatches: Record<string, SubstringMatch[]> = {}

    if (roleId) {
      const filterResult = search(roleId.toLowerCase(), resultRoles, "id")
      for (const { item, matches } of filterResult) {
        if (!(item.id in resultMatches)) {
          resultMatches[item.id] = []
        }
        resultMatches[item.id].push(...matches)
      }
      resultRoles = filterResult.map(r => r.item)
    }

    if (roleName) {
      const filterResult = search(roleName.toLowerCase(), resultRoles, "name")
      for (const { item, matches } of filterResult) {
        if (!(item.id in resultMatches)) {
          resultMatches[item.id] = []
        }
        resultMatches[item.id].push(...matches)
      }
      resultRoles = filterResult.map(r => r.item)
    }

    if (permission) {
      const filterResult = search(
        permission.toLowerCase(),
        Object.keys(this.permissions).map(permission => ({ permission })),
        "permission"
      )
      const matchingRoles = new Set<string>()
      for (const { item, matches } of filterResult) {
        resultMatches[item.permission] = matches
        for (const roleId of this.permissions[item.permission]) {
          matchingRoles.add(roleId)
        }
      }
      resultRoles = resultRoles.filter(role => matchingRoles.has(role.id))
    }

    // construct final result
    const result: SearchResult<Role>[] = []
    for (const item of resultRoles) {
      const matches: SubstringMatch[] = []
      matches.push(...(resultMatches[item.id] || []))
      for (const permission of item.permissions) {
        matches.push(...(resultMatches[permission] || []))
      }
      result.push({ item, matches })
    }

    return result
  }
}
