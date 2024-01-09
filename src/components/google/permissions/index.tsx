import { useParams } from "react-router-dom"
import { useGooglePermissions } from "../../../data"
import { CommonCompare, CommonDetail, CommonPanel } from "../../common"

export function GooglePermissions() {
  const { data, error } = useGooglePermissions()
  return (
    <CommonPanel
      data={data}
      error={error}
      keys={[
        { primary: true, displayName: "id" },
        { name: "roles", getFn: ({ value }) => value.roles.join("\n") }
      ]}
    />
  )
}

export function GooglePermissionsDetail() {
  const { data, error } = useGooglePermissions()
  const { key } = useParams()
  return (
    <CommonDetail
      data={data}
      displayProperties={["id"]}
      displayPropertiesForJson={["id", "roles"]}
      entryKey={key}
      entryToItems={entry => entry.roles}
      error={error}
      filterKeyForItems="roles"
      routePrefixForItemsDetail="../../"
      titleForItems="Predefined roles that include this permission"
      titleForKey="GCP / IAM Permissions / Detail"
    />
  )
}

export function GooglePermissionsCompare() {
  const { data, error } = useGooglePermissions()
  return (
    <CommonCompare
      data={data}
      entryToItems={entry => entry.roles.map(key => ({ key }))}
      error={error}
      routePrefixForItemsDetail="../../"
      title="GCP / IAM Permissions / Compare"
      titleForComparison="Predefined roles that include this permission"
      titleForSelection="Selected permissions"
    />
  )
}
