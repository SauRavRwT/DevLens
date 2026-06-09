import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, AlertCircle, X } from "lucide-react";
import Dashboard from "./Dashboard";
import { fetchGitHubProfile, fetchGitHubRepos } from "../../utils/github";
import { runPortfolioAnalysis } from "../../utils/analyzer";
import { generateAiReport } from "../../utils/ai";

export default function DashboardPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const {
    githubToken,
    geminiApiKey,
    setIsSettingsOpen,
    profileData,
    setProfileData,
  } = useOutletContext();

  const [analyzedData, setAnalyzedData] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadUserData = useCallback(
    async (targetUsername) => {
      setIsLoading(true);
      setErrorMessage("");
      setAnalyzedData(null);
      setAiReport(null);

      try {
        // 1. Fetch profile info
        const profile = await fetchGitHubProfile(targetUsername, githubToken);
        setProfileData(profile);

        // 2. Fetch all public repositories
        const repos = await fetchGitHubRepos(targetUsername, githubToken);

        // 3. Perform local calculations
        const analysis = runPortfolioAnalysis(profile, repos);
        setAnalyzedData(analysis);

        // 4. Generate Career report
        const report = await generateAiReport(profile, analysis, geminiApiKey);
        setAiReport(report);
      } catch (err) {
        console.error(err);
        setErrorMessage(
          err.message || "An unexpected error occurred. Please try again.",
        );
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [githubToken, geminiApiKey, setProfileData],
  );

  useEffect(() => {
    let active = true;

    if (username) {
      const run = async () => {
        await Promise.resolve();
        if (active) {
          loadUserData(username);
        }
      };
      run();
    }

    return () => {
      active = false;
      setTimeout(() => {
        setProfileData(null);
      }, 0);
    };
  }, [username, loadUserData, setProfileData]);

  return (
    <div className="d-flex flex-column flex-grow-1">
      {/* Back Button and Actions Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <button
          onClick={() => navigate("/")}
          className="btn btn-secondary btn-sm d-inline-flex align-items-center gap-2"
          style={{ padding: "0.5rem 1rem" }}
        >
          <ArrowLeft size={14} />
          Back to Search
        </button>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div
          className="glass-panel animate-fade-in mb-4"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            borderColor: "rgba(239, 68, 68, 0.25)",
            color: "#f87171",
            padding: "1rem",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.95rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
          className="flex-center animate-fade-in flex-column text-center gap-3"
          style={{ flex: 1, minHeight: "350px" }}
        >
          <div className="spinner" />
          <h2 style={{ fontSize: "1.35rem", fontWeight: 500 }}>
            Retrieving GitHub Profile Details...
          </h2>
          <p className="text-secondary small">
            Analyzing repositories, compiling language distributions, and
            generating career insights for <strong>{username}</strong>.
          </p>
        </div>
      ) : (
        profileData &&
        analyzedData && (
          <Dashboard
            profileData={profileData}
            analyzedData={analyzedData}
            aiReport={aiReport}
            githubToken={githubToken}
            onReset={() => navigate("/")}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )
      )}
    </div>
  );
}
