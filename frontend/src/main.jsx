import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { useAppStore } from "./store/useAppStore";
import { applyThemeToDocument } from "./store/slices/themeSlice";
import { SITE_TITLE } from "./constants/site";

applyThemeToDocument(useAppStore.getState().theme);
document.title = SITE_TITLE;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <App />
      <Toaster position="top-right" />
    </>
  </StrictMode>,
);
