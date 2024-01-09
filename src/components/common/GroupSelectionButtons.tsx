import { SyntheticEvent } from "react"
import { IconType } from "react-icons"
import { FaCircleCheck, FaRegCircle, FaRegSquare, FaSquareCheck } from "react-icons/fa6"
import { toClassName } from "./helpers"

export function toStateKey(group: number, entryKey: string): string {
  return `${group};${entryKey}`
}

export function fromStateKey(stateKey: string): { group: number; entryKey: string } {
  const [group, entryKey] = stateKey.split(";", 2)
  if (!group || isNaN(+group) || !entryKey) {
    throw new Error("unable to parse state key")
  }
  return { group: +group, entryKey }
}

export function GroupSelectionButtons({
  availableGroups,
  entryKey,
  selectionState,
  iconType = "circle",
  onSelectionStateChange
}: {
  availableGroups: number
  entryKey: string
  selectionState: Record<string, boolean>
  iconType?: "circle" | "square"
  onSelectionStateChange?: (event: SyntheticEvent<Element>, key: string, value: boolean) => void
}) {
  return [...new Array(availableGroups)].map((_, group) => {
    const stateKey = toStateKey(group, entryKey)
    const isSelected = selectionState[stateKey]
    let Icon: IconType
    switch (iconType) {
      case "circle": {
        Icon = isSelected ? FaCircleCheck : FaRegCircle
        break
      }
      case "square": {
        Icon = isSelected ? FaSquareCheck : FaRegSquare
        break
      }
    }
    return (
      <Icon
        className={toClassName({
          icon: true,
          clickable: !!onSelectionStateChange,
          [`cg-${group}`]: true
        })}
        key={group}
        onClick={onSelectionStateChange ? event => onSelectionStateChange?.(event, stateKey, !isSelected) : undefined}
      />
    )
  })
}
