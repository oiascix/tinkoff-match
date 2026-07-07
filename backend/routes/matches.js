import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: { OR: [{ userId1: req.userId }, { userId2: req.userId }] },
      include: {
        user1: { select: { id: true, email: true, name: true, department: true, location: true } },
        user2: { select: { id: true, email: true, name: true, department: true, location: true } }
      }
    });

    const formatted = matches.map(m => ({
      id: m.id,
      user: m.userId1 === req.userId ? m.user2 : m.user1,
      commonInterests: m.commonInterests,
      score: m.score,
      status: m.status,
      createdAt: m.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { answers: true }
    });

    const allUsers = await prisma.user.findMany({
      where: { id: { not: req.userId } },
      include: { answers: true }
    });

    const matches = [];

    for (const user of allUsers) {
      const score = calculateSimilarity(currentUser.answers, user.answers);
      
      if (score > 0.3) {
        const common = findCommon(currentUser.answers, user.answers);
        
        const exists = await prisma.match.findFirst({
          where: {
            OR: [
              { userId1: req.userId, userId2: user.id },
              { userId1: user.id, userId2: req.userId }
            ]
          }
        });

        if (!exists) {
          const match = await prisma.match.create({
            data: {
              userId1: req.userId,
              userId2: user.id,
              commonInterests: common.join(', '),
              score,
              status: 'active'
            },
            include: {
              user1: { select: { id: true, email: true, name: true, department: true, location: true } },
              user2: { select: { id: true, email: true, name: true, department: true, location: true } }
            }
          });

          matches.push({
            id: match.id,
            user: match.userId1 === req.userId ? match.user2 : match.user1,
            commonInterests: match.commonInterests,
            score: match.score
          });
        }
      }
    }

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

function calculateSimilarity(a1, a2) {
  if (!a1.length || !a2.length) return 0;
  let matches = 0;
  const total = new Set([...a1.map(a => a.questionId), ...a2.map(a => a.questionId)]).size;
  a1.forEach(x => {
    const y = a2.find(a => a.questionId === x.questionId);
    if (y && x.answer === y.answer) matches++;
  });
  return matches / total;
}

function findCommon(a1, a2) {
  const common = [];
  a1.forEach(x => {
    const y = a2.find(a => a.questionId === x.questionId);
    if (y && x.answer === y.answer) common.push(x.questionId);
  });
  return common;
}

export default router;
