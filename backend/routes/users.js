import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        answers: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/answers', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;

    await prisma.$transaction(
      answers.map(({ questionId, answer }) =>
        prisma.answer.upsert({
          where: {
            userId_questionId: {
              userId: req.userId,
              questionId
            }
          },
          update: { answer },
          create: {
            userId: req.userId,
            questionId,
            answer
          }
        })
      )
    );

    res.json({ message: 'Answers saved successfully' });
  } catch (error) {
    console.error('Save answers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: req.userId }
      },
      include: {
        answers: true
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
