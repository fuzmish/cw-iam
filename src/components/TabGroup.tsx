import { type ReactNode, createContext, use } from "react"

export interface TabState {
  readonly currentTab: string | null
}

export interface TabManager {
  setCurrentTab(currentTab: string | null): void
}

export const TabStateContext = createContext<TabState | null>(null)
export const TabManagerContext = createContext<TabManager | null>(null)

export interface Tab {
  key: string
  title: string
  children: ReactNode
}

export function TabGroup({ tabs }: { tabs: Tab[] }) {
  const tabState = use(TabStateContext)
  const tabManager = use(TabManagerContext)

  let currentTab: Tab | undefined = undefined
  if (typeof tabState?.currentTab === "string") {
    currentTab = tabs.find(t => t.key === tabState.currentTab)
  }
  if (typeof currentTab === "undefined" && tabs.length) {
    currentTab = tabs[0]
  }

  return (
    <div className="tabGroup stacked">
      <div className="tabNavigation">
        {tabs.map(tab => (
          <div
            className={tab.key === currentTab?.key ? "active" : undefined}
            key={tab.key}
            onMouseDown={() => tabManager?.setCurrentTab(tab.key)}
          >
            {tab.title}
          </div>
        ))}
      </div>
      <div className="tabContent">{currentTab?.children}</div>
    </div>
  )
}
