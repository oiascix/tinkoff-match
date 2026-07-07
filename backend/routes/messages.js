import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:matchId', authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { matchId: req.params.matchId },
      include: { sender: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:matchId', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const matchId = req.params.matchId;

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ error: 'Match not found' });

    if (match.userId1 !== req.userId && match.userId2 !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const message = await prisma.message.create({
      data: { matchId, senderId: req.userId, text },
      include: { sender: { select: { id: true, name: true, email: true } } }
    });

    const io = req.app.get('io');
    io.to(matchId).emit('receive_message', message);

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
