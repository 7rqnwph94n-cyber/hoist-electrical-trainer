import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../hoist-electrical-trainer.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
