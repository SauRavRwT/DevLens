import "./VisualCharts.css";

// Common colors for GitHub languages
const LANGUAGE_COLORS = {
  javascript: "#f1e05a",
  typescript: "#3178c6",
  python: "#3572a5",
  html: "#e34c26",
  css: "#563d7c",
  ruby: "#701516",
  go: "#00add8",
  rust: "#dea584",
  php: "#4f5d95",
  "c++": "#f34b7d",
  "c#": "#178600",
  java: "#b07219",
  shell: "#89e051",
  vue: "#41b883",
  swift: "#f05138",
  kotlin: "#a97bff",
  c: "#555555",
};

const getLanguageColor = (langName) => {
  const normalized = langName.toLowerCase();
  return LANGUAGE_COLORS[normalized] || "#8b5cf6";
};

import "./VisualCharts.css";

// 1. SVG Circular Progress Chart
export function RadialScore({ score, label, size = 120 }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine score color
  let color = "var(--primary)";
  if (score >= 80) color = "var(--success)";
  else if (score >= 50) color = "var(--warning)";
  else if (score < 50 && score > 0) color = "var(--danger)";

  return (
    <div
      className="flex-center"
      style={{ flexDirection: "column", gap: "0.5rem" }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s ease-in-out",
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              fontFamily: "var(--heading)",
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              marginTop: "0.2rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            %
          </span>
        </div>
      </div>
      {label && (
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// 2. Language Segmented Bar & Grid Legend
export function LanguageChart({ languages }) {
  if (!languages || languages.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
        No language data available.
      </p>
    );
  }

  return (
    <div className="languages-wrap">
      {/* Horizontal Segmented Bar */}
      <div className="language-track">
        {languages.map((lang) => {
          const color = getLanguageColor(lang.name);
          return (
            <div
              key={lang.name}
              className="language-bar"
              style={{
                width: `${lang.percentage}%`,
                backgroundColor: color,
                transition: "width 0.5s ease",
              }}
              title={`${lang.name}: ${lang.percentage}%`}
            />
          );
        })}
      </div>

      {/* Grid Legend */}
      <div className="language-legend-grid">
        {languages.map((lang) => {
          const color = getLanguageColor(lang.name);
          return (
            <div key={lang.name} className="language-legend-item">
              <div
                className="lang-color-dot"
                style={{ backgroundColor: color }}
              />
              <div className="lang-text-info">
                <span className="lang-name">{lang.name}</span>
                <span className="lang-pct">{lang.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 3. Horizontal Complexity Meter
export function ComplexityChart({ score }) {
  // Map score to description
  let level = "Low Complexity";
  let desc = "Simple utilities, scripts, or single-file mockups";
  let activeColor = "var(--success)";

  if (score >= 70) {
    level = "High Complexity";
    desc = "Production-grade architecture, packages, or major web frameworks";
    activeColor = "var(--danger)";
  } else if (score >= 40) {
    level = "Medium Complexity";
    desc = "Fully-featured web components, CLI utilities, or databases";
    activeColor = "var(--warning)";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {level} ({score}/100)
        </span>
        <span
          className="badge"
          style={{
            backgroundColor: `${activeColor}15`,
            color: activeColor,
            borderColor: `${activeColor}30`,
            border: "1px solid",
          }}
        >
          {score >= 70
            ? "Advanced"
            : score >= 40
              ? "Intermediate"
              : "Foundational"}
        </span>
      </div>

      {/* Track bar */}
      <div
        style={{
          height: "8px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "9999px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: `linear-gradient(to right, var(--primary), ${activeColor})`,
            borderRadius: "9999px",
            transition: "width 0.6s ease",
          }}
        />
      </div>

      <p
        style={{
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          lineHeight: 1.4,
        }}
      >
        {desc}
      </p>
    </div>
  );
}
