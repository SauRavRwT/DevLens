import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sun, Moon, } from "lucide-react";
import Settings from "../Settings/Settings";

export default function MainLayout() {
  const navigate = useNavigate();

  // Config & API Keys states
  const [githubToken, setGithubToken] = useState(
    () => localStorage.getItem("devlens_gh_token") || "",
  );
  const [geminiApiKey, setGeminiApiKey] = useState(
    () => localStorage.getItem("devlens_gemini_key") || "",
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("devlens_theme") || "dark",
  );
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("devlens_theme", theme);
  }, [theme]);

  const handleLogoClick = () => {
    setProfileData(null);
    navigate("/");
  };

  return (
    <div className="app-container container py-4 animate-fade-in">
      {/* Navigation Header */}
      <header className="app-header d-flex flex-column flex-md-row align-items-start justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div>
            <button
              onClick={handleLogoClick}
              className="btn btn-link p-0 text-decoration-none text-white cursor-pointer"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <h1 className="app-title mb-1 hero-logo-box">DevLens</h1>
            </button>
            <p className="app-desc mb-0">
              Evaluate your public GitHub repositories, calculate complexity
              metrics, score README documentation, and generate career insights.
            </p>
          </div>
        </div>

        <div className="header-actions d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          {profileData && (
            <div className="ai-status-indicator d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill border">
              <img
                src={profileData.avatar_url}
                alt={profileData.login}
                className="rounded-circle"
                style={{
                  width: "32px",
                  height: "32px",
                  objectFit: "cover",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              />
              <span>
                User: <strong>{profileData.login}</strong>
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="d-flex flex-column flex-grow-1">
        <Outlet
          context={{
            githubToken,
            setGithubToken,
            geminiApiKey,
            setGeminiApiKey,
            isSettingsOpen,
            setIsSettingsOpen,
            profileData,
            setProfileData,
          }}
        />
      </main>

      {/* Footer Branding */}
      <footer className="footer-branding text-center mt-5 pt-4 border-top border-secondary-subtle">
        <p className="mb-1">
          DevLens — AI GitHub Portfolio Recruiter Assessment
        </p>
        <p className="mb-0 small opacity-75">
          Client-side evaluation. Your GitHub and Gemini credentials never leave
          your browser.
        </p>
      </footer>

      {/* Settings Modal overlay */}
      <Settings
        key={isSettingsOpen ? "open" : "closed"}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        githubToken={githubToken}
        setGithubToken={setGithubToken}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={setGeminiApiKey}
      />
    </div>
  );
}
