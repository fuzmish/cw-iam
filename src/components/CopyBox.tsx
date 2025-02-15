import type { ComponentProps } from "react"

export function CopyBox(props: ComponentProps<"span">) {
  return (
    <span
      {...props}
      onMouseDown={e => {
        const selection = document.getSelection()
        if (selection && e.target instanceof Node) {
          e.preventDefault()
          selection.removeAllRanges()
          selection.selectAllChildren(e.target)
          return false
        }
      }}
    />
  )
}
