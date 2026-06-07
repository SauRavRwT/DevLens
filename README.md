# DevLens 

### AI GitHub Portfolio & Recruiter Assessment Dashboard

DevLens is a premium, client-side React application designed for developers to analyze public GitHub profiles, evaluate repository complexity, audit README documentation quality, and generate AI-powered career reports and STAR-format resume bullet points. 

Built with a modern glassmorphism aesthetic, DevLens helps developers optimize their portfolio visibility and draft impact statements that match what recruiters seek.

---

## Key Features

- **Comprehensive Portfolio Heuristics**: Analyzes public repositories to compute total stars, forks, open issues, and primary language weights. It factors in recent push history to deliver an overall portfolio health score.
- **Automated README Quality Audit**: Automatically runs structural analysis on repository READMEs (inspecting length, header layouts, installation and usage guides, licensing, code block snippets, and media shields) to score and grade documentation from A+ to F.
- **Gemini 1.5 Flash Career Analysis**: Connects directly with the Google Gemini API to generate:
  - **Key Technical Strengths** tailored to repository weights.
  - **Constructive Feedback Suggestions** highlighting portfolio areas of improvement.
  - **High-Impact STAR Statement Resume Bullets** (Situation, Task, Action, Result) mentioning real repository names.
  - **Targeted Career Path Roles** with professional justifications.
  - **Suggested Skills or Technologies** to learn next.
- **Offline Local Fallback Engine**: Fully functions without an API key by fallback-analyzing stats using native heuristic rules and mock-generating targeted developer insights.
- **Sleek Responsive UI**: Premium glassmorphism design with seamless dark and light mode themes, smooth micro-animations (Framer Motion), horizontal tab scrolling, and a fully fluid layout optimized for mobile, tablet, and desktop viewports.

---

## Technology Stack

- **Core**: React 19, Vite, Vanilla CSS
- **Styling & Layout**: Bootstrap 5 (Grids & Layout utilities), custom CSS Variables, Glassmorphism design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Visualizations**: Dynamic SVG charts (RadialScore, LanguageChart segment bars, and ComplexityChart meters)

---

## Directory Structure

```text
devlens/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and design resources
│   ├── components/         # React dashboard components
│   │   ├── Dashboard/      # Main stats, repos, and career tabs layout
│   │   ├── Onboarding/     # GitHub username search & settings form
│   │   ├── Settings/       # API credential management modal
│   │   └── VisualCharts/   # Dynamic SVG charts and data visualizations
│   ├── utils/              # Heuristics calculations and api clients
│   │   ├── ai.js           # Gemini API interface and fallback logic
│   │   ├── analyzer.js     # Repo complexity, language weighting, and README grades
│   │   └── github.js       # GitHub Profile & Repo REST API integration
│   ├── App.jsx             # App layout wrapper & global state
│   ├── App.css             # Main wrapper styling rules
│   ├── index.css           # Design tokens, themes, and global utility classes
│   └── main.jsx            # Application entrypoint
├── index.html              # HTML shell
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite build config
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/SauRavRwT/DevLens.git
   cd DevLens
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local URL (usually `http://localhost:5173`).

4. **Build for Production**:
   ```bash
   npm run build
   ```
   Compiles assets to the `dist/` directory for deployment.

---

## Security & Privacy

DevLens prioritizes security and operates entirely on the client side:
- **Zero Server Storage**: Your GitHub Personal Access Token and Google Gemini API Key are stored strictly in your browser's local storage (`localStorage`).
- **No Third-Party Tracking**: API requests are sent directly from your browser to the official GitHub API and Google Generative AI endpoints. Your credentials never touch external backend servers.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
