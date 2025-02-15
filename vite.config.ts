import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(env => ({
  base: "/cw-iam/", // GitHub Pages
  plugins: [react()],
  publicDir: env.mode === "development" ? "data" : "public",
  server: {
    host: "127.0.0.1"
  }
}))
