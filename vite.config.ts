import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default ({ mode }) => {
  return defineConfig({
    base: "/cw-iam/", // GitHub Pages
    plugins: [react()],
    publicDir: mode === "development" ? "data" : "public"
  })
}
