import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables from the correct location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import formRoutes from './routes/formRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store online users: userId -> socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('⚡ Client connected to Socket.IO:', socket.id);

  socket.on('user_online', (userId) => {
    if (userId) {
      onlineUsers.set(userId.toString(), socket.id);
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`User ${userId} is online. Total online: ${onlineUsers.size}`);
    }
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);
  });

  socket.on('typing', ({ conversationId, userId, isTyping }) => {
    socket.to(conversationId).emit('user_typing', { conversationId, userId, isTyping });
  });

  socket.on('send_message', async (data) => {
    try {
      const { conversationId, senderId, receiverId, text, image } = data;

      let convId = conversationId;
      if (!convId && receiverId && senderId) {
        let conv = await Conversation.findOne({
          participants: { $all: [senderId, receiverId] },
        });
        if (!conv) {
          conv = new Conversation({
            participants: [senderId, receiverId],
          });
          await conv.save();
        }
        convId = conv._id;
      }

      const newMessage = new Message({
        conversationId: convId,
        sender: senderId,
        receiver: receiverId,
        text: text || '',
        image: image || '',
      });
      await newMessage.save();

      await Conversation.findByIdAndUpdate(convId, {
        lastMessage: newMessage._id,
        lastMessageText: text || (image ? '📷 Image' : ''),
        lastMessageTime: new Date(),
      });

      await newMessage.populate('sender', 'fullName profilePic role');
      await newMessage.populate('receiver', 'fullName profilePic role');

      // Emit to room
      io.to(convId.toString()).emit('receive_message', newMessage);

      // Also notify receiver specifically if online
      const receiverSocketId = onlineUsers.get(receiverId?.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message_notification', {
          conversationId: convId,
          message: newMessage,
        });
      }
    } catch (err) {
      console.error('Error handling socket send_message:', err);
      socket.emit('error_message', { error: err.message });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected.`);
        break;
      }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Database connection
connectDB();

// Health check endpoints
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server is running!' });
});

app.get('/api/ai/test', (req, res) => {
  res.json({ success: true, message: 'AI routes are operational!' });
});

// Mount Routes
app.use('/api', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running with Socket.io on port ${PORT}`);
  console.log('Registered API Endpoints:');
  console.log(' - /api/register, /api/login, /api/me');
  console.log(' - /api/forms/startup-form, /api/forms/investor-form');
  console.log(' - /api/ai/matches/:userId (AI Matchmaking)');
  console.log(' - /api/ai/analyze/:startupId (Pitch Deck Analysis)');
  console.log(' - /api/ai/chat (Context-aware AI Advisor)');
  console.log(' - /api/messages (Real-Time Conversations & Chat)');
  console.log('GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
});
