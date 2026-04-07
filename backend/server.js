const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const bidRoutes = require('./routes/bidRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Enable CORS
const fallbackOrigins = [
  'http://localhost:3000', // CRA default
  'http://localhost:5173', // Vite default
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

const envOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || '').split(',').map((u) => u.trim()),
].filter(Boolean);

const allowedOrigins = envOrigins.length ? envOrigins : fallbackOrigins;

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser tools (curl/postman) with no origin
      if (!origin) return cb(null, true);
      return cb(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Socket.io setup for real-time messaging
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a personal room based on userId for private messages
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User mapped to room: ${userId}`);
  });

  // Listen for new messages
  socket.on('send_message', async (data) => {
    // data: { sender, receiver, content }
    if (!data?.sender || !data?.receiver || !data?.content) return;
    const saved = await Message.create({
      sender: data.sender,
      receiver: data.receiver,
      content: data.content,
    });
    const payload = {
      _id: saved._id,
      sender: saved.sender,
      receiver: saved.receiver,
      content: saved.content,
      createdAt: saved.createdAt,
    };
    io.to(String(data.receiver)).emit('receive_message', payload);
    io.to(String(data.sender)).emit('receive_message', payload);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/bids', bidRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('GigForge API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
