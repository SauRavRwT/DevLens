// AI Insights generator - supporting Gemini API and a detailed local heuristics fallback

/**
 * Generates an assessment using Google Gemini 1.5 Flash
 * @param {Object} profile
 * @param {Object} analysis
 * @param {string} apiKey
 */
export const generateAiReport = async (profile, analysis, apiKey) => {
  if (!apiKey) {
    return generateLocalReport(profile, analysis);
  }

  const prompt = `
You are an expert technical recruiter, engineering manager, and developer career coach.
Analyze the following GitHub profile details for "${profile.login}".

Profile Information:
- Name: ${profile.name || profile.login}
- Bio: ${profile.bio || "No bio provided"}
- Company: ${profile.company || "No company info"}
- Location: ${profile.location || "No location info"}
- Total Public Repos: ${analysis.totalRepos}
- Original (non-fork) Repos: ${analysis.originalReposCount}
- Total Stars Accumulated: ${analysis.totalStars}
- Total Forks: ${analysis.totalForks}
- Primary Languages Distribution: ${JSON.stringify(analysis.languages)}
- Commit/Push Activity Grade: ${analysis.activity.status} (${analysis.activity.description})
- Average Repository Complexity: ${analysis.avgComplexity}/100

Top Repositories:
${analysis.topRepos.map((r) => `- "${r.name}": Language=${r.language || "Unknown"}, Stars=${r.stargazers_count}, Complexity=${r.complexity}/100, Description=${r.description || "No description"}, README Grade=${r.readmeGrade || "B"}`).join("\n")}

Based on this structural data, perform a professional code portfolio assessment. Generate the results in structured JSON format.
The output MUST be valid JSON conforming EXACTLY to the following typescript schema:
{
  "strengths": string[]; // Exactly 5 detailed items highlighting technical strengths, stack depth, repo design, or work ethic
  "weaknesses": string[]; // Exactly 4 constructive items pointing out weaknesses (e.g., lack of tests, monolithic profiles, low activity, missing documentation)
  "resumeBulletPoints": string[]; // Exactly 4 high-impact resume bullet points using the STAR format (Situation, Task, Action, Result) referencing their actual projects (use real repository names in bold like **repo-name**)
  "suggestedCareerPaths": Array<{ title: string; reason: string }>; // Exactly 3 targeted roles with brief reasoning based on their language distribution and repository types
  "missingSkills": string[]; // Exactly 5 technologies, tools, or concepts they should acquire next (e.g. CI/CD, testing, Docker, typescript, system design)
}

Do not include any markdown formatting (like \`\`\`json) in the API output if possible, just the raw JSON text. Do not include any text before or after the JSON.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error details:", errText);
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}. Check your API Key.`,
      );
    }

    const resData = await response.json();
    const jsonText = resData.candidates[0].content.parts[0].text;

    // Clean up any accidental markdown wrapper
    const cleanedJsonText = jsonText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    const report = JSON.parse(cleanedJsonText);

    // Validate schema basic fields to ensure they exist
    if (
      !report.strengths ||
      !report.weaknesses ||
      !report.resumeBulletPoints ||
      !report.suggestedCareerPaths ||
      !report.missingSkills
    ) {
      throw new Error("AI returned an incomplete data structure.");
    }

    return report;
  } catch (error) {
    console.error(
      "Failed to generate AI report, falling back to local engine:",
      error,
    );
    // Return local fallback but flag it
    const localReport = generateLocalReport(profile, analysis);
    localReport.isFallback = true;
    localReport.fallbackError = error.message;
    return localReport;
  }
};

/**
 * Detailed local heuristics report generator based on repository stats
 * @param {Object} profile
 * @param {Object} analysis
 */
export const generateLocalReport = (profile, analysis) => {
  const topLangs = analysis.languages.slice(0, 2).map((l) => l.name);
  const primaryLang = topLangs[0] || "JavaScript";
  const hasStars = analysis.totalStars > 0;

  const topRepo1 = analysis.topRepos[0]?.name || "Portfolio";
  const topRepo2 = analysis.topRepos[1]?.name || "Utilities";
  const topRepo3 = analysis.topRepos[2]?.name || "Web-App";
  const topRepo4 = analysis.topRepos[3]?.name || "Demo-Script";

  // 1. STRENGTHS
  const strengths = [
    `Strong core knowledge of **${primaryLang}**, which is the primary driver of codebase sizes in your portfolio.`,
    analysis.languages.length > 2
      ? `Good polyglot foundation, showing adaptability across ${analysis.languages.length} languages (including ${topLangs.join(", ")}).`
      : `High specialization in ${primaryLang}, indicating deep focus and expertise in this stack.`,
    analysis.totalRepos > 8
      ? `Proven track record of project initiation with ${analysis.totalRepos} public repositories.`
      : `Focused repo history, prioritizing code collection over scattered code fragments.`,
    analysis.avgComplexity >= 40
      ? `Maintains repository structures with moderate to high functional complexity, indicating architectural capability.`
      : `Demonstrates clean code patterns on utility repositories and scripting utilities.`,
    analysis.activity.status === "Highly Active" ||
    analysis.activity.status === "Steady"
      ? `Active profile engagement with recent pushes to GitHub, signaling active coding practices and maintenance.`
      : `Established history of completed projects showing code delivery milestones.`,
  ];

  // 2. WEAKNESSES
  const weaknesses = [
    `High dependency on **${primaryLang}** (${analysis.languages[0]?.percentage || 100}% of portfolio). Diversifying into systems languages or infrastructure tools would increase versatility.`,
    `Sparse implementation of test suites (e.g. Unit tests, Integration tests) across top repositories like **${topRepo1}**.`,
    analysis.totalStars < 5
      ? `Low profile visibility. Projects like **${topRepo1}** could benefit from social sharing, interactive demos, or packaging to increase community engagement.`
      : `Limited deployment documentation; many projects lack live preview URL setups in repository headers.`,
    `README profiles in some secondary repositories are brief and lack structured install guides or screenshots, limiting developer onboarding.`,
  ];

  // 3. RESUME BULLET POINTS (STAR Method)
  const resumeBulletPoints = [
    `Architected and built **${topRepo1}** using **${primaryLang}**, establishing clean codebase directory structures and achieving a repository complexity score of ${analysis.topRepos[0]?.complexity || 45}/100.`,
    `Refactored codebase files in **${topRepo2}**, utilizing **${analysis.topRepos[1]?.language || primaryLang}** to optimize repository weights and improve modular structure.`,
    hasStars
      ? `Developed and published **${topRepo1}** on GitHub, accumulating **${analysis.totalStars}** community stars through documentation alignment and developer interest.`
      : `Maintained a structured repository environment for **${topRepo3}**, setting up project descriptions and primary entry scripts.`,
    `Streamlined project setups by maintaining documentation in **${topRepo4}**, earning a README quality rating of "${analysis.topRepos[3]?.readmeGrade || "B"}" by adding layout headings and run commands.`,
  ];

  // 4. CAREER PATHS
  let suggestedCareerPaths;
  const lowercaseLangs = topLangs.map((l) => l.toLowerCase());

  if (
    lowercaseLangs.includes("javascript") ||
    lowercaseLangs.includes("typescript") ||
    lowercaseLangs.includes("html") ||
    lowercaseLangs.includes("css")
  ) {
    suggestedCareerPaths = [
      {
        title: "Frontend Engineer",
        reason: `Your heavy concentration of web-friendly tech stacks (${topLangs.join(", ")}) fits client-side rendering frameworks like React, Vue, or Next.js.`,
      },
      {
        title: "Full Stack Developer",
        reason: `Your ability to structure multi-layered repositories like **${topRepo1}** suggests a natural transition into Node.js, Express, or backend APIs.`,
      },
      {
        title: "Developer Relations / Advocate",
        reason: `Your profile score shows active open-source projects. Coupling coding with documentation writing qualifies you for developer education roles.`,
      },
    ];
  } else if (
    lowercaseLangs.includes("python") ||
    lowercaseLangs.includes("r") ||
    lowercaseLangs.includes("julia")
  ) {
    suggestedCareerPaths = [
      {
        title: "Data Engineer / Scientist",
        reason: `Python is the premier stack for data science. Your projects leverage scripting structures ideal for cleaning, pipelines, and mathematical models.`,
      },
      {
        title: "Backend API Developer",
        reason: `Leveraging Python's robust backend libraries (Django, FastAPI) to construct fast, documented endpoints.`,
      },
      {
        title: "Automation & DevOps Engineer",
        reason: `Your script repository weights suggest a strong knack for automation, script scheduling, and system integrations.`,
      },
    ];
  } else {
    suggestedCareerPaths = [
      {
        title: "Backend Engineer",
        reason: `Your focus on languages like ${primaryLang} aligns well with highly structured, compiled services, databases, and api systems.`,
      },
      {
        title: "Systems Developer",
        reason: `Developing low-level tooling or performance-oriented applications, leveraging compilation speeds and memory management.`,
      },
      {
        title: "Software Engineer (Generalist)",
        reason: `Adaptable coding style spanning different language syntaxes and directory environments across multiple projects.`,
      },
    ];
  }

  // 5. MISSING SKILLS
  let missingSkills;
  if (
    lowercaseLangs.includes("javascript") ||
    lowercaseLangs.includes("typescript")
  ) {
    missingSkills = [
      "Unit & Integration Testing (Vitest, Playwright, or Cypress)",
      "CI/CD Pipeline Configurations (GitHub Actions, CircleCI)",
      "Docker & Containerized Deployments",
      "TypeScript (Strict Type-Safety implementations)",
      "Advanced Cloud Deployment Services (AWS, Vercel Serverless, or Docker containers)",
    ];
  } else if (lowercaseLangs.includes("python")) {
    missingSkills = [
      "Docker & Orchestration (Kubernetes basics)",
      "Asynchronous Programming (asyncio, FastAPI routers)",
      "PyTest Framework & Automated CI integrations",
      "Relational and Document Database designs (PostgreSQL, MongoDB)",
      "REST & GraphQL API standards",
    ];
  } else {
    missingSkills = [
      "Docker Containers & Orchestration",
      "Automated Test Suites & Mocking frameworks",
      "CI/CD Pipelines (GitHub Actions)",
      "Cloud Architecture Providers (AWS, GCP, or Azure)",
      "System Design Patterns (Microservices, Event-Driven)",
    ];
  }

  return {
    strengths,
    weaknesses,
    resumeBulletPoints,
    suggestedCareerPaths,
    missingSkills,
    isLocal: true,
  };
};
