import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ensureWorkspace } from "./lib/workspace";

// Create workspace folders at startup; don't block render if it fails
ensureWorkspace().catch((e) =>
  console.error("Workspace init failed:", e)
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);