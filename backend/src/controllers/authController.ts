import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { logger } from '../config/logger';
import { MockDBStore } from '../utils/mockDB';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    // Resilient Fallback Check
    if (global.isMockDB) {
      const existing = MockDBStore.users.find((u) => u.email === email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists.' });
      }

      const newUser = {
        _id: `mock_user_${Date.now()}`,
        name,
        email,
        password,
        role: role || 'candidate',
        status: 'active',
        comparePassword: async (pwd: string) => pwd === password,
      };

      MockDBStore.users.push(newUser);
      logger.info(`[MOCK DB] User registered successfully: ${email}`);

      const tokenPayload = { id: newUser._id, role: newUser.role };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      return res.status(201).json({
        success: true,
        message: 'Registration successful (Mock Database Mode)',
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
        accessToken,
        refreshToken,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'candidate',
    });

    await user.save();
    logger.info(`User registered successfully: ${user.email} (${user.role})`);

    const tokenPayload = { id: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Resilient Fallback Check
    if (global.isMockDB) {
      const user = MockDBStore.users.find((u) => u.email === email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const match = await user.comparePassword(password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const tokenPayload = { id: user._id, role: user.role };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      logger.info(`[MOCK DB] User logged in: ${email}`);

      return res.status(200).json({
        success: true,
        message: 'Login successful (Mock Database Mode)',
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const LOCK_TIME = 2 * 60 * 60 * 1000;
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({
        success: false,
        message: `Account locked. Try again in ${remainingMinutes} minutes.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + LOCK_TIME;
        user.loginAttempts = 0;
        await user.save();
        return res.status(403).json({
          success: false,
          message: 'Account locked due to excessive failed attempts.',
        });
      }
      await user.save();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const tokenPayload = { id: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required.' });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (global.isMockDB) {
      const user = MockDBStore.users.find((u) => u._id === decoded.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
      return res.status(200).json({ success: true, accessToken: newAccessToken });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User session not found.',
      });
    }

    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token.',
    });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const getProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (global.isMockDB) {
      const user = MockDBStore.users.find((u) => u._id === req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      return res.status(200).json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status },
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
