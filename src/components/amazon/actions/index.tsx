import { useParams } from "react-router-dom"
import { useAmazonActions } from "../../../data"
import { CommonDetail, CommonPanel } from "../../common"

export function AmazonActions() {
  const { data, error } = useAmazonActions()
  return <CommonPanel data={data} error={error} keys={[{ displayName: "action", primary: true, noSelection: true }]} />
}

export function AmazonActionsDetail() {
  const { key } = useParams()
  const { data, error } = useAmazonActions()
  return (
    <CommonDetail
      data={data}
      displayProperties={["action", "description"]}
      displayPropertiesForJson={["action", "description", "privilege", "resource_types", "conditions", "service"]}
      entryKey={key}
      error={error}
      noSelection={true}
      titleForKey="AWS / IAM Actions / Detail"
    />
  )
}
