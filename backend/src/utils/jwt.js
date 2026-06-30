import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, username: user.username },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

