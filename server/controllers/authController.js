import User from '../models/User.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_investor_matchmaking_2026';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create new user (password will be hashed by the model middleware)
    const newUser = new User({
      fullName,
      email,
      password,
      role: role || 'startup',
      hasFilledForm: false
    });

    await newUser.save();
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token,
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      hasFilledForm: newUser.hasFilledForm,
      profilePic: newUser.profilePic
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      hasFilledForm: user.hasFilledForm,
      profilePic: user.profilePic
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    const googleResponse = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );

    const { email, name, picture } = googleResponse.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        fullName: name,
        email,
        password: 'google-auth-' + Math.random().toString(36).slice(-8),
        role: 'investor',
        hasFilledForm: false,
        profilePic: picture
      });
      await user.save();
    }

    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      token: jwtToken,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      hasFilledForm: user.hasFilledForm,
      profilePic: user.profilePic
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    if (error.response && error.response.status === 400) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }
    res.status(500).json({ 
      success: false,
      message: 'Google authentication failed',
      error: error.message 
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ success: false, message: 'Email and role are required.' });
    }
    const user = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      hasFilledForm: user.hasFilledForm,
      profilePic: user.profilePic
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
