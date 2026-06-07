import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, AlertCircle, X, Sun, Moon } from "lucide-react";
import Onboarding from "./components/Onboarding/Onboarding";
import Dashboard from "./components/Dashboard/Dashboard";
import Settings from "./components/Settings/Settings";
import { fetchGitHubProfile, fetchGitHubRepos } from "./utils/github";
import { runPortfolioAnalysis } from "./utils/analyzer";
import { generateAiReport } from "./utils/ai";
import "./App.css";

function App() {
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("devlens_theme", theme);
  }, [theme]);

  // Analytical data states
  const [profileData, setProfileData] = useState(null);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [aiReport, setAiReport] = useState(null);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAnalyzeUser = async (targetUsername) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Fetch profile information
      const profile = await fetchGitHubProfile(targetUsername, githubToken);

      // 2. Fetch all public repositories
      const repos = await fetchGitHubRepos(targetUsername, githubToken);

      // 3. Perform local heuristics calculations (stars, complexity, languages)
      const analysis = runPortfolioAnalysis(profile, repos);

      // 4. Generate Career Report (Gemini API or detailed Local Heuristics)
      const report = await generateAiReport(profile, analysis, geminiApiKey);

      // 5. Commit everything to State
      setProfileData(profile);
      setAnalyzedData(analysis);
      setAiReport(report);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.message || "An unexpected error occurred. Please try again.",
      );
      // Keep existing data if query failed so they don't lose the screen
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProfileData(null);
    setAnalyzedData(null);
    setAiReport(null);
    setErrorMessage("");
  };

  return (
    <motion.div
      className="app-container container py-4"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {/* Navigation Header */}
      <header className="app-header d-flex flex-column flex-md-row align-items-start justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="hero-logo-box">
            <Terminal size={40} />
          </div>
          <div>
            <button
              onClick={handleReset}
              className="btn btn-link p-0 text-decoration-none text-white"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <h1 className="onboarding-title mb-1">DevLens</h1>
            </button>
            <p className="onboarding-desc mb-0">
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
      <main className="d-flex flex-column">
        {/* Error Alert Box */}
        {errorMessage && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              borderColor: "rgba(239, 68, 68, 0.25)",
              color: "#f87171",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              fontSize: "0.95rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              style={{
                background: "none",
                border: "none",
                color: "#f87171",
                cursor: "pointer",
                display: "flex",
              }}
              aria-label="Close error message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {isLoading ? (
          <div
            className="flex-center animate-fade-in"
            style={{
              flex: 1,
              flexDirection: "column",
              gap: "1rem",
              minHeight: "350px",
            }}
          >
            <div className="spinner" />
            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              Retrieving GitHub Profile Details...
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Analyzing repositories, compiling language distributions, and
              generating career insights.
            </p>
          </div>
        ) : profileData ? (
          <Dashboard
            profileData={profileData}
            analyzedData={analyzedData}
            aiReport={aiReport}
            githubToken={githubToken}
            onReset={handleReset}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isAnalyzing={isLoading}
          />
        ) : (
          <Onboarding
            onSubmit={handleAnalyzeUser}
            isLoading={isLoading}
            onOpenSettings={() => setIsSettingsOpen(true)}
            hasGithubToken={!!githubToken}
            hasGeminiKey={!!geminiApiKey}
          />
        )}
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
    </motion.div>
  );
}

export default App;
