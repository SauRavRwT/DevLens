// GitHub API fetcher and caching layer

const CACHE_PREFIX = 'devlens_gh_cache_';
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes cache

// Helper to check if cached data is still valid
const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      return data;
    }
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (e) {
    console.error('Error reading cache', e);
  }
  return null;
};

// Helper to save to cache
const setCachedData = (key, data) => {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({
        timestamp: Date.now(),
        data
      })
    );
  } catch (e) {
    console.error('Error writing cache', e);
  }
};

// Safe UTF-8 Base64 decoding
const decodeBase64Utf8 = (base64Str) => {
  try {
    const cleaned = base64Str.replace(/\s/g, '');
    return decodeURIComponent(
      atob(cleaned)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    try {
      return atob(base64Str.replace(/\s/g, ''));
    } catch {
      return '';
    }
  }
};

export const fetchGitHubProfile = async (username, token = '') => {
  const cacheKey = `profile_${username.toLowerCase()}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const headers = {};
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(`https://api.github.com/users/${username}`, { headers });
  
  if (response.status === 404) {
    throw new Error(`User "${username}" not found on GitHub.`);
  }
  
  if (response.status === 403 || response.status === 429) {
    throw new Error('GitHub API rate limit exceeded. Please provide a GitHub Token in settings to raise limits.');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub profile: ${response.statusText}`);
  }

  const data = await response.json();
  setCachedData(cacheKey, data);
  return data;
};

export const fetchGitHubRepos = async (username, token = '') => {
  const cacheKey = `repos_${username.toLowerCase()}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const headers = {};
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  // Fetch up to 100 repositories, sorted by most recently pushed
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
    { headers }
  );

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error('GitHub API rate limit exceeded. Please configure a GitHub Token in settings.');
    }
    throw new Error(`Failed to fetch repositories: ${response.statusText}`);
  }

  const data = await response.json();
  setCachedData(cacheKey, data);
  return data;
};

export const fetchRepoReadme = async (owner, repo, token = '') => {
  const cacheKey = `readme_${owner.toLowerCase()}_${repo.toLowerCase()}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
    
    if (response.status === 404) {
      return null; // README doesn't exist
    }

    if (!response.ok) {
      return null; // Ignore errors, fallback gracefully
    }

    const data = await response.json();
    const markdown = decodeBase64Utf8(data.content);
    setCachedData(cacheKey, markdown);
    return markdown;
  } catch (e) {
    console.error(`Error fetching README for ${owner}/${repo}`, e);
    return null;
  }
};
