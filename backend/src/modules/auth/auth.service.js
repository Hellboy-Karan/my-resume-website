import bcrypt from 'bcryptjs';
import { HttpError } from '../../common/httpError.js';
import { signToken } from '../../utils/jwt.js';
import { slugify } from '../../utils/slug.js';
import { defaultFeatureFlags } from '../../middlewares/featureGate.js';
import { UserRepository } from '../users/users.repository.js';

export class AuthService {
  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  sanitizeUser(user) {
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async register(payload) {
    const email = payload.email.toLowerCase();
    const username = slugify(payload.username || payload.name);

    if (await this.userRepository.findByEmail(email)) throw new HttpError(409, 'Email already registered');
    if (await this.userRepository.findByUsername(username)) throw new HttpError(409, 'Username already taken');

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await this.userRepository.create({
      name: payload.name,
      username,
      email,
      passwordHash,
      featureFlags: defaultFeatureFlags
    });

    return { user: this.sanitizeUser(user), token: signToken(user) };
  }

  async login({ email, password }) {
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user || !user.is_active) throw new HttpError(401, 'Invalid login credentials');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new HttpError(401, 'Invalid login credentials');

    return { user: this.sanitizeUser(user), token: signToken(user) };
  }
}

