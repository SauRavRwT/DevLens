import { useState } from "react";
import { motion } from "framer-motion";
import { X, Shield, HelpCircle, Eye, EyeOff } from "lucide-react";
import "./Settings.css";

export default function Settings({
  isOpen,
  onClose,
  githubToken,
  setGithubToken,
  geminiApiKey,
  setGeminiApiKey,
}) {
  const [token, setToken] = useState(githubToken);
  const [apiKey, setApiKey] = useState(geminiApiKey);

  const [showToken, setShowToken] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setGithubToken(token);
    setGeminiApiKey(apiKey);
    localStorage.setItem("devlens_gh_token", token.trim());
    localStorage.setItem("devlens_gemini_key", apiKey.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content glass-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="modal-header">
          <h3 className="modal-title">
            <Shield size={20} className="logo-icon" />
            API & Key Configurations
          </h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="github-token-input">
              <span>GitHub Personal Access Token</span>
              <a
                href="https://github.com/settings/tokens/new?description=DevLens&scopes=public_repo"
                target="_blank"
                rel="noopener noreferrer"
                className="label-link"
              >
                Create token
              </a>
            </label>
            <div className="search-input-container">
              <input
                id="github-token-input"
                type={showToken ? "text" : "password"}
                className="input-field"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <button
                type="button"
                className="modal-close"
                style={{
                  position: "absolute",
                  right: "40px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="form-help">
              Optional. Increases the rate limit from 60 requests/hour to 5,000
              requests/hour for searching large portfolios.
            </p>
          </div>

          <div className="form-group" style={{ marginTop: "1.5rem" }}>
            <label className="form-label" htmlFor="gemini-key-input">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="label-link"
              >
                Get Gemini Key
              </a>
            </label>
            <div className="search-input-container">
              <input
                id="gemini-key-input"
                type={showApiKey ? "text" : "password"}
                className="input-field"
                placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                type="button"
                className="modal-close"
                style={{
                  position: "absolute",
                  right: "40px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="form-help">
              Optional. Direct client-side calls to Gemini 1.5 Flash. If blank,
              DevLens uses a highly-tuned local heuristics analyzer instead.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              background: "rgba(255, 255, 255, 0.02)",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.04)",
              marginTop: "1.5rem",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
            }}
          >
            <HelpCircle
              size={16}
              style={{
                color: "var(--primary)",
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <span>
              Tokens and Keys are stored <strong>strictly locally</strong> in
              your browser's localStorage. No server collects your keys.
            </span>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Config
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
