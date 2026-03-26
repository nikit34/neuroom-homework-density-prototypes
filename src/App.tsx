import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import VariantChipsCollapse from "./VariantChipsCollapse";
import VariantTimelineDashboard from "./VariantTimelineDashboard";

const tabs = [
  { key: "chips-collapse", label: "Чипсы + Collapse", path: "/" },
  { key: "timeline-dashboard", label: "Timeline + Dashboard", path: "/timeline" },
] as const;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === "/timeline" ? "timeline-dashboard" : "chips-collapse";

  return (
    <div className="proto-shell">
      <div className="proto-phone">
        <div className="proto-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`proto-tab ${activeTab === tab.key ? "proto-tab--active" : ""}`}
              onClick={() => navigate(tab.path)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="proto-screen">
          <Routes>
            <Route path="/" element={<VariantChipsCollapse />} />
            <Route path="/timeline" element={<VariantTimelineDashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
