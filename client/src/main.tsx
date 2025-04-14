import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";

// Performance optimization for SEO by preventing unnecessary rerenders
const appRoot = createRoot(document.getElementById("root")!);

// Wrap in StrictMode for better debug capabilities and future React features
appRoot.render(
  <StrictMode>
    <App />
  </StrictMode>
);
