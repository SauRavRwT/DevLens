import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
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
      <header className="app-header">
        <div className="logo-block">
          <h1
            className="app-title mb-0 hero-logo-box"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          >
            DevLens
          </h1>
          <p className="app-desc mb-0">
            Evaluate your public GitHub repositories, calculate complexity
            metrics, score README documentation, and generate career insights.
          </p>
        </div>

        {/* Theme toggle */}
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-sm d-inline-flex align-items-center gap-1 text-secondary"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span className="d-none d-sm-inline">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>
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
          Made with ❤️ by{" "}
          <a
            href="https://github.com/SauRavRwT"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
          >
            Balbheji
          </a>
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
