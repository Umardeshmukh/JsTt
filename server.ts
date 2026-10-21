import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getAllLessons, getLessonByTopic, getApprovedSourcesWithStatus, ingestFromUrl } from './src/services/ingestion';
import { APPROVED_SOURCES } from './src/services/allowlist';
import { getAiProvider } from './src/services/ai_provider';
import { validateExerciseAnswer } from './src/services/exercise_verifier';
import { QUESTION_BANK } from './src/data/question_bank';
import {
  createMagicLink,
  verifyMagicToken,
  authenticateSession,
  revokeSession,
  recordUserXp,
  getUserById,
} from './src/services/auth_service';
import { ZERO_DOLLAR_CONFIG } from './src/config/cost_budget';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Helper middleware for authenticated requests
  const requireAuth = (req: Request, res: Response, next: () => void) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const user = authenticateSession(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Valid session required.',
      });
    }
    (req as any).user = user;
    next();
  };

  // -------------------------------------------------------------
  // BUDGET & SYSTEM STATUS
  // -------------------------------------------------------------
  app.get('/api/budget/status', (_req: Request, res: Response) => {
    res.json({
      success: true,
      operatingCost: '$0.00',
      aiMode: ZERO_DOLLAR_CONFIG.aiEnabled ? 'free_tier_active' : 'offline_question_bank_mode',
      allowedModels: ZERO_DOLLAR_CONFIG.allowedAiModels,
      databaseMode: ZERO_DOLLAR_CONFIG.databaseMode,
      emailMode: ZERO_DOLLAR_CONFIG.emailDeliveryMode,
      rpmLimit: ZERO_DOLLAR_CONFIG.maxRequestsPerMinute,
      rpdLimit: ZERO_DOLLAR_CONFIG.maxDailyAiRequests,
    });
  });

  // -------------------------------------------------------------
  // AUTHENTICATION & USER SESSIONS ($0 MAGIC LINK)
  // -------------------------------------------------------------
  app.post('/api/auth/magic-link', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address required.' });
    }

    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const magicLink = createMagicLink(email, appUrl);

    console.log(`[Zero-Cost Auth] Magic verification link created for ${email}: ${magicLink.verificationUrl}`);

    res.json({
      success: true,
      message: 'Magic link generated successfully.',
      verificationUrl: magicLink.verificationUrl,
      token: magicLink.token,
      expiresAt: magicLink.expiresAt,
    });
  });

  app.post('/api/auth/verify', (req: Request, res: Response) => {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Token is required.' });
    }

    const result = verifyMagicToken(token);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const user = authenticateSession(token);
    if (!user) {
      return res.json({ success: true, authenticated: false, user: null });
    }
    res.json({ success: true, authenticated: true, user });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    if (token) {
      revokeSession(token);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // -------------------------------------------------------------
  // LESSONS & INGESTION
  // -------------------------------------------------------------
  app.get('/api/lessons', (_req: Request, res: Response) => {
    res.json({
      success: true,
      lessons: getAllLessons(),
    });
  });

  app.get('/api/lessons/:topicKey', (req: Request, res: Response) => {
    const { topicKey } = req.params;
    const lesson = getLessonByTopic(topicKey);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: `Lesson for topic '${topicKey}' not found.`,
      });
    }
    res.json({
      success: true,
      lesson,
    });
  });

  app.get('/api/sources', (_req: Request, res: Response) => {
    res.json({
      success: true,
      sources: getApprovedSourcesWithStatus(),
    });
  });

  app.post('/api/ingest', async (req: Request, res: Response) => {
    const { url, topicKey } = req.body;
    let targetUrl = url;

    if (!targetUrl && topicKey) {
      const matched = APPROVED_SOURCES.find((s) => s.topicKey === topicKey);
      if (matched) {
        targetUrl = matched.url;
      } else {
        return res.status(400).json({
          success: false,
          error: `Unknown topicKey '${topicKey}'.`,
        });
      }
    }

    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: 'Either "url" or "topicKey" must be provided in the request body.',
      });
    }

    try {
      const result = await ingestFromUrl(targetUrl);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: `Server error during ingestion: ${err.message || String(err)}`,
        logs: [],
      });
    }
  });

  // -------------------------------------------------------------
  // DYNAMIC EXERCISES & VALIDATION
  // -------------------------------------------------------------
  app.post('/api/generate-exercise', async (req: Request, res: Response) => {
    const { topicKey = 'variables', difficulty = 'easy', exerciseType = 'predict_output' } = req.body;
    const lesson = getLessonByTopic(topicKey) || (getAllLessons() as any)[topicKey] || (getAllLessons() as any)['variables'];

    const provider = getAiProvider();
    let exercise = await provider.generateExercise(lesson, exerciseType, difficulty);

    if (!exercise) {
      // Offline question bank fallback
      const fallbackPool = QUESTION_BANK.filter((q) => q.conceptId === topicKey);
      exercise = fallbackPool.length > 0
        ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)]
        : QUESTION_BANK[0];
    }

    res.json({
      success: true,
      exercise,
      provider: provider.name,
    });
  });

  app.post('/api/validate-exercise', (req: Request, res: Response) => {
    const { exerciseId, userAnswer, topicKey } = req.body;
    if (!exerciseId || userAnswer === undefined) {
      return res.status(400).json({ success: false, error: 'exerciseId and userAnswer are required.' });
    }

    // Look up exercise in question bank or generate-cache
    let exercise = QUESTION_BANK.find((q) => q.id === exerciseId);
    if (!exercise) {
      exercise = QUESTION_BANK[0]; // safe fallback
    }

    const validation = validateExerciseAnswer(exercise, userAnswer);

    // If authenticated, record XP idempotently on server
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const user = authenticateSession(token);

    let finalXp = validation.xp;
    if (user && validation.isCorrect) {
      const xpRecord = recordUserXp(user.id, validation.xp, exerciseId);
      finalXp = xpRecord.awarded ? validation.xp : 0;
    }

    res.json({
      success: true,
      isCorrect: validation.isCorrect,
      feedback: validation.feedback,
      xpAwarded: finalXp,
      user: user || null,
    });
  });

  // -------------------------------------------------------------
  // USER PROGRESS & XP IDEMPOTENCY
  // -------------------------------------------------------------
  app.post('/api/user/progress/complete-quest', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user;
    const { questId, xpReward = 30 } = req.body;

    if (!questId) {
      return res.status(400).json({ success: false, error: 'questId required' });
    }

    const xpResult = recordUserXp(user.id, xpReward, questId);
    if (!user.completedQuestIds.includes(questId)) {
      user.completedQuestIds.push(questId);
    }

    res.json({
      success: true,
      user,
      awardedXp: xpResult.awarded ? xpReward : 0,
    });
  });

  // -------------------------------------------------------------
  // VITE DEV MIDDLEWARE / STATIC ASSETS
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CodeQuest] Server running at http://0.0.0.0:${PORT} ($0 Operating Budget Enforced)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
