import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService.js';
import { emailVerificationService } from '../services/emailVerificationService.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'docpilot_ai_super_secret_jwt_key_2026';

export const sendVerificationLink = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const originUrl = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'http://localhost:3000';
    const { token, verificationUrl, expiresAt } = emailVerificationService.createVerificationToken(
      email,
      name,
      passwordHash,
      originUrl
    );

    // Dispatch real email via SMTP / Ethereal
    await sendVerificationEmail(email, name, verificationUrl);

    res.json({
      message: `Verification link sent to ${email}`,
      email,
      verificationUrl,
      expiresAt
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('[Send Verification Link Error]:', error);
    res.status(500).json({ error: 'Failed to generate email verification link.' });
  }
};

export const confirmEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and verification token are required.' });
    }

    const result = emailVerificationService.confirmVerificationToken(email, token);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const { name, passwordHash } = result.userData;

    const user = await dbService.createUser({
      name,
      email,
      passwordHash
    });

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Email confirmed and account logged in successfully.',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[Confirm Email Error]:', error);
    res.status(500).json({ error: 'Failed to verify email link.' });
  }
};

export const resendVerificationLink = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const originUrl = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'http://localhost:3000';
    const result = emailVerificationService.resendVerificationLink(email, originUrl);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const { name } = result.record || { name: 'User' };
    await sendVerificationEmail(email, name, result.verificationUrl);

    res.json({
      message: 'New verification link sent successfully.',
      email,
      verificationUrl: result.verificationUrl
    });
  } catch (error) {
    console.error('[Resend Verification Link Error]:', error);
    res.status(500).json({ error: 'Failed to resend verification link.' });
  }
};

export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await dbService.createUser({
      name,
      email,
      passwordHash
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('[Register Error]:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('[Login Error]:', error);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};

export const googleAuth = async (req, res) => {
  try {
    let { name, email, googleId, picture, credential } = req.body;

    if (credential && !email) {
      try {
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email) {
          email = decoded.email;
          name = decoded.name || name;
          googleId = decoded.sub || googleId;
          picture = decoded.picture || picture;
        }
      } catch (e) {
        console.warn('[Google Auth] Could not decode credential:', e.message);
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required for Google sign in.' });
    }

    let user = await dbService.findUserByEmail(email);

    if (!user) {
      const dummyPassword = await bcrypt.hash(`GOOGLE_${googleId || Date.now()}_${Math.random()}`, 10);
      user = await dbService.createUser({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        passwordHash: dummyPassword
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture
      }
    });
  } catch (error) {
    console.error('[Google Auth Error]:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await dbService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    res.json({ user });
  } catch (error) {
    console.error('[GetMe Error]:', error);
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
};
