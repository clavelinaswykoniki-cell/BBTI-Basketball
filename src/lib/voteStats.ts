/**
 * Fake "global vote" stats system.
 *
 * Stores per-topic vote counts in localStorage.
 * On first load, seeds realistic-looking baseline data so the numbers
 * feel like thousands of people have already voted.
 *
 * Every real user vote is added on top of the baseline.
 */

const STORAGE_KEY = "goat-debate-global-votes";
const SEED_VERSION = 1;

// ── Types ──────────────────────────────────────────────────────────────

export interface TopicVotes {
  kobe: number;
  lebron: number;
}

interface StoredData {
  version: number;
  topics: Record<string, TopicVotes>;
}

export interface TopicStats {
  kobeCount: number;
  lebronCount: number;
  total: number;
  kobePercent: number;
  lebronPercent: number;
}

export interface GlobalStats {
  totalKobe: number;
  totalLebron: number;
  total: number;
  kobePercent: number;
  lebronPercent: number;
}

// ── Baseline seed data ─────────────────────────────────────────────────
// Each topic has a plausible split (2 000 – 5 000 total votes).
// Some lean Kobe, some lean LeBron, a few are close — keeps it spicy.

const BASELINE: Record<string, TopicVotes> = {
  rings:     { kobe: 1680, lebron: 2120 },  // 44 vs 56 — LeBron edge (FMVP argument)
  clutch:    { kobe: 2728, lebron: 1672 },  // 62 vs 38 — Kobe dominant
  skill:     { kobe: 2340, lebron: 1860 },  // 56 vs 44 — Kobe edge
  mvp:       { kobe: 1044, lebron: 2556 },  // 29 vs 71 — LeBron dominant
  mentality: { kobe: 3185, lebron: 1215 },  // 72 vs 28 — Mamba mentality crushes
  defense:   { kobe: 1920, lebron: 1680 },  // 53 vs 47 — close, slight Kobe
  finals:    { kobe: 1260, lebron: 2340 },  // 35 vs 65 — LeBron data advantage
  teammates: { kobe: 2640, lebron: 1760 },  // 60 vs 40 — loyalty narrative
  era:       { kobe: 2860, lebron: 1540 },  // 65 vs 35 — Kobe cultural icon
  iconic:    { kobe: 2475, lebron: 2025 },  // 55 vs 45 — close
  goat:      { kobe: 1890, lebron: 2310 },  // 45 vs 55 — LeBron edge
  loyalty:   { kobe: 2912, lebron: 1288 },  // 69 vs 31 — one-city loyalty resonates
};

// ── Internal helpers ───────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function load(): StoredData {
  if (!isBrowser()) return { version: SEED_VERSION, topics: { ...BASELINE } };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredData = JSON.parse(raw);
      // If the seed version changed we re-seed but keep real votes
      if (parsed.version === SEED_VERSION) return parsed;
    }
  } catch {
    // corrupted data — fall through to seed
  }

  // First visit or version bump → seed
  const fresh: StoredData = { version: SEED_VERSION, topics: { ...BASELINE } };
  // Deep clone each topic to avoid shared references
  for (const key of Object.keys(fresh.topics)) {
    fresh.topics[key] = { ...BASELINE[key]! };
  }
  save(fresh);
  return fresh;
}

function save(data: StoredData): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or blocked — silently ignore
  }
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Record a vote for a topic.  Increments the count for the chosen side.
 */
export function recordVote(topicId: string, winner: "kobe" | "lebron"): void {
  const data = load();
  if (!data.topics[topicId]) {
    data.topics[topicId] = { kobe: 0, lebron: 0 };
  }
  data.topics[topicId][winner] += 1;
  save(data);
}

/**
 * Get the vote breakdown for a single topic.
 */
export function getTopicStats(topicId: string): TopicStats {
  const data = load();
  const topic = data.topics[topicId] ?? { kobe: 0, lebron: 0 };
  const total = topic.kobe + topic.lebron;
  return {
    kobeCount: topic.kobe,
    lebronCount: topic.lebron,
    total,
    kobePercent: total > 0 ? Math.round((topic.kobe / total) * 100) : 50,
    lebronPercent: total > 0 ? Math.round((topic.lebron / total) * 100) : 50,
  };
}

/**
 * Get the aggregate vote breakdown across ALL seeded topics.
 * (Bonus / unknown topics are excluded so the global war stays clean.)
 */
export function getGlobalStats(): GlobalStats {
  const data = load();
  let totalKobe = 0;
  let totalLebron = 0;

  // Only aggregate the 12 main topics for the "war" banner
  const mainTopicIds = Object.keys(BASELINE);
  for (const id of mainTopicIds) {
    const t = data.topics[id];
    if (t) {
      totalKobe += t.kobe;
      totalLebron += t.lebron;
    }
  }

  const total = totalKobe + totalLebron;
  return {
    totalKobe,
    totalLebron,
    total,
    kobePercent: total > 0 ? Math.round((totalKobe / total) * 100) : 50,
    lebronPercent: total > 0 ? Math.round((totalLebron / total) * 100) : 50,
  };
}
