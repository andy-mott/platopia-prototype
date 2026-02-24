import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalog from "./catalog/Catalog";
import ExperienceShell from "./catalog/ExperienceShell";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/experience/:id" element={<ExperienceShell />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
