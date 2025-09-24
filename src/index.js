import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "./i18n";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<div>Loading…</div>}>
          <App />
          {/* Mbaje një ToastContainer global, jo në faqe të ndryshme */}
          <ToastContainer position="top-right" autoClose={3000} theme="light" />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
