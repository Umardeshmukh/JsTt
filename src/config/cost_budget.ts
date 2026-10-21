/**
 * Strict $0 Operating Budget & Service Guardrails
 * Enforces zero-cost constraints across AI models, database, email, and external integrations.
 */

export interface BudgetConfig {
  aiEnabled: boolean;
  allowedAiModels: string[];
  maxDailyAiRequests: number;
  rateLimitWindowMs: number;
  maxRequestsPerMinute: number;
  databaseMode: 'local_sqlite_memory' | 'hosted_postgres_free';
  emailDeliveryMode: 'direct_magic_link' | 'smtp_free';
}

export const ZERO_DOLLAR_CONFIG: BudgetConfig = {
  // AI is completely optional; falls back to offline question bank when false or quota exhausted
  aiEnabled: process.env.ENABLE_AI === 'true' && Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  
  // Strictly permitted models on the Google AI Studio free tier
  // High-cost, paid models (gemini-4-argon, veo, lyria) are strictly banned
  allowedAiModels: ['gemini-3.8-flash', 'gemini-flash-latest'],

  // Google AI Studio Free Tier limits guardrails
  maxDailyAiRequests: 1500, // Google AI Studio free tier limit: 1500 RPD
  rateLimitWindowMs: 60 * 1000,
  maxRequestsPerMinute: 15, // Google AI Studio free tier limit: 15 RPM

  // Database mode: defaults to local in-memory/JSON store (requires $0 and 0 external credentials)
  databaseMode: process.env.DATABASE_URL ? 'hosted_postgres_free' : 'local_sqlite_memory',

  // Email delivery mode: generates direct in-app & console magic links (requires $0 paid email API)
  emailDeliveryMode: 'direct_magic_link',
};

// In-memory request counters to enforce strict free-tier rate limiting
let dailyRequestCount = 0;
let minuteRequestCount = 0;
let lastMinuteTimestamp = Date.now();
let lastDayTimestamp = Date.now();

export function checkAiQuotaAvailable(): { allowed: boolean; reason?: string } {
  if (!ZERO_DOLLAR_CONFIG.aiEnabled) {
    return { allowed: false, reason: 'AI calls are disabled in config or API key is not set. Using local question bank ($0 budget).' };
  }

  const now = Date.now();

  // Reset minute counter if window passed
  if (now - lastMinuteTimestamp > ZERO_DOLLAR_CONFIG.rateLimitWindowMs) {
    minuteRequestCount = 0;
    lastMinuteTimestamp = now;
  }

  // Reset daily counter if 24 hours passed
  if (now - lastDayTimestamp > 24 * 60 * 60 * 1000) {
    dailyRequestCount = 0;
    lastDayTimestamp = now;
  }

  if (minuteRequestCount >= ZERO_DOLLAR_CONFIG.maxRequestsPerMinute) {
    return { allowed: false, reason: 'Free tier rate limit reached (15 requests/min). Using offline exercise bank.' };
  }

  if (dailyRequestCount >= ZERO_DOLLAR_CONFIG.maxDailyAiRequests) {
    return { allowed: false, reason: 'Daily free-tier request limit reached (1500 requests/day). Using offline exercise bank.' };
  }

  minuteRequestCount++;
  dailyRequestCount++;

  return { allowed: true };
}
