import { IconBaseProps, IconType } from "react-icons"
import { FaCircleInfo, FaSquareArrowUpRight } from "react-icons/fa6"
import { NavigateOptions, To, useNavigate } from "react-router-dom"

export function NavigateButton({
  to,
  options,
  type = "info",
  Icon,
  ...rest
}: {
  to: To
  options?: NavigateOptions
  type?: "info" | "link"
  Icon?: IconType
} & Omit<IconBaseProps, "className" | "onClick">) {
  const navigate = useNavigate()
  if (typeof Icon === "undefined") {
    switch (type) {
      case "info": {
        Icon = FaCircleInfo
        break
      }
      case "link": {
        Icon = FaSquareArrowUpRight
        break
      }
    }
  }
  return <Icon {...rest} className="icon clickable" onClick={() => navigate(to, options)} />
}
