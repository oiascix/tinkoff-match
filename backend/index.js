import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import matchRoutes from './routes/matches.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://tinkoff-match.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tinkoff Match API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      register: '/api/auth/register',
      login: '/api/auth/login'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
console.log('Mounting routes...');
app.use('/api/auth', authRoutes);
console.log('✓ Auth routes mounted');
app.use('/api/users', userRoutes);
console.log('✓ Users routes mounted');
app.use('/api/matches', matchRoutes);
console.log('✓ Matches routes mounted');
app.use('/api/messages', messageRoutes);
console.log('✓ Messages routes mounted');

// Socket.IO
const io = new Server(httpServer, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join_chat', (matchId) => {
    socket.join(matchId);
  });
  socket.on('send_message', (data) => {
    io.to(data.matchId).emit('receive_message', data.message);
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
});

app.set('io', io);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log('\n✅ Server running on port', PORT);
  console.log(' Environment:', process.env.NODE_ENV || 'development');
  console.log('🌍 Frontend:', process.env.FRONTEND_URL || 'http://localhost:5173');
  console.log('🔗 Health:', `http://localhost:${PORT}/api/health\n`);
});
