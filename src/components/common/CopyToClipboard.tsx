import { ReactNode, useState } from "react"
import { FaCheck, FaCopy } from "react-icons/fa6"
import { HoverMenu, IHoverMenuProps } from "./HoverMenu"

export function CopyToClipboard({
  text,
  label = text,
  delayForMessage = 750,
  buttonOnly = false,
  ...rest
}: {
  text: string
  label?: ReactNode
  delayForMessage?: number
  buttonOnly?: boolean
} & Omit<IHoverMenuProps, "children" | "label">) {
  const [copied, setCopied] = useState(false)
  const button = copied ? (
    <FaCheck className="icon highlight" title="Copied" />
  ) : (
    <FaCopy
      className="icon clickable"
      onClick={() =>
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), Math.max(0, delayForMessage))
          })
          .catch(err => console.error(err))
      }
      title="Copy to clipboard"
    />
  )
  return buttonOnly ? (
    button
  ) : (
    <HoverMenu {...rest} label={label}>
      {button}
    </HoverMenu>
  )
}
