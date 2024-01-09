import { NavLink, useParams } from "react-router-dom"
import { useGoogleRoles } from "../../../data"
import { CommonCompare, CommonDetail, CommonPanel, HighlightMatches } from "../../common"

export function GoogleRoles() {
  const { data, error } = useGoogleRoles()
  return (
    <CommonPanel
      data={data}
      error={error}
      keys={[
        {
          primary: true,
          displayName: "id",
          content: (_, data, matches) => (
            <NavLink to={data.item.key}>
              <HighlightMatches
                matches={
                  matches.length
                    ? [{ value: "roles/", match: false }, ...matches]
                    : [{ value: data.item.value.id, match: false }]
                }
              />
            </NavLink>
          )
        },
        { name: "permissions", getFn: ({ value }) => value.permissions.join("\n") }
      ]}
    />
  )
}

export function GoogleRolesDetail() {
  const { data, error } = useGoogleRoles()
  const { key } = useParams()
  return (
    <CommonDetail
      data={data}
      displayProperties={["id", "name"]}
      displayPropertiesForJson={["id", "name", "permissions"]}
      entryKey={key}
      entryToItems={entry => entry.permissions}
      error={error}
      filterKeyForItems="permissions"
      routePrefixForItemsDetail="../../permissions/"
      titleForItems="Included permissions"
      titleForKey="GCP / Predefined Roles / Detail"
    />
  )
}

export function GoogleRolesCompare() {
  const { data, error } = useGoogleRoles()
  return (
    <CommonCompare
      data={data}
      entryToItems={entry => entry.permissions.map(key => ({ key }))}
      error={error}
      filterKeyForItems="permissions"
      getLabelForKey={entry => entry.id}
      routePrefixForItemsDetail="../../permissions/"
      title="GCP / Predefined Roles / Compare"
      titleForComparison="Included permissions"
      titleForSelection="Selected roles"
    />
  )
}
