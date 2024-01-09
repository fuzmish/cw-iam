import { useEffect } from "react"
import { FaMemory } from "react-icons/fa6"
import { useSearchParams } from "react-router-dom"
import { useDefaultState } from "../../context"

export function Permalink() {
  const [state, dispatch] = useDefaultState()
  const [searchParams] = useSearchParams()

  // load state from search params
  useEffect(() => {
    try {
      const key = [...searchParams.keys()].pop()
      if (!key) {
        return
      }

      const value = JSON.parse(atob(key))
      const { availableGroups, filterValue, selection } = value
      if (typeof availableGroups === "number" && availableGroups >= 2 && availableGroups <= 5) {
        dispatch({ type: "set", property: "availableGroups", value: availableGroups })
      }
      if (filterValue && typeof filterValue === "object") {
        const newFilterValue: Record<string, Record<string, string | null>> = {}
        for (const [prefix, dict] of Object.entries(filterValue)) {
          if (dict && typeof dict === "object") {
            for (const [key, value] of Object.entries(dict)) {
              if (typeof value === "string") {
                if (!(prefix in newFilterValue)) {
                  newFilterValue[prefix] = {}
                }
                newFilterValue[prefix][key] = value
              }
            }
          }
        }
        dispatch({ type: "set", property: "filterValue", value: newFilterValue })
      }
      if (selection && typeof selection === "object") {
        const newSelection: Record<string, Record<string, boolean>> = {}
        for (const [prefix, dict] of Object.entries(selection)) {
          if (dict && typeof dict === "object") {
            for (const [key, value] of Object.entries(dict)) {
              if (typeof value === "boolean") {
                if (!(prefix in newSelection)) {
                  newSelection[prefix] = {}
                }
                newSelection[prefix][key] = value
              }
            }
          }
        }
        dispatch({ type: "set", property: "selection", value: newSelection })
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  let href = `${location.origin}${location.pathname}${location.hash}`
  try {
    href += "?" + btoa(JSON.stringify(state))
  } catch (err) {
    console.error(err)
  }

  return (
    <a className="permalink" href={href}>
      <FaMemory />
    </a>
  )
}
