import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { SUBJECTS, type HomeworkItem } from "./mockData";
import logoWordmark from "./assets/logo-wordmark.svg";
import menuIcon from "./assets/icon-menu.svg";
import HwDetailModal from "./HwDetailModal";
import VariantFigmaMobile from "./VariantFigmaMobile";
import VariantTimelineDashboard from "./VariantTimelineDashboard";
import VariantPriorityInbox from "./VariantPriorityInbox";
import VariantCalendarWeek from "./VariantCalendarWeek";
import VariantKanban from "./VariantKanban";
import VariantMatrix from "./VariantMatrix";
import VariantProgressTracker from "./VariantProgressTracker";
import VariantQuickWins from "./VariantQuickWins";

const tabs = [
  { key: "figma", label: "Список+фильтр", path: "/" },
  { key: "priority", label: "Priority Inbox", path: "/priority" },
  { key: "timeline-dashboard", label: "Timeline+Dash", path: "/timeline" },
  { key: "calendar", label: "Calendar Week", path: "/calendar" },
  { key: "kanban", label: "Kanban", path: "/kanban" },
  { key: "matrix", label: "Matrix", path: "/matrix" },
  { key: "progress", label: "Progress", path: "/progress" },
  { key: "quick-wins", label: "Quick Wins", path: "/quick-wins" },
] as const;

function getActiveTab(pathname: string): string {
  if (pathname === "/priority") return "priority";
  if (pathname === "/timeline") return "timeline-dashboard";
  if (pathname === "/calendar") return "calendar";
  if (pathname === "/kanban") return "kanban";
  if (pathname === "/matrix") return "matrix";
  if (pathname === "/progress") return "progress";
  if (pathname === "/quick-wins") return "quick-wins";
  return "figma";
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = getActiveTab(location.pathname);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedHw, setSelectedHw] = useState<HomeworkItem | null>(null);

  const path = location.pathname;
  const hideFilter = path === "/priority" || path === "/timeline" || activeTab === "priority" || activeTab === "timeline-dashboard";

  return (
    <div className="proto-shell">
      <div className="proto-toolbar" role="tablist" aria-label="Prototype switcher">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`proto-tab ${activeTab === tab.key ? "proto-tab--active" : ""}`}
            onClick={() => navigate(tab.path)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="proto-phone">
        <div className="app-topbar">
          <img className="app-logo" src={logoWordmark} alt="Нейрум" />
          <button className="app-menu-button" type="button" aria-label="Open menu">
            <img className="app-menu-icon" src={menuIcon} alt="" />
          </button>
        </div>

        <div className="app-header">
          <h1 className="app-title">Задания</h1>
          {!hideFilter && (
            <label className="app-subject-filter">
              <select
                className="app-select"
                value={selectedSubjectId === null ? "all" : String(selectedSubjectId)}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSelectedSubjectId(nextValue === "all" ? null : Number(nextValue));
                }}
              >
                <option value="all">Все предметы</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <span className="app-select-chevron" aria-hidden="true">
                &#8964;
              </span>
            </label>
          )}
        </div>

        <div className="proto-screen">
          <Routes>
            <Route path="/" element={<VariantFigmaMobile selectedSubjectId={selectedSubjectId} onSelect={setSelectedHw} />} />
            <Route path="/priority" element={<VariantPriorityInbox onSelect={setSelectedHw} />} />
            <Route path="/timeline" element={<VariantTimelineDashboard onSelect={setSelectedHw} />} />
            <Route path="/calendar" element={<VariantCalendarWeek selectedSubjectId={selectedSubjectId} onSelect={setSelectedHw} />} />
            <Route path="/kanban" element={<VariantKanban selectedSubjectId={selectedSubjectId} onSelect={setSelectedHw} />} />
            <Route path="/matrix" element={<VariantMatrix selectedSubjectId={selectedSubjectId} onSelect={setSelectedHw} />} />
            <Route path="/progress" element={<VariantProgressTracker selectedSubjectId={selectedSubjectId} onSelect={setSelectedHw} />} />
            <Route path="/quick-wins" element={<VariantQuickWins selectedSubjectId={selectedSubjectId} onSelect={setSelectedHw} />} />
          </Routes>
        </div>

        {selectedHw && (
          <HwDetailModal hw={selectedHw} onClose={() => setSelectedHw(null)} />
        )}
      </div>
    </div>
  );
}

export default App;
