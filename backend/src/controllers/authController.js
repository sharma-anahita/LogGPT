const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error('[ERROR] Registration failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT id, email, password FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error('[ERROR] Login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Sign in / register using Google ID token (credential)
const googleAuth = async (req, res) => {
  try {
    const { id_token } = req.body
    if (!id_token) return res.status(400).json({ error: 'id_token is required' })

    // Verify token with Google tokeninfo endpoint
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`
    const resp = await fetch(verifyUrl)
    if (!resp.ok) {
      const text = await resp.text()
      console.error('[ERROR] Google token verification failed:', resp.status, text)
      return res.status(401).json({ error: 'Invalid Google token' })
    }

    const payload = await resp.json()
    const email = payload.email
    const email_verified = payload.email_verified === 'true' || payload.email_verified === true

    if (!email || !email_verified) {
      return res.status(400).json({ error: 'Google account email not verified' })
    }

    // Find or create user
    let result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email])
    let user = result.rows[0]
    if (!user) {
      // Create a random password for this OAuth-created user
      const crypto = require('crypto')
      const randomPass = crypto.randomBytes(16).toString('hex')
      const hashed = await bcrypt.hash(randomPass, 10)
      const insert = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
        [email, hashed]
      )
      user = insert.rows[0]
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })

    res.json({ message: 'Login via Google successful', user: { id: user.id, email: user.email }, token })
  } catch (error) {
    console.error('[ERROR] Google auth failed:', error)
    res.status(500).json({ error: 'Google authentication failed' })
  }
}

module.exports = { register, login, googleAuth };
