import crypto from 'crypto';

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string;
  level: number;
  totalXp: number;
  streakDays: number;
  completedQuestIds: string[];
  unlockedAchievementIds: string[];
  claimedMissionIds: string[];
  createdAt: string;
}

export interface MagicTokenRecord {
  token: string;
  email: string;
  userId: string;
  expiresAt: number;
  used: boolean;
}

export interface SessionRecord {
  sessionToken: string;
  userId: string;
  expiresAt: number;
}

// In-Memory Zero-Cost Storage (Production fallback when PostgreSQL is not connected)
const usersByEmail: Map<string, AuthUser> = new Map();
const usersById: Map<string, AuthUser> = new Map();
const magicTokens: Map<string, MagicTokenRecord> = new Map();
const sessions: Map<string, SessionRecord> = new Map();

// Helper to seed a default test user
export function getOrCreateUser(email: string): AuthUser {
  const normalizedEmail = email.toLowerCase().trim();
  let user = usersByEmail.get(normalizedEmail);

  if (!user) {
    const id = `usr-${crypto.randomUUID()}`;
    const username = normalizedEmail.split('@')[0];
    user = {
      id,
      email: normalizedEmail,
      emailVerified: false,
      username,
      level: 1,
      totalXp: 60,
      streakDays: 1,
      completedQuestIds: ['w1-q1'],
      unlockedAchievementIds: ['first-spark', 'streak-pioneer'],
      claimedMissionIds: [],
      createdAt: new Date().toISOString(),
    };
    usersByEmail.set(normalizedEmail, user);
    usersById.set(id, user);
  }

  return user;
}

export function getUserById(id: string): AuthUser | undefined {
  return usersById.get(id);
}

/**
 * Creates a zero-cost passwordless magic link token (valid for 15 minutes).
 * No paid email service required; token is returned in response for local verification.
 */
export function createMagicLink(email: string, appUrl: string = 'http://localhost:3000'): {
  token: string;
  verificationUrl: string;
  expiresAt: string;
} {
  const user = getOrCreateUser(email);
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAtMs = Date.now() + 15 * 60 * 1000; // 15 mins

  magicTokens.set(token, {
    token,
    email: user.email,
    userId: user.id,
    expiresAt: expiresAtMs,
    used: false,
  });

  const verificationUrl = `${appUrl.replace(/\/$/, '')}/?verifyToken=${token}`;

  return {
    token,
    verificationUrl,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

/**
 * Verifies a magic link token, activates user, and creates a secure session token.
 */
export function verifyMagicToken(token: string): {
  success: boolean;
  sessionToken?: string;
  user?: AuthUser;
  error?: string;
} {
  const record = magicTokens.get(token);
  if (!record) {
    return { success: false, error: 'Invalid or non-existent verification token.' };
  }

  if (record.used) {
    return { success: false, error: 'This verification link has already been used.' };
  }

  if (Date.now() > record.expiresAt) {
    return { success: false, error: 'This verification link has expired. Please request a new one.' };
  }

  // Mark token used
  record.used = true;

  // Mark user verified
  const user = usersById.get(record.userId);
  if (!user) {
    return { success: false, error: 'User not found.' };
  }

  user.emailVerified = true;

  // Create session (valid for 30 days)
  const sessionToken = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionToken, {
    sessionToken,
    userId: user.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });

  return {
    success: true,
    sessionToken,
    user,
  };
}

/**
 * Resolves a session token into an authenticated user.
 */
export function authenticateSession(sessionToken: string | undefined): AuthUser | null {
  if (!sessionToken) return null;
  const session = sessions.get(sessionToken);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionToken);
    return null;
  }

  return usersById.get(session.userId) || null;
}

/**
 * Revokes a session token (Logout).
 */
export function revokeSession(sessionToken: string): boolean {
  return sessions.delete(sessionToken);
}

/**
 * Records XP in an idempotent manner to prevent duplicate rewards.
 */
export function recordUserXp(
  userId: string,
  amount: number,
  referenceId: string
): { success: boolean; totalXp: number; awarded: boolean } {
  const user = usersById.get(userId);
  if (!user) return { success: false, totalXp: 0, awarded: false };

  // Check if reward was already granted for this referenceId
  if (user.completedQuestIds.includes(referenceId) || user.claimedMissionIds.includes(referenceId)) {
    return { success: true, totalXp: user.totalXp, awarded: false };
  }

  user.totalXp += amount;
  return { success: true, totalXp: user.totalXp, awarded: true };
}
