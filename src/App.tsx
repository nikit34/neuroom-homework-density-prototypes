import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import VariantChipsCollapse from "./VariantChipsCollapse";
import VariantTimelineDashboard from "./VariantTimelineDashboard";
import VariantPriorityInbox from "./VariantPriorityInbox";
import VariantSubjectFirst from "./VariantSubjectFirst";

const tabs = [
  { key: "priority", label: "Priority Inbox", path: "/" },
  { key: "subject", label: "Subject-first", path: "/subject" },
  { key: "chips-collapse", label: "Chips+Collapse", path: "/chips" },
  { key: "timeline-dashboard", label: "Timeline+Dash", path: "/timeline" },
] as const;

function getActiveTab(pathname: string): string {
  if (pathname === "/subject") return "subject";
  if (pathname === "/chips") return "chips-collapse";
  if (pathname === "/timeline") return "timeline-dashboard";
  return "priority";
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = getActiveTab(location.pathname);

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
            <Route path="/" element={<VariantPriorityInbox />} />
            <Route path="/subject" element={<VariantSubjectFirst />} />
            <Route path="/chips" element={<VariantChipsCollapse />} />
            <Route path="/timeline" element={<VariantTimelineDashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
