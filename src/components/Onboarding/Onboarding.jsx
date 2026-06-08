import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Settings as SettingsIcon } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import "./Onboarding.css";

export default function Onboarding() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { githubToken, geminiApiKey, setIsSettingsOpen } = useOutletContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/dashboard/${encodeURIComponent(username.trim())}`);
    }
  };

  const handleQuickstart = (name) => {
    navigate(`/dashboard/${encodeURIComponent(name)}`);
  };

  const popularProfiles = [
    {
      login: "gaearon",
      name: "Dan Abramov",
      role: "React / Redux Creator",
      avatar: "https://github.com/gaearon.png",
    },
    {
      login: "yyx990803",
      name: "Evan You",
      role: "Vue / Vite Creator",
      avatar: "https://github.com/yyx990803.png",
    },
    {
      login: "torvalds",
      name: "Linus Torvalds",
      role: "Linux & Git Creator",
      avatar: "https://github.com/torvalds.png",
    },
    {
      login: "tj",
      name: "TJ Holowaychuk",
      role: "Express & Go Dev",
      avatar: "https://github.com/tj.png",
    },
  ];

  const hasGithubToken = !!githubToken;
  const hasGeminiKey = !!geminiApiKey;

  return (
    <motion.div
      className="onboarding-wrap animate-fade-in mx-auto"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="search-form row gy-3 gx-3 align-items-end"
      >
        <div className="col-12 col-md-8">
          <div className="position-relative">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="search-input-icon"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <input
              type="text"
              className="search-input-field"
              id="github-username-input"
              placeholder="Enter GitHub username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="off"
              autoFocus
            />
          </div>
        </div>

        <div className="col-12 col-md-4 d-grid">
          <button
            type="submit"
            className="btn btn-primary search-btn"
            disabled={!username.trim()}
          >
            <Search size={18} />
            Analyze
          </button>
        </div>
      </form>

      {/* API Configuration Stats */}
      <div className="d-flex flex-wrap justify-content-center gap-3 mb-4 text-secondary small">
        <span className="d-flex align-items-center gap-1">
          GitHub Token:
          <span
            className="badge"
            style={{
              fontSize: "0.65rem",
              padding: "0.1rem 0.4rem",
              backgroundColor: hasGithubToken
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(255,255,255,0.02)",
              color: hasGithubToken ? "#10b981" : "#64748b",
            }}
          >
            {hasGithubToken ? "Active" : "Unset (60 req/hr limit)"}
          </span>
        </span>
        <span className="d-none d-sm-inline">•</span>
        <span className="d-flex align-items-center gap-1">
          Gemini Key:
          <span
            className="badge"
            style={{
              fontSize: "0.65rem",
              padding: "0.1rem 0.4rem",
              backgroundColor: hasGeminiKey
                ? "rgba(139, 92, 246, 0.1)"
                : "rgba(255,255,255,0.02)",
              color: hasGeminiKey ? "#8b5cf6" : "#64748b",
            }}
          >
            {hasGeminiKey ? "Active" : "Using Local Parser"}
          </span>
        </span>
        <span className="d-none d-sm-inline">•</span>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="btn btn-link p-0 text-primary fw-semibold d-flex align-items-center gap-1"
          type="button"
        >
          <SettingsIcon size={12} />
          Configure Keys
        </button>
      </div>

      {/* Quickstart Grid */}
      <div className="quickstart-section">
        <h3 className="quickstart-title">Quick-Start Sandbox Profiles</h3>
        <div className="quickstart-grid d-flex justify-content-center g-3 row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-2">
          {popularProfiles.map((profile) => (
            <div key={profile.login} className="col" style={{ width: "auto" }}>
              <button
                type="button"
                className="quickstart-card btn btn-outline-secondary w-100 h-100 text-start"
                onClick={() => handleQuickstart(profile.login)}
              >
                <img
                  className="quickstart-avatar rounded-circle"
                  src={profile.avatar}
                  alt={profile.name}
                  loading="lazy"
                />
                <span className="quickstart-name">{profile.name}</span>
                <span className="quickstart-role">{profile.role}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
