export interface Role {
  id: string
  name: string
  permissions: string[]
}

export async function fetchRoleData(): Promise<{
  roles: Role[]
  rolesById: Record<string, Role>
}> {
  // fetch data
  const url = import.meta.env.DEV
    ? `${import.meta.env.BASE_URL}public/role_permissions.json`
    : "https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/role_permissions.json"
  const res = await fetch(url)
  const json = await res.json()

  // transpose
  const data: Record<string, Role> = {}
  for (const [permission, roles] of Object.entries(json)) {
    if (typeof permission !== "string" || !Array.isArray(roles)) {
      continue
    }
    for (const role of roles) {
      if (!role && typeof role !== "object") {
        continue
      }
      const roleId = role.id
      const roleName = role.name
      if (typeof roleId !== "string" || typeof roleName !== "string") {
        continue
      }
      if (!(roleId in data)) {
        data[roleId] = {
          id: roleId,
          name: roleName,
          permissions: []
        }
      }
      data[roleId].permissions.push(permission)
    }
  }

  // generate map and list
  const rolesById: Record<string, Role> = {}
  const roles: Role[] = []
  for (const [key, value] of Object.entries(data)) {
    const shortId = key.slice("roles/".length)
    const role = { ...value, id: shortId }
    rolesById[shortId] = role
    roles.push(role)
  }
  roles.sort((a, b) => (a.id < b.id ? -1 : 1))

  return { rolesById, roles }
}
