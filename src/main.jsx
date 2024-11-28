import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

import TypingTest from "./TypingTest.jsx";
import PrizesAdmin from "./components/PrizesAdmin.jsx";
import PromoCodeManager from "./components/PromoCodeManager.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<TypingTest />} />
        <Route path="/dashboard" element={<PrizesAdmin />} />
        <Route path="/todo" element={<PromoCodeManager />} />
      </Routes>
    </Router>
  </StrictMode>
);
