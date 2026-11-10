import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

const root = document.getElementById("root");
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// В сборке страница уже отрисована на сервере — подхватываем её, в разработке рисуем с нуля
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
