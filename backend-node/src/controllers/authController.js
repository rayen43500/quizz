import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { signToken } from '../middlewares/auth.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['teacher', 'student']),
  institution: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const profileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  institution: z.string().optional(),
  avatar: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      institution: data.institution,
      topicsProgress: [],
    });

    const token = signToken(user);
    res.status(201).json({ user: user.toPublicJSON(), token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email }).select('+passwordHash');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ user: user.toPublicJSON(), token });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: req.user.toPublicJSON() });
}

export async function updateProfile(req, res, next) {
  try {
    const data = profileSchema.parse(req.body);
    if (data.firstName) req.user.firstName = data.firstName;
    if (data.lastName) req.user.lastName = data.lastName;
    if (data.institution !== undefined) req.user.institution = data.institution;
    if (data.avatar !== undefined) {
      if (data.avatar && !data.avatar.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid avatar format' });
      }
      if (data.avatar && Buffer.byteLength(data.avatar, 'utf8') > MAX_AVATAR_BYTES) {
        return res.status(400).json({ error: 'Avatar too large (max 2MB)' });
      }
      req.user.avatar = data.avatar || null;
    }
    await req.user.save();
    res.json({ user: req.user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    const { image } = req.body;
    if (!image || !image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Send base64 data URL (data:image/...)' });
    }
    if (Buffer.byteLength(image, 'utf8') > MAX_AVATAR_BYTES) {
      return res.status(400).json({ error: 'Image max 2MB' });
    }
    req.user.avatar = image;
    await req.user.save();
    res.json({ user: req.user.toPublicJSON(), avatar: req.user.avatar });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const data = passwordSchema.parse(req.body);
    const user = await User.findById(req.user._id).select('+passwordHash');
    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });

    user.passwordHash = await bcrypt.hash(data.newPassword, 12);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
}

export async function removeAvatar(req, res, next) {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.json({ user: req.user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}
