import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter, NavLink, Navigate, Route, Routes } from "react-router-dom"
import { AmazonActions, AmazonActionsDetail } from "./components/amazon/actions"
import { AmazonPolicies, AmazonPoliciesCompare, AmazonPoliciesDetail } from "./components/amazon/policies"
import { Permalink } from "./components/common"
import { About } from "./components/common/About"
import { GooglePermissions, GooglePermissionsCompare, GooglePermissionsDetail } from "./components/google/permissions"
import { GoogleRoles, GoogleRolesCompare, GoogleRolesDetail } from "./components/google/roles"
import { DefaultContextProvider, StateKeyPrefixContextProvider } from "./context"

import "highlight.js/styles/base16/gruvbox-dark-hard.css"
import "./default.css"

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <DefaultContextProvider>
      <HashRouter>
        <header>
          <Permalink />
          <NavLink to="roles">GCP / Predefined Roles</NavLink>
          <NavLink to="permissions">GCP / IAM Permissions</NavLink>
          <NavLink to="policies">AWS / Managed Policies</NavLink>
          <NavLink to="actions">AWS / IAM Actions</NavLink>
          <NavLink to="about">About</NavLink>
        </header>
        <Routes>
          <Route element={<Navigate replace to="roles" />} index />
          <Route
            element={
              <StateKeyPrefixContextProvider value="roles">
                <GoogleRoles />
              </StateKeyPrefixContextProvider>
            }
            path="roles"
          >
            <Route element={<Navigate replace to="compare" />} index />
            <Route element={<GoogleRolesCompare />} path="compare" />
            <Route element={<GoogleRolesDetail />} path=":key" />
          </Route>
          <Route
            element={
              <StateKeyPrefixContextProvider value="permissions">
                <GooglePermissions />
              </StateKeyPrefixContextProvider>
            }
            path="permissions"
          >
            <Route element={<Navigate replace to="compare" />} index />
            <Route element={<GooglePermissionsCompare />} path="compare" />
            <Route element={<GooglePermissionsDetail />} path=":key" />
          </Route>
          <Route
            element={
              <StateKeyPrefixContextProvider value="policies">
                <AmazonPolicies />
              </StateKeyPrefixContextProvider>
            }
            path="policies"
          >
            <Route element={<Navigate replace to="compare" />} index />
            <Route element={<AmazonPoliciesCompare />} path="compare" />
            <Route element={<AmazonPoliciesDetail />} path=":key" />
          </Route>
          <Route
            element={
              <StateKeyPrefixContextProvider value="actions">
                <AmazonActions />
              </StateKeyPrefixContextProvider>
            }
            path="actions"
          >
            <Route element={<AmazonActionsDetail />} path=":key" />
          </Route>
          <Route element={<About />} path="about" />
        </Routes>
      </HashRouter>
    </DefaultContextProvider>
  </StrictMode>
)
