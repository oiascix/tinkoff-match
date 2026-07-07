import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userId1: req.userId },
          { userId2: req.userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            name: true,
            department: true,
            location: true
          }
        },
        user2: {
          select: {
            id: true,
            email: true,
            name: true,
            department: true,
            location: true
          }
        }
      }
    });

    const formattedMatches = matches.map(match => {
      const otherUser = match.userId1 === req.userId ? match.user2 : match.user1;
      return {
        id: match.id,
        user: otherUser,
        commonInterests: match.commonInterests,
        score: match.score,
        status: match.status,
        createdAt: match.createdAt
      };
    });

    res.json(formattedMatches);
  } catch (error) {
    console.error('Get matches error:', error);
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
        const commonInterests = findCommonInterests(currentUser.answers, user.answers);
        
        const existingMatch = await prisma.match.findFirst({
          where: {
            OR: [
              { userId1: req.userId, userId2: user.id },
              { userId1: user.id, userId2: req.userId }
            ]
          }
        });

        if (!existingMatch) {
          const match = await prisma.match.create({
            data: {
              userId1: req.userId,
              userId2: user.id,
              commonInterests: commonInterests.join(', '),
              score,
              status: 'active'
            },
            include: {
              user1: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  department: true,
                  location: true
                }
              },
              user2: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  department: true,
                  location: true
                }
              }
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
    console.error('Create matches error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

function calculateSimilarity(answers1, answers2) {
  if (!answers1.length || !answers2.length) return 0;
  
  let matches = 0;
  const totalQuestions = new Set([...answers1.map(a => a.questionId), ...answers2.map(a => a.questionId)]).size;
  
  answers1.forEach(a1 => {
    const a2 = answers2.find(a => a.questionId === a1.questionId);
    if (a2 && a1.answer === a2.answer) {
      matches++;
    }
  });
  
  return matches / totalQuestions;
}

function findCommonInterests(answers1, answers2) {
  const common = [];
  answers1.forEach(a1 => {
    const a2 = answers2.find(a => a.questionId === a1.questionId);
    if (a2 && a1.answer === a2.answer) {
      common.push(a1.questionId);
    }
  });
  return common;
}

export default router;
