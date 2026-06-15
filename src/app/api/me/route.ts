import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authorizeUser, jsonError } from '@/src/lib/admin-auth'
import { createClient } from '@/src/utils/supabase/server'

export async function GET() {
  const supabase = createClient(await cookies())
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, nama, nim, no_hp')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email ?? null,
      role: profile?.role ?? null,
      nama: profile?.nama ?? null,
      nim: profile?.nim ?? null,
      no_hp: profile?.no_hp ?? null,
    },
    profile: profile ?? null, // Added for debugging
  })
}

function asNullableText(value: unknown) {
  if (value === null) return null
  if (value === undefined) return undefined
  if (typeof value !== 'string') return undefined

  const text = value.trim()
  return text.length > 0 ? text : null
}

async function parseBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authorizeUser(request)
    if ('error' in auth) {
      return auth.error
    }

    const body = await parseBody(request)
    if (!body) {
      return jsonError('Request body must be valid JSON', 400)
    }

    const update: Record<string, string | null> = {}

    for (const field of ['nama', 'nim', 'no_hp'] as const) {
      if (field in body) {
        const value = asNullableText(body[field])
        if (value === undefined) {
          return jsonError(`${field} harus berupa teks`, 400, field)
        }
        update[field] = value
      }
    }

    if (Object.keys(update).length === 0) {
      return jsonError('Tidak ada field profil untuk diperbarui', 400)
    }

    const { data: profile, error } = await auth.adminClient
      .from('profiles')
      .update(update)
      .eq('id', auth.user.id)
      .select('role, nama, nim, no_hp')
      .maybeSingle()

    if (error) {
      return jsonError(error.message, 500)
    }

    if (!profile) {
      return jsonError('Profil tidak ditemukan', 404)
    }

    return NextResponse.json({
      user: {
        id: auth.user.id,
        email: auth.user.email ?? null,
        role: profile.role ?? null,
        nama: profile.nama ?? null,
        nim: profile.nim ?? null,
        no_hp: profile.no_hp ?? null,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return jsonError('Internal server error', 500)
  }
}
