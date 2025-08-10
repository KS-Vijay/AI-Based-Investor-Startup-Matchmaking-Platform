import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from the correct location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import formRoutes from './routes/formRoutes.js';  // ✅ New import
import aiRoutes from './routes/aiRoutes.js';  // ✅ Add AI routes import
import aiService from './services/aiService.js';
import StartupForm from './models/StartupForm.js';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Database connection
connectDB();

// Test endpoint - place this before other routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Test AI routes endpoint
app.get('/api/ai/test', (req, res) => {
  res.json({ message: 'AI routes are working!' });
});

// Analyze endpoint
app.post('/api/ai/analyze/:startupId', async (req, res) => {
  try {
    const { startupId } = req.params;
    console.log('Analyze pitch deck called with startupId:', startupId);
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    // Get startup data by _id (not userId)
    const startup = await StartupForm.findById(startupId);
    console.log('Found startup:', startup ? 'Yes' : 'No');
    console.log('Startup data:', startup ? {
      _id: startup._id,
      startupName: startup.startupName,
      userId: startup.userId,
      hasPitchDeck: !!startup.pitchDeck,
      pitchDeckPath: startup.pitchDeck?.path
    } : 'No startup found');
    
    // Let's also check if there are any startups in the database
    const allStartups = await StartupForm.find({});
    console.log('All startups in database:', allStartups.map(s => ({
      _id: s._id,
      startupName: s.startupName,
      userId: s.userId
    })));
    
    if (!startup) {
      console.log('Startup not found for _id:', startupId);
      return res.status(404).json({
        success: false,
        error: 'Startup not found'
      });
    }

    // Check if pitch deck exists
    if (!startup.pitchDeck || !startup.pitchDeck.path) {
      console.log('No pitch deck found for startup');
      return res.status(400).json({
        success: false,
        error: 'No pitch deck uploaded for this startup'
      });
    }

    console.log('Pitch deck found:', startup.pitchDeck);

    // Prepare pitch deck info for analysis
    const pitchDeckInfo = {
      startupName: startup.startupName,
      path: startup.pitchDeck.path,
      originalName: startup.pitchDeck.originalName || startup.pitchDeck.path.split('/').pop() || 'pitch-deck.pdf'
    };

    console.log('Pitch deck info for analysis:', pitchDeckInfo);

    // Analyze the pitch deck
    const result = await aiService.analyzePitchDeck(pitchDeckInfo);
    
    if (result.success) {
      console.log('AI analysis successful');
      res.json({
        success: true,
        analysis: result.text
      });
    } else {
      console.log('AI analysis failed:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error analyzing pitch deck:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze pitch deck',
      message: error.message
    });
  }
});

// Routes
app.use('/api', authRoutes);         // For /api/register and /api/login
app.use('/api/forms', formRoutes);   // ✅ For /api/forms/startup-form and investor-form
app.use('/api/ai', aiRoutes);        // ✅ For AI functionality including chat

// Debug: List all AI routes
console.log('AI Routes loaded:');
aiRoutes.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`  ${Object.keys(r.route.methods)} ${r.route.path}`);
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /api/test');
  console.log('- GET /api/ai/test');
  console.log('- POST /api/ai/analyze/:startupId');
  console.log('- POST /api/ai/chat');
console.log('GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
});
