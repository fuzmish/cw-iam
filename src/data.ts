import { SWRResponse } from "swr"
import useSWRImmutable from "swr/immutable"

async function getIamDataset(target: string) {
  const baseUrl = import.meta.env.DEV
    ? `${import.meta.env.BASE_URL}iam-dataset/`
    : "https://raw.githubusercontent.com/iann0036/iam-dataset/main/"
  const res = await fetch(`${baseUrl}${target}`)
  const data = await res.json()
  return data
}

export type SWRStaticResponse<T> = Omit<SWRResponse<T>, "mutate">

export interface GoogleRole {
  id: string
  name?: string
  permissions: string[]
}

export function useGoogleRoles(): SWRStaticResponse<Record<string, GoogleRole>> {
  const res = useSWRImmutable("gcp/role_permissions.json", getIamDataset)
  if (!res.data) {
    return res
  }

  // transpose
  const data: Record<string, GoogleRole> = {}
  for (const [p, roles] of Object.entries(res.data)) {
    if (!Array.isArray(roles)) {
      throw new Error("unexpected data format")
    }
    for (const role of roles) {
      const { id } = role
      if (typeof id !== "string") {
        throw new Error("unexpected data format")
      }
      const key = id.slice("roles/".length)
      if (key in data) {
        data[key].permissions.push(p)
      } else {
        data[key] = { ...role, id, permissions: [p] }
      }
    }
  }
  return { ...res, data }
}

export interface GooglePermission {
  id: string
  roles: string[]
}

export function useGooglePermissions(): SWRStaticResponse<Record<string, GooglePermission>> {
  const res = useSWRImmutable("gcp/role_permissions.json", getIamDataset)
  if (!res.data) {
    return res
  }

  // to entry
  const data: Record<string, GooglePermission> = {}
  for (const [id, roles] of Object.entries(res.data)) {
    if (!Array.isArray(roles)) {
      throw new Error("unexpected data format")
    }
    data[id] = { id, roles: roles.map(r => r.id) }
  }
  return { ...res, data }
}

export interface AmazonPolicy {
  // access_levels: string[]
  arn: string
  createdate: string
  // credentials_exposure: boolean
  // data_access: boolean
  deprecated: boolean
  effective_action_names: string[]
  // malformed: boolean
  name: string
  // privesc: boolean
  // resource_exposure: boolean
  // undocumented_actions: boolean
  // unknown_actions: boolean
  updatedate: string
  version: string
}

export function useAmazonPolicies(): SWRStaticResponse<Record<string, AmazonPolicy>> {
  const res = useSWRImmutable("aws/managed_policies.json", getIamDataset)
  if (!res.data) {
    return res
  }

  const data: Record<string, AmazonPolicy> = {}
  const { policies } = res.data
  if (!Array.isArray(policies)) {
    throw new Error("unexpected data format")
  }
  for (const policy of policies) {
    const { name } = policy
    if (typeof name !== "string") {
      throw new Error("unexpected data format")
    }
    data[name] = policy
  }
  return { ...res, data }
}

export interface AmazonAction {
  action: string
  description: string
  privilege: string
  resource_types: Record<string, unknown>[]
  conditions: Record<string, unknown>[]
  service: {
    prefix: string
    resources: Record<string, unknown>[]
    service_name: string
  }
}

export function useAmazonActions(): SWRStaticResponse<Record<string, AmazonAction>> {
  const res = useSWRImmutable(`aws/iam_definition.json`, getIamDataset)
  if (!res.data) {
    return res
  }

  const data: Record<string, AmazonAction> = {}
  for (const service of res.data) {
    for (const item of service.privileges) {
      const action = `${service.prefix}:${item.privilege}`
      data[action] = {
        action,
        ...item,
        service: {
          prefix: service.prefix,
          resources: service.resources,
          service_name: service.service_name
        }
      }
    }
  }
  return { ...res, data }
}
