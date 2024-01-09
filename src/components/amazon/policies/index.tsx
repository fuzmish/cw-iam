import { useParams } from "react-router-dom"
import { useAmazonPolicies } from "../../../data"
import { CommonCompare, CommonDetail, CommonPanel } from "../../common"

export function AmazonPolicies() {
  const { data, error } = useAmazonPolicies()
  return (
    <CommonPanel
      data={data}
      error={error}
      keys={[
        { primary: true, displayName: "name" },
        { name: "actions", getFn: ({ value }) => value.effective_action_names.toSorted().join("\n") }
      ]}
    />
  )
}

export function AmazonPoliciesDetail() {
  const { data, error } = useAmazonPolicies()
  const { key } = useParams()
  return (
    <CommonDetail
      data={data}
      displayProperties={["name", "arn", "createdate", "updatedate", "version", "deprecated"]}
      displayPropertiesForJson={[
        "arn",
        "createdate",
        "deprecated",
        "effective_action_names",
        "name",
        "updatedate",
        "version"
      ]}
      entryKey={key}
      entryToItems={entry => entry.effective_action_names}
      error={error}
      filterKeyForItems="actions"
      routePrefixForItemsDetail="../../actions/"
      titleForItems="Actions"
      titleForKey="AWS / Managed Policies / Detail"
    />
  )
}

export function AmazonPoliciesCompare() {
  const { data, error } = useAmazonPolicies()
  return (
    <CommonCompare
      data={data}
      entryToItems={entry => entry.effective_action_names.map(key => ({ key }))}
      error={error}
      routePrefixForItemsDetail="../../actions/"
      title="AWS / Managed Policies / Compare"
      titleForComparison="Actions"
      titleForSelection="Selected policies"
    />
  )
}
