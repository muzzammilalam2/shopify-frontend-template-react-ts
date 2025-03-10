import App from "./App";
import { createRoot } from "react-dom/client";
import { initI18n } from "./utils/i18nUtils";
import ErrorBoundary from "./ErrorBoundary"; // Import the ErrorBoundary component

// Ensure that locales are loaded before rendering the app
initI18n().then(() => {
  const container = document.getElementById("app");
  if (container) {
    const root = createRoot(container);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } else {
    console.error("Failed to find the app container element.");
  }
});