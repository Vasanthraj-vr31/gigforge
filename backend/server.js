const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const bidRoutes = require('./routes/bidRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Socket.io setup for real-time messaging
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a personal room based on userId for private messages
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User mapped to room: ${userId}`);
  });

  // Listen for new messages
  socket.on('sendMessage', async (data) => {
    // data should contain { sender, receiver, content }
    // Emit to the receiver's room
    io.to(data.receiver).emit('receiveMessage', data);
    
    // In a full implementation, you can also save to DB right here or via API Call
    // const Message = require('./models/Message');
    // await Message.create(data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/bids', bidRoutes);
app.use('/api/v1/messages', messageRoutes);

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
