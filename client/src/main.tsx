import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { SupabaseProvider } from "./contexts/SupabaseProvider";

createRoot(document.getElementById("root")!).render(
  <SupabaseProvider>
    <App />
  </SupabaseProvider>
);
