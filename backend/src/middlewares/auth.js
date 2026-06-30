import { HttpError } from '../common/httpError.js';
import { verifyToken } from '../utils/jwt.js';
import { UserRepository } from '../modules/users/users.repository.js';

const userRepository = new UserRepository();

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new HttpError(401, 'Authentication required');

    const payload = verifyToken(token);
    const user = await userRepository.findById(payload.id);
    if (!user || !user.is_active) throw new HttpError(401, 'User is inactive or not found');
    req.user = user;
    return next();
  } catch (error) {
    return next(error.status ? error : new HttpError(401, 'Invalid or expired token'));
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();

    const payload = verifyToken(token);
    const user = await userRepository.findById(payload.id);
    if (user?.is_active) req.user = user;
    return next();
  } catch (_error) {
    return next();
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'You do not have permission for this action'));
    }
    return next();
  };
}
