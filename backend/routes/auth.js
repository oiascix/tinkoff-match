import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

console.log('📝 Auth routes loaded');

router.post('/register', async (req, res) => {
  console.log('Register attempt:', req.body.email);
  
  try {
    const { email, password, name, department, location } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, department, location }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log('✓ User registered:', user.id);
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department,
        location: user.location
      },
      token
    });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body.email);
  
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log('✓ User logged in:', user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department,
        location: user.location
      },
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
