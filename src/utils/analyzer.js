// Heuristics analyzer for GitHub profile data

/**
 * Calculates language distribution from repositories
 * @param {Array} repos
 */
export const analyzeLanguages = (repos) => {
  const langStats = {};
  let totalWeight = 0;

  repos.forEach((repo) => {
    if (!repo.language) return;

    // Use size as a weighting factor, with a minimum size of 1 to avoid division issues
    const weight = Math.max(repo.size || 1, 1);

    if (!langStats[repo.language]) {
      langStats[repo.language] = {
        name: repo.language,
        count: 0,
        weight: 0,
      };
    }

    langStats[repo.language].count += 1;
    langStats[repo.language].weight += weight;
    totalWeight += weight;
  });

  const languages = Object.values(langStats)
    .map((lang) => ({
      name: lang.name,
      count: lang.count,
      percentage:
        totalWeight > 0 ? Math.round((lang.weight / totalWeight) * 100) : 0,
    }))
    // Filter out languages with 0 percentage and sort descending
    .filter((lang) => lang.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  // Normalise so they sum to 100% if there are elements
  const sum = languages.reduce((acc, curr) => acc + curr.percentage, 0);
  if (languages.length > 0 && sum < 100 && sum > 0) {
    languages[0].percentage += 100 - sum;
  }

  return languages;
};

/**
 * Evaluates the user's activity levels based on push times
 * @param {Array} repos
 */
export const analyzeActivity = (repos) => {
  if (repos.length === 0) {
    return {
      status: "No Repositories",
      description: "This user does not have any public repositories.",
      score: 0,
      recentPushedCount: 0,
    };
  }

  const now = new Date();
  let latestPush = null;
  let pushedLast30Days = 0;
  let pushedLast90Days = 0;

  repos.forEach((repo) => {
    if (!repo.pushed_at) return;

    const pushDate = new Date(repo.pushed_at);
    if (!latestPush || pushDate > latestPush) {
      latestPush = pushDate;
    }

    const diffDays = (now - pushDate) / (1000 * 60 * 60 * 24);
    if (diffDays <= 30) {
      pushedLast30Days++;
    }
    if (diffDays <= 90) {
      pushedLast90Days++;
    }
  });

  if (!latestPush) {
    return {
      status: "Unknown",
      description: "No push history available.",
      score: 10,
      recentPushedCount: 0,
    };
  }

  const diffDaysFromLatest = (now - latestPush) / (1000 * 60 * 60 * 24);
  let status = "Dormant";
  let description = "No active updates in the last 3 months.";
  let score = 20;

  if (diffDaysFromLatest <= 7) {
    status = "Highly Active";
    description =
      "Pushed to a repository within the past week. Active contributions observed.";
    score = 95;
  } else if (diffDaysFromLatest <= 30) {
    status = "Steady";
    description =
      "Pushed to a repository in the past month. Consistent maintenance.";
    score = 80;
  } else if (diffDaysFromLatest <= 90) {
    status = "Occasional";
    description =
      "Pushed within the last 3 months. Semi-regular contributions.";
    score = 50;
  }

  // Boost score based on volume of active repos
  if (pushedLast30Days > 1) {
    score = Math.min(100, score + 5);
  }

  return {
    status,
    description,
    score,
    recentPushedCount: pushedLast30Days,
    lastPushDate: latestPush.toLocaleDateString(),
    pushedLast90Days,
  };
};

/**
 * Calculates a complexity score for a single repository
 * @param {Object} repo
 */
export const calculateRepoComplexity = (repo) => {
  let score = 0;

  // Stars score: 2 points per star, max 30 points
  score += Math.min((repo.stargazers_count || 0) * 2, 30);

  // Forks score: 3 points per fork, max 20 points
  score += Math.min((repo.forks_count || 0) * 3, 20);

  // Size score: logarithmic base 10 size factor, max 20 points
  if (repo.size && repo.size > 0) {
    const sizeScore = Math.round(Math.log10(repo.size) * 4);
    score += Math.min(sizeScore, 20);
  }

  // Issues score: +1 point per open issue (up to 10 points)
  score += Math.min((repo.open_issues_count || 0) * 1, 10);

  // Website score: homepage URL present suggests a deployed/live project (+10 points)
  if (repo.homepage) {
    score += 10;
  }

  // Has description: (+10 points)
  if (repo.description) {
    score += 10;
  }

  return score;
};

/**
 * Gets complexity rating label
 * @param {number} score
 */
export const getComplexityLabel = (score) => {
  if (score >= 70)
    return { label: "High Complexity (Production)", class: "complexity-high" };
  if (score >= 40)
    return { label: "Medium Complexity (Utility)", class: "complexity-medium" };
  return { label: "Low Complexity (Script/Demo)", class: "complexity-low" };
};

/**
 * Grade README quality based on structure and contents
 * @param {string} readmeText
 */
export const evaluateReadmeQuality = (readmeText) => {
  if (!readmeText) {
    return {
      score: 0,
      grade: "F",
      suggestions: [
        "Missing README file. Adding one is critical to help other developers understand your project.",
      ],
    };
  }

  let score = 0;
  const suggestions = [];

  // Length Evaluation (Max 30)
  const length = readmeText.length;
  if (length > 2500) {
    score += 30;
  } else if (length > 1200) {
    score += 20;
    suggestions.push(
      "Expand your README with more detailed descriptions or usage examples.",
    );
  } else if (length > 300) {
    score += 10;
    suggestions.push(
      "Your README is brief. Consider adding installation guides, features list, and context.",
    );
  } else {
    score += 2;
    suggestions.push(
      "Extremely short README. Add basic documentation to describe what the code does.",
    );
  }

  // Check section titles (regex matches headers)
  const hasInstallation =
    /#+\s*(installation|getting\s+started|setup|install)/i.test(readmeText);
  const hasUsage = /#+\s*(usage|how\s+to\s+use|examples|quick\s*start)/i.test(
    readmeText,
  );
  const hasLicense = /#+\s*(license|licence)/i.test(readmeText);
  const hasContributing = /#+\s*(contributing|contribute)/i.test(readmeText);
  const hasFeatures = /#+\s*(features|functionality|what\s+it\s+does)/i.test(
    readmeText,
  );

  // Section checks (Max 40)
  if (hasInstallation) {
    score += 10;
  } else {
    suggestions.push(
      'Add an "Installation" section to show how to install dependencies and run the project.',
    );
  }

  if (hasUsage) {
    score += 10;
  } else {
    suggestions.push(
      'Add a "Usage" section with code blocks or CLI commands showing how to use the app.',
    );
  }

  if (hasFeatures) {
    score += 10;
  }

  if (hasLicense) {
    score += 5;
  } else {
    suggestions.push(
      'Add a "License" section to clarify open source rights (e.g. MIT, Apache).',
    );
  }

  if (hasContributing) {
    score += 5;
  }

  // Visuals and Code Blocks Check (Max 30)
  const codeBlocksCount = (readmeText.match(/```/g) || []).length / 2;
  const hasImages = /(!\[.*?\]\(.*?\))|(<img\s+src=)/i.test(readmeText);
  const hasBadges = /(img.shields.io)|(shields.io)|(badge)/i.test(readmeText);

  if (codeBlocksCount >= 2) {
    score += 15;
  } else if (codeBlocksCount === 1) {
    score += 8;
    suggestions.push(
      "Consider adding more code snippets demonstrating core function calls or configurations.",
    );
  } else {
    suggestions.push(
      "Add code blocks (using markdown ``` syntax) to show syntax-highlighted code or terminal commands.",
    );
  }

  if (hasImages || hasBadges) {
    score += 15;
  } else {
    suggestions.push(
      "Add visual elements like screenshots, GIFs, or shields/badges to make the README engaging.",
    );
  }

  // Determine Grade
  let grade = "E";
  if (score >= 90) grade = "A+";
  else if (score >= 80) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 55) grade = "C";
  else if (score >= 35) grade = "D";

  return {
    score,
    grade,
    suggestions: suggestions.slice(0, 4), // Cap suggestions to keep UI neat
  };
};

/**
 * Runs analysis across all profile data and lists of repositories
 */
export const runPortfolioAnalysis = (profile, repos) => {
  const totalRepos = repos.length;
  const forkRepos = repos.filter((r) => r.fork).length;
  const sourceRepos = repos.filter((r) => !r.fork);
  const originalReposCount = sourceRepos.length;

  // Sum stats
  let totalStars = 0;
  let totalForks = 0;
  let totalOpenIssues = 0;

  repos.forEach((repo) => {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
    totalOpenIssues += repo.open_issues_count || 0;
  });

  // Languages
  const languages = analyzeLanguages(repos);

  // Activity
  const activity = analyzeActivity(repos);

  // Top repositories by star count + size complexity
  const sortedRepos = [...repos]
    .map((repo) => {
      const complexity = calculateRepoComplexity(repo);
      return { ...repo, complexity };
    })
    .sort((a, b) => {
      // Sort by stargazers first, then complexity
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return b.complexity - a.complexity;
    });

  const topRepos = sortedRepos.slice(0, 5);

  // Calculate average complexity
  const avgComplexity =
    topRepos.length > 0
      ? Math.round(
          topRepos.reduce((acc, r) => acc + r.complexity, 0) / topRepos.length,
        )
      : 0;

  // Overall Portfolio Score (0-100)
  // 30% languages/diversity, 30% activity, 20% complexity, 20% star volume
  const starScore = Math.min(totalStars * 5, 100);
  const langCountScore = Math.min(languages.length * 15, 100);

  const overallScore = Math.round(
    activity.score * 0.35 +
      avgComplexity * 0.35 +
      starScore * 0.15 +
      langCountScore * 0.15,
  );

  return {
    overallScore,
    totalRepos,
    originalReposCount,
    forkRepos,
    totalStars,
    totalForks,
    totalOpenIssues,
    languages,
    activity,
    avgComplexity,
    topRepos,
  };
};
