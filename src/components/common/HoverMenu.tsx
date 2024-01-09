import { ReactNode, useState } from "react"
import { toClassName } from "./helpers"

export interface IHoverMenuProps {
  children: ReactNode | ReactNode[]
  label: ReactNode
  enterDelay?: number
  leaveDelay?: number
  alwaysOpen?: boolean
}

export function HoverMenu({
  children,
  label,
  enterDelay = 100,
  leaveDelay = 250,
  alwaysOpen = false
}: IHoverMenuProps) {
  const [isOpen, setIsOpen] = useState(alwaysOpen)
  const [enterTimer, setEnterTimer] = useState<number | null>(null)
  const [leaveTimer, setLeaveTimer] = useState<number | null>(null)
  return (
    <span
      className="hover-menu-container"
      onMouseEnter={
        alwaysOpen
          ? undefined
          : () => {
              if (leaveTimer !== null) {
                // cancel leave action
                clearTimeout(leaveTimer)
                setLeaveTimer(null)
              }
              if (enterTimer === null) {
                // enquene enter action
                setEnterTimer(
                  setTimeout(
                    () => {
                      setIsOpen(true)
                      setEnterTimer(null)
                    },
                    Math.max(0, enterDelay)
                  )
                )
              }
            }
      }
      onMouseLeave={
        alwaysOpen
          ? undefined
          : () => {
              if (enterTimer !== null) {
                // cancel enter action
                clearTimeout(enterTimer)
                setEnterTimer(null)
              }
              if (leaveTimer === null) {
                // enqueue leave action
                setLeaveTimer(
                  setTimeout(
                    () => {
                      setIsOpen(false)
                      setLeaveTimer(null)
                    },
                    Math.max(0, leaveDelay)
                  )
                )
              }
            }
      }
    >
      <span className="hover-menu-label">{label}</span>
      <span
        className={toClassName({
          "hover-menu-content": true,
          "hover-menu-content-opened": isOpen
        })}
      >
        {children}
      </span>
    </span>
  )
}
