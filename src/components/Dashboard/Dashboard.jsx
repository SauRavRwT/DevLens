import { useState } from "react";
import { motion } from "framer-motion";
import "./Dashboard.css";
import {
  GitFork,
  Star,
  MapPin,
  Building,
  Link as LinkIcon,
  Calendar,
  RotateCcw,
  Check,
  Copy,
  AlertTriangle,
  Activity,
  BarChart3,
  BookOpen,
  Briefcase,
  FileText,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import {
  RadialScore,
  LanguageChart,
  ComplexityChart,
} from "../VisualCharts/VisualCharts";
import { fetchRepoReadme } from "../../utils/github";
import { evaluateReadmeQuality } from "../../utils/analyzer";

export default function Dashboard({
  profileData,
  analyzedData,
  aiReport,
  githubToken,
  onReset,
  onOpenSettings,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedRepo, setExpandedRepo] = useState(null);
  const [readmeGrades, setReadmeGrades] = useState({});
  const [readmeLoading, setReadmeLoading] = useState({});
  const [copiedResume, setCopiedResume] = useState(false);

  // Lazy-load README details when a repository is expanded
  const handleToggleRepo = async (repoName) => {
    if (expandedRepo === repoName) {
      setExpandedRepo(null);
      return;
    }

    setExpandedRepo(repoName);

    // If already fetched and cached, skip
    if (readmeGrades[repoName] !== undefined) return;

    setReadmeLoading((prev) => ({ ...prev, [repoName]: true }));
    try {
      const readmeText = await fetchRepoReadme(
        profileData.login,
        repoName,
        githubToken,
      );
      const gradeDetails = evaluateReadmeQuality(readmeText);
      setReadmeGrades((prev) => ({ ...prev, [repoName]: gradeDetails }));
    } catch (e) {
      console.error("Error fetching/analyzing README:", e);
      setReadmeGrades((prev) => ({
        ...prev,
        [repoName]: {
          score: 0,
          grade: "?",
          suggestions: [
            "Failed to analyze README. Check API limits or settings.",
          ],
        },
      }));
    } finally {
      setReadmeLoading((prev) => ({ ...prev, [repoName]: false }));
    }
  };

  const handleCopyResumeBullets = () => {
    if (!aiReport || !aiReport.resumeBulletPoints) return;

    // Copy as a markdown bullet list
    const textToCopy = aiReport.resumeBulletPoints
      .map((bullet) => `• ${bullet.replace(/\*\*/g, "")}`) // clean markdown bold markers for raw clipboard
      .join("\n");

    navigator.clipboard.writeText(textToCopy);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  return (
    <motion.div
      className="animate-fade-in row g-4"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {/* Left Column: Profile Card */}
      <aside className="col-12 col-lg-4 mb-4">
        <div className="glass-panel profile-card h-100">
        <div className="profile-avatar-wrapper text-center mb-4 position-relative">
          <img
            className="profile-avatar rounded-circle mx-auto shadow-sm"
            src={profileData.avatar_url}
            alt={profileData.name || profileData.login}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-20px",
              right: "-20px",
              background: "var(--bg)",
              borderRadius: "50%",
              padding: "4px",
              boxShadow: "var(--shadow-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RadialScore score={analyzedData.overallScore} size={64} />
          </div>
        </div>

        <h2 className="profile-name">
          {profileData.name || profileData.login}
        </h2>
        <a
          href={profileData.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          @{profileData.login}
          <ArrowUpRight size={12} />
        </a>

        {profileData.bio && <p className="profile-bio">{profileData.bio}</p>}

        <div className="profile-details">
          {profileData.company && (
            <div className="profile-detail-item">
              <Building size={14} />
              <span>{profileData.company}</span>
            </div>
          )}
          {profileData.location && (
            <div className="profile-detail-item">
              <MapPin size={14} />
              <span>{profileData.location}</span>
            </div>
          )}
          {profileData.blog && (
            <div className="profile-detail-item">
              <LinkIcon size={14} />
              <a
                href={
                  profileData.blog.startsWith("http")
                    ? profileData.blog
                    : `https://${profileData.blog}`
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
              >
                {profileData.blog.replace(/(^\w+:|^)\/\//, "")}
              </a>
            </div>
          )}
          <div className="profile-detail-item">
            <Calendar size={14} />
            <span>
              Joined{" "}
              {new Date(profileData.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>

        <div className="profile-stats-mini row g-2 text-center">
          <div className="mini-stat-box col">
            <span className="mini-stat-val">{analyzedData.totalRepos}</span>
            <span className="mini-stat-lbl">Repos</span>
          </div>
          <div className="mini-stat-box col">
            <span className="mini-stat-val">{profileData.followers}</span>
            <span className="mini-stat-lbl">Followers</span>
          </div>
          <div className="mini-stat-box col">
            <span className="mini-stat-val">{analyzedData.totalStars}</span>
            <span className="mini-stat-lbl">Stars</span>
          </div>
        </div>

        <div className="d-grid gap-2 mt-4">
          <button
            onClick={onReset}
            className="btn btn-secondary"
            style={{ width: "100%" }}
          >
            <RotateCcw size={16} />
            Analyze New User
          </button>
          <button
            onClick={onOpenSettings}
            className="btn btn-secondary"
            style={{
              width: "100%",
              borderColor: "rgba(255,255,255,0.03)",
              fontSize: "0.8rem",
              padding: "0.5rem",
            }}
          >
            <SettingsIcon size={14} />
            Adjust API Keys
          </button>
        </div>
        </div>
      </aside>

      {/* Right Column: Dynamic Tabs Content */}
      <main className="col-12 col-lg-8" style={{ minWidth: 0 }}>
        {/* Top bar indicating engine */}
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
          <div className="ai-status-indicator">
            <div
              className={`ai-glow-dot ${aiReport?.isLocal ? "glow-fallback" : "glow-active"}`}
            />
            <span>
              Analysis Engine:{" "}
              <strong>
                {aiReport?.isLocal
                  ? "Local Parser (Demo Mode)"
                  : "Gemini 1.5 Flash (AI Mode)"}
              </strong>
            </span>
          </div>

          {aiReport?.isLocal && (
            <button
              onClick={onOpenSettings}
              style={{
                fontSize: "0.75rem",
                color: "var(--primary)",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Enable real AI generation
            </button>
          )}
        </div>

        {/* Fallback warning error display if Gemini failed */}
        {aiReport?.fallbackError && (
          <div className="fallback-warning-box">
            <AlertTriangle size={18} />
            <span>
              Gemini API Call failed ({aiReport.fallbackError}). Loaded fallback
              report instead.
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="dashboard-tabs-wrapper mb-4">
          <div
            className="row g-2"
            role="group"
            aria-label="Dashboard sections"
          >
            <div className="col-12 col-md-4">
              <button
                type="button"
                className={`btn w-100 btn-outline-secondary ${activeTab === "overview" ? "active btn-primary" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <BarChart3
                  size={16}
                  style={{ marginRight: "0.35rem", verticalAlign: "middle" }}
                />
                Overview
              </button>
            </div>
            <div className="col-12 col-md-4">
              <button
                type="button"
                className={`btn w-100 btn-outline-secondary ${activeTab === "repos" ? "active btn-primary" : ""}`}
                onClick={() => setActiveTab("repos")}
              >
                <BookOpen
                  size={16}
                  style={{ marginRight: "0.35rem", verticalAlign: "middle" }}
                />
                Repositories & READMEs
              </button>
            </div>
            <div className="col-12 col-md-4">
              <button
                type="button"
                className={`btn w-100 btn-outline-secondary ${activeTab === "ai-report" ? "active btn-primary" : ""}`}
                onClick={() => setActiveTab("ai-report")}
              >
                <FileText
                  size={16}
                  style={{ marginRight: "0.35rem", verticalAlign: "middle" }}
                />
                Career & Resume Insights
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: OVERVIEW TAB */}
        {activeTab === "overview" && (
          <section className="dashboard-section">
            {/* Top Cards */}
            <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
              <div className="col">
                <div
                  className="glass-panel metric-card h-100"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    className="metric-icon-box"
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      color: "var(--success)",
                    }}
                  >
                    <Activity size={20} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-value">
                      {analyzedData.activity.status}
                    </span>
                    <span className="metric-label">Push Activity</span>
                  </div>
                </div>
              </div>

              <div className="col">
                <div
                  className="glass-panel metric-card h-100"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    className="metric-icon-box"
                    style={{
                      background: "rgba(139, 92, 246, 0.1)",
                      color: "var(--primary)",
                    }}
                  >
                    <BarChart3 size={20} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-value">
                      {analyzedData.avgComplexity}/100
                    </span>
                    <span className="metric-label">Avg Complexity</span>
                  </div>
                </div>
              </div>

              <div className="col">
                <div
                  className="glass-panel metric-card h-100"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    className="metric-icon-box"
                    style={{
                      background: "rgba(236, 72, 153, 0.1)",
                      color: "var(--secondary)",
                    }}
                  >
                    <GitFork size={20} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-value">
                      {analyzedData.totalForks}
                    </span>
                    <span className="metric-label">Total Forks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Language Breakdown */}
            <article className="glass-panel">
              <h3
                style={{
                  fontSize: "1.15rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Activity size={18} style={{ color: "var(--primary)" }} />
                Code Weight Distribution (Languages)
              </h3>
              <LanguageChart languages={analyzedData.languages} />
            </article>

            {/* Portfolio Heuristics Details */}
            <div className="row row-cols-1 row-cols-lg-2 g-4">
              <div className="col">
                <div
                  className="glass-panel h-100"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Repository Complexity Scale
                  </h4>
                  <ComplexityChart score={analyzedData.avgComplexity} />
                </div>
              </div>

              <div className="col">
                <div
                  className="glass-panel h-100"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Profile Activity Health
                  </h4>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                    }}
                  >
                    Last Push: {analyzedData.activity.lastPushDate || "Unknown"}
                  </p>
                  <p
                    style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
                  >
                    {analyzedData.activity.description}
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    Analyzed <strong>{analyzedData.originalReposCount}</strong>{" "}
                    source codebases and <strong>{analyzedData.forkRepos}</strong>{" "}
                    repository forks.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: REPOSITORIES TAB */}
        {activeTab === "repos" && (
          <section className="dashboard-section">
            <div className="glass-panel" style={{ paddingBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                Top 5 Analyzed Repositories
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginBottom: "1rem",
                }}
              >
                Select a repository to inspect codebase complexity and review
                automated README quality audits.
              </p>
            </div>

            <div className="repo-list">
              {analyzedData.topRepos.map((repo) => {
                const isExpanded = expandedRepo === repo.name;
                const rGrade = readmeGrades[repo.name];
                const rLoading = readmeLoading[repo.name];

                return (
                  <div key={repo.name} className="repo-item-wrapper">
                    {/* Header bar click triggers collapse toggle */}
                    <div
                      className="repo-item-header"
                      onClick={() => handleToggleRepo(repo.name)}
                    >
                      <div className="repo-header-left">
                        <div>
                          <div className="repo-name-text">{repo.name}</div>
                          {repo.description && (
                            <p className="repo-desc">{repo.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="repo-header-right">
                        {repo.language && (
                          <span
                            className="badge badge-purple"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {repo.language}
                          </span>
                        )}
                        <span
                          className="badge"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.75rem",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <Star
                            size={12}
                            style={{
                              color: "var(--warning)",
                              fill: "var(--warning)",
                            }}
                          />
                          {repo.stargazers_count}
                        </span>

                        <span
                          className={`badge ${
                            repo.complexity >= 70
                              ? "complexity-high"
                              : repo.complexity >= 40
                                ? "complexity-medium"
                                : "complexity-low"
                          }`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          Cplx: {repo.complexity}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>

                    {/* Detailed drawer content */}
                    {isExpanded && (
                      <div className="repo-item-body">
                        <div className="repo-metrics-panel">
                          <h4
                            style={{
                              fontSize: "0.85rem",
                              textTransform: "uppercase",
                              color: "var(--text-muted)",
                            }}
                          >
                            Metrics Detail
                          </h4>

                          <div className="repo-metric-row">
                            <span className="repo-metric-label">
                              Disk Weight
                            </span>
                            <span className="repo-metric-val">
                              {repo.size > 1024
                                ? `${(repo.size / 1024).toFixed(1)} MB`
                                : `${repo.size} KB`}
                            </span>
                          </div>
                          <div className="repo-metric-row">
                            <span className="repo-metric-label">
                              Open Issues
                            </span>
                            <span className="repo-metric-val">
                              {repo.open_issues_count}
                            </span>
                          </div>
                          <div className="repo-metric-row">
                            <span className="repo-metric-label">
                              Forks count
                            </span>
                            <span className="repo-metric-val">
                              {repo.forks_count}
                            </span>
                          </div>
                          <div className="repo-metric-row">
                            <span className="repo-metric-label">
                              Is Forked?
                            </span>
                            <span className="repo-metric-val">
                              {repo.fork ? "Yes" : "No"}
                            </span>
                          </div>
                          {repo.homepage && (
                            <div className="repo-metric-row">
                              <span className="repo-metric-label">
                                Deployment
                              </span>
                              <span className="repo-metric-val">
                                <a
                                  href={repo.homepage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "var(--primary)",
                                    textDecoration: "none",
                                  }}
                                >
                                  Live Link
                                </a>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="readme-audit-panel">
                          {rLoading ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontSize: "0.85rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              <div
                                className="spinner"
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  borderWidth: "2px",
                                }}
                              />
                              <span>Analyzing README markdown...</span>
                            </div>
                          ) : rGrade ? (
                            <>
                              <div className="readme-audit-title">
                                <BookOpen
                                  size={16}
                                  style={{ color: "var(--primary)" }}
                                />
                                <span>README Grade:</span>
                                <span
                                  className={`badge ${
                                    rGrade.grade.startsWith("A")
                                      ? "badge-success"
                                      : rGrade.grade === "B" ||
                                          rGrade.grade === "C"
                                        ? "badge-warning"
                                        : "complexity-high"
                                  }`}
                                  style={{
                                    fontSize: "0.85rem",
                                    fontWeight: 800,
                                  }}
                                >
                                  {rGrade.grade} ({rGrade.score}/100)
                                </span>
                              </div>

                              {rGrade.suggestions.length > 0 ? (
                                <ul className="readme-suggestions-list">
                                  {rGrade.suggestions.map((suggestion, idx) => (
                                    <li
                                      key={idx}
                                      className="readme-suggestion-item"
                                    >
                                      <AlertTriangle size={12} />
                                      <span>{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.35rem",
                                    fontSize: "0.8rem",
                                    color: "var(--success)",
                                    marginTop: "0.5rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  <CheckCircle size={14} />
                                  <span>
                                    Outstanding documentation! Standard metadata
                                    structures detected.
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              Could not fetch README metrics.
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Tab 3: AI CAREER & RESUME REPORT */}
        {activeTab === "ai-report" && (
          <section className="dashboard-section">
            {/* Career Suggestions Header */}
            <article className="glass-panel">
              <h3 className="ai-section-title">
                <Briefcase size={18} style={{ color: "var(--primary)" }} />
                Suggested Career Paths
              </h3>
              <div className="career-paths-grid">
                {aiReport?.suggestedCareerPaths.map((path, idx) => (
                  <div key={idx} className="glass-panel career-path-card">
                    <h4 className="career-title">{path.title}</h4>
                    <p className="career-desc">{path.reason}</p>
                  </div>
                ))}
              </div>
            </article>

            {/* Strengths & Weaknesses Grids */}
            <div className="row row-cols-1 row-cols-lg-2 g-4">
              <div className="col">
                <article className="glass-panel h-100">
                  <h3 className="ai-section-title">
                    <CheckCircle size={18} style={{ color: "var(--success)" }} />
                    Key Strengths
                  </h3>
                  <ul className="insight-bullets-list">
                    {aiReport?.strengths.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="insight-bullet-item bullet-strength"
                      >
                        <Check size={16} />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: bullet.replace(
                              /\*\*(.*?)\*\*/g,
                              "<strong>$1</strong>",
                            ),
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </article>
              </div>

              <div className="col">
                <article className="glass-panel h-100">
                  <h3 className="ai-section-title">
                    <AlertTriangle size={18} style={{ color: "var(--danger)" }} />
                    Constructive Feedback
                  </h3>
                  <ul className="insight-bullets-list">
                    {aiReport?.weaknesses.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="insight-bullet-item bullet-weakness"
                      >
                        <AlertTriangle size={16} />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: bullet.replace(
                              /\*\*(.*?)\*\*/g,
                              "<strong>$1</strong>",
                            ),
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>

            {/* Resume Bullets Card */}
            <article className="glass-panel">
              <div className="resume-header">
                <h3
                  className="ai-section-title"
                  style={{
                    borderBottom: "none",
                    marginBottom: 0,
                    paddingBottom: 0,
                  }}
                >
                  <FileText size={18} style={{ color: "var(--info)" }} />
                  STAR Resume Bullet Points
                </h3>
                <button
                  onClick={handleCopyResumeBullets}
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                >
                  {copiedResume ? (
                    <span className="copied-indicator">
                      <Check size={14} />
                      Copied!
                    </span>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginBottom: "1.25rem",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  paddingBottom: "0.5rem",
                }}
              >
                Add these result-oriented STAR statements (Situation, Task,
                Action, Result) referencing your real repositories to your
                resume.
              </p>

              <ul className="insight-bullets-list">
                {aiReport?.resumeBulletPoints.map((bullet, idx) => (
                  <li key={idx} className="insight-bullet-item bullet-resume">
                    <FileText size={16} />
                    <span
                      dangerouslySetInnerHTML={{
                        __html: bullet.replace(
                          /\*\*(.*?)\*\*/g,
                          "<strong>$1</strong>",
                        ),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </article>

            {/* Missing Skills Card */}
            <article className="glass-panel">
              <h3 className="ai-section-title">
                <SettingsIcon size={18} style={{ color: "var(--warning)" }} />
                Suggested Skills to Learn Next
              </h3>
              <ul className="insight-bullets-list">
                {aiReport?.missingSkills.map((skill, idx) => (
                  <li key={idx} className="insight-bullet-item bullet-skill">
                    <SettingsIcon size={16} />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        )}
      </main>
    </motion.div>
  );
}
