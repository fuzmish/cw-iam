import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { CompareRoles } from "./components/CompareRoles"
import { RoleDetails } from "./components/RoleDetails"
import { RoleSearchForm, RoleSearchResult } from "./components/RoleSearch"
import { TabGroup } from "./components/TabGroup"

export function Layout() {
  return (
    <PanelGroup direction="horizontal">
      <Panel
        defaultSize={60}
        className="stacked left"
      >
        <RoleSearchForm />
        <RoleSearchResult />
      </Panel>
      <PanelResizeHandle />
      <Panel
        defaultSize={40}
        className="right"
      >
        <TabGroup
          tabs={[
            {
              key: "role",
              title: "Role Details",
              children: <RoleDetails />
            },
            {
              key: "compare",
              title: "Compare Roles",
              children: <CompareRoles />
            }
          ]}
        />
      </Panel>
    </PanelGroup>
  )
}
