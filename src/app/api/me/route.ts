import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
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
  })
}
