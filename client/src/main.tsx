import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("Clerk PK:", import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

createRoot(document.getElementById("root")!).render(
<ClerkProvider
  publishableKey={PUBLISHABLE_KEY}
  appearance={{
    baseTheme: dark,
    variables: {
      colorPrimary: "#3FAF8F",      // your accent (sage/teal)
      colorBackground: "#0b2b22",   // forest background
      colorText: "#E8F3EE",
      colorInputBackground: "#0f3a2e",
      colorInputText: "#E8F3EE",
      borderRadius: "12px",
      fontFamily: "Inter, system-ui, sans-serif"
    },
    elements: {
      card: "shadow-2xl backdrop-blur-md border border-emerald-900/40",
      headerTitle: "text-emerald-50",
      headerSubtitle: "text-emerald-200",
      formButtonPrimary:
        "bg-emerald-600 hover:bg-emerald-500 text-white transition-all",
      socialButtonsBlockButton:
        "border border-emerald-800 hover:bg-emerald-900/40",
      formFieldInput:
        "bg-emerald-950/40 border-emerald-800 text-emerald-50",
      footerActionLink:
        "text-emerald-300 hover:text-emerald-200",
    },
  }}
>
  <App />
</ClerkProvider>
);

