import { SignJWT, jwtVerify } from 'jose'

const key = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function encrypt(payload: { userId: string; email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key)
}

export async function decrypt(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    return payload as { userId: string; email: string }
  } catch {
    return null
  }
}
