import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMagicLink,
  verifyMagicToken,
  authenticateSession,
  revokeSession,
  recordUserXp,
  getUserById,
} from './auth_service.ts';

test('Magic Link: Generates valid token without paid email API', () => {
  const result = createMagicLink('learner@example.com', 'http://localhost:3000');
  assert.ok(result.token);
  assert.ok(result.verificationUrl.includes('verifyToken='));
  assert.ok(result.expiresAt);
});

test('Magic Link: Verifies token, activates user, and creates session', () => {
  const link = createMagicLink('alice@codequest.dev');
  const verifyRes = verifyMagicToken(link.token);

  assert.equal(verifyRes.success, true);
  assert.ok(verifyRes.sessionToken);
  assert.equal(verifyRes.user?.email, 'alice@codequest.dev');
  assert.equal(verifyRes.user?.emailVerified, true);

  // Authenticate session
  const authUser = authenticateSession(verifyRes.sessionToken);
  assert.ok(authUser);
  assert.equal(authUser?.id, verifyRes.user?.id);
});

test('Magic Link: Rejects already used tokens (replay attack prevention)', () => {
  const link = createMagicLink('bob@codequest.dev');
  const firstUse = verifyMagicToken(link.token);
  assert.equal(firstUse.success, true);

  const secondUse = verifyMagicToken(link.token);
  assert.equal(secondUse.success, false);
  assert.ok(secondUse.error?.includes('already been used'));
});

test('Cross-User Access: User A session cannot authenticate as User B', () => {
  const userALink = createMagicLink('usera@example.com');
  const userBLink = createMagicLink('userb@example.com');

  const sessionA = verifyMagicToken(userALink.token).sessionToken;
  const sessionB = verifyMagicToken(userBLink.token).sessionToken;

  const authA = authenticateSession(sessionA);
  const authB = authenticateSession(sessionB);

  assert.notEqual(authA?.id, authB?.id);
  assert.equal(authA?.email, 'usera@example.com');
  assert.equal(authB?.email, 'userb@example.com');
});

test('Anonymous Access: Invalid or null session token is denied', () => {
  assert.equal(authenticateSession(undefined), null);
  assert.equal(authenticateSession(''), null);
  assert.equal(authenticateSession('invalid-random-token'), null);
});

test('Session: Logout revokes session token immediately', () => {
  const link = createMagicLink('charlie@example.com');
  const sessionToken = verifyMagicToken(link.token).sessionToken!;

  assert.ok(authenticateSession(sessionToken));
  revokeSession(sessionToken);
  assert.equal(authenticateSession(sessionToken), null);
});

test('XP Idempotency: Duplicate submissions for same referenceId award 0 additional XP', () => {
  const link = createMagicLink('david@example.com');
  const user = verifyMagicToken(link.token).user!;
  const initialXp = user.totalXp;

  const firstAward = recordUserXp(user.id, 40, 'quest-variables-1');
  assert.equal(firstAward.awarded, true);
  assert.equal(firstAward.totalXp, initialXp + 40);

  // Mark referenceId completed in user record
  user.completedQuestIds.push('quest-variables-1');

  // Second award attempt for same quest
  const secondAward = recordUserXp(user.id, 40, 'quest-variables-1');
  assert.equal(secondAward.awarded, false);
  assert.equal(secondAward.totalXp, initialXp + 40); // Did not increase!
});
