import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'hon_admin';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 8;

export function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, username: admin.username, name: admin.display_name || admin.username },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  // Vercel serverless: set cookie via Set-Cookie header
  const cookie = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE / 1000}`,
    'HttpOnly',
    'SameSite=Strict',
    isProd ? 'Secure' : '',
  ].filter(Boolean).join('; ');
  res.setHeader('Set-Cookie', cookie);
}

export function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', [
    `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly`,
  ].join('; '));
}

export function requireAdmin(req) {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const token = match.split('=').slice(1).join('=');
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export { bcrypt };
