import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App"
import "./index.css"

// After an upload the script files get new names; a page opened from an older copy cannot find
// its lazily loaded parts. Reload once per tab to pick up the new page instead of staying blank.
const RELOAD_FLAG = "chernikov-chunk-reload"
window.addEventListener("vite:preloadError", (event) => {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return
    sessionStorage.setItem(RELOAD_FLAG, "1")
  } catch {
    return
  }
  event.preventDefault()
  window.location.reload()
})

const root = document.getElementById("root")
if (!root) throw new Error("#root is missing from index.html")

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
