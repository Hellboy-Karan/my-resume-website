import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { HttpError } from '../../common/httpError.js';
import { query } from '../../database/mysql.js';
import { env } from '../../config/env.js';
import { signToken } from '../../utils/jwt.js';
import { slugify } from '../../utils/slug.js';
import { defaultFeatureFlags } from '../../middlewares/featureGate.js';
import { UserRepository } from '../users/users.repository.js';

const defaultAdminEmail = 'sk5485633@gmail.com';

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
      role: email === defaultAdminEmail ? 'ADMIN' : 'USER',
      featureFlags: defaultFeatureFlags
    });

    return { user: this.sanitizeUser(user), token: signToken(user) };
  }

  async login({ email, password }) {
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user || !user.is_active) throw new HttpError(401, 'Invalid login credentials');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new HttpError(401, 'Invalid login credentials');

    const finalUser = user.email === defaultAdminEmail && user.role !== 'ADMIN'
      ? await this.userRepository.update(user.id, { role: 'ADMIN' })
      : user;

    return { user: this.sanitizeUser(finalUser), token: signToken(finalUser) };
  }

  async requestPasswordReset(emailInput) {
    const email = String(emailInput || '').toLowerCase();
    const user = await this.userRepository.findByEmail(email);
    if (!user) return { message: 'If that email exists, an OTP has been sent.' };
    const otp = String(crypto.randomInt(100000, 999999));
    const otpHash = await bcrypt.hash(otp, 10);
    await query(
      `INSERT INTO password_reset_otps (user_id, email, otp_hash, expires_at)
       VALUES (:userId, :email, :otpHash, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      { userId: user.id, email, otpHash }
    );
    const sent = await sendOtpEmail(email, otp);
    return {
      message: sent
        ? 'OTP sent to your email. It expires in 10 minutes.'
        : 'SMTP email is not configured. OTP was logged in backend logs for local testing.'
    };
  }

  async verifyPasswordResetOtp(emailInput, otp) {
    const record = await this.findValidOtp(emailInput, otp);
    return { verified: Boolean(record), message: 'OTP verified successfully.' };
  }

  async resetPassword({ email, otp, password, confirmPassword }) {
    if (password !== confirmPassword) throw new HttpError(400, 'Password and Confirm Password do not match');
    const record = await this.findValidOtp(email, otp);
    const passwordHash = await bcrypt.hash(password, 12);
    await this.userRepository.update(record.user_id, { password_hash: passwordHash });
    await query('UPDATE password_reset_otps SET used_at = NOW() WHERE id = :id', { id: record.id });
    return { message: 'Password reset successful. Please login with your new password.' };
  }

  async findValidOtp(emailInput, otp) {
    const email = String(emailInput || '').toLowerCase();
    const rows = await query(
      `SELECT *
       FROM password_reset_otps
       WHERE email = :email AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      { email }
    );
    const record = rows[0];
    if (!record) throw new HttpError(400, 'Invalid or expired OTP');
    const ok = await bcrypt.compare(String(otp || ''), record.otp_hash);
    if (!ok) throw new HttpError(400, 'Invalid or expired OTP');
    return record;
  }
}

async function sendOtpEmail(email, otp) {
  if (!env.mail.host || !env.mail.user || !env.mail.pass || !env.mail.from) {
    console.log(`Password reset OTP for ${email}: ${otp}`);
    return false;
  }
  const transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: {
      user: env.mail.user,
      pass: env.mail.pass
    }
  });
  await transporter.sendMail({
    from: env.mail.from,
    to: email,
    subject: 'AI Resume Builder password reset OTP',
    text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your password reset OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
  });
  return true;
}
