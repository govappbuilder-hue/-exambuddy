import crypto from 'crypto';

const DEFAULT_SESSION_SECRET = 'exambuddy-admin-session-secret';

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || DEFAULT_SESSION_SECRET;
}

export function signAdminSession() {
  const payload = JSON.stringify({ role: 'admin', issuedAt: Date.now() });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('hex');
  return `${payloadB64}.${signature}`;
}

export function verifyAdminSession(token) {
  if (!token || typeof token !== 'string') return false;

  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    const payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const expected = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('hex');
    return signature === expected && payload.includes('"role":"admin"');
  } catch {
    return false;
  }
}
