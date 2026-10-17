import { createHmac, timingSafeEqual } from 'crypto'

export const UNLOCK_COOKIE = 'cred_unlock'
export const UNLOCK_SECONDS = 5 * 60

// A separate signing key is derived from the encryption key, so the two jobs never share a key directly
function sign(payload: string): string {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY
  if (!raw) throw new Error('CREDENTIALS_ENCRYPTION_KEY is not set')

  const signingKey = createHmac('sha256', Buffer.from(raw, 'base64'))
    .update('credential-unlock-v1')
    .digest()

  return createHmac('sha256', signingKey).update(payload).digest('base64url')
}

export function createUnlockToken(userId: string): string {
  const expires = Date.now() + UNLOCK_SECONDS * 1000
  const payload = `${userId}.${expires}`
  return `${payload}.${sign(payload)}`
}

export function isUnlockTokenValid(token: string | undefined, userId: string): boolean {
  if (!token) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [uid, expires, signature] = parts
  if (uid !== userId) return false
  if (Number(expires) < Date.now()) return false

  const expected = Buffer.from(sign(`${uid}.${expires}`))
  const given = Buffer.from(signature)

  return expected.length === given.length && timingSafeEqual(expected, given)
}