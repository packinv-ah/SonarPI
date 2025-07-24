import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { PackAndInvContextProvider } from "./context/PackAndInvContext";

// Importing necessary components and styles
const root = ReactDOM.createRoot(document.getElementById("root"));

// Rendering the main application component wrapped in context providers
root.render(
  <React.StrictMode>
    <PackAndInvContextProvider>
      <App />
    </PackAndInvContextProvider>
  </React.StrictMode>
);

reportWebVitals();
