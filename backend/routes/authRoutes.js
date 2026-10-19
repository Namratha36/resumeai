import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'resumeai_jwt_secret_key_2026';

router.post('/guest', async (req, res) => {
  try {
    const guestId = '000000000000000000000000';
    const payload = { userId: guestId, isGuest: true };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: guestId,
        name: 'Guest User',
        email: 'guest@resumeai.demo',
        isGuest: true
      }
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Error creating guest session' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const username = email.split('@')[0] + '_' + Date.now();
    user = new User({ name, email, password: hashedPassword, username });
    await user.save();
    
    const payload = { userId: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });
    
    const payload = { userId: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

export default router;
