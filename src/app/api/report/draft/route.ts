import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { latitude, longitude, alamat, detail } = body

  if (latitude == null || isNaN(Number(latitude)) || !isFinite(Number(latitude))) {
    return NextResponse.json({ error: 'Latitude wajib diisi' }, { status: 400 })
  }
  if (longitude == null || isNaN(Number(longitude)) || !isFinite(Number(longitude))) {
    return NextResponse.json({ error: 'Longitude wajib diisi' }, { status: 400 })
  }
  if (!alamat || typeof alamat !== 'string' || alamat.trim() === '') {
    return NextResponse.json({ error: 'Alamat wajib diisi' }, { status: 400 })
  }

  const trimmedDetail = typeof detail === 'string' ? detail.trim() : undefined

  const draft = {
    latitude: Number(latitude),
    longitude: Number(longitude),
    alamat: alamat.trim(),
    ...(trimmedDetail ? { detail: trimmedDetail } : {}),
  }

  const cookieStore = await cookies()
  // Step 1 always overwrites the entire draft cookie — intentional reset for a new report
  cookieStore.set('report_draft', JSON.stringify(draft), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 3600,
  })

  return NextResponse.json({ success: true })
}

export async function GET() {
  const cookieStore = await cookies()
  const draft = cookieStore.get("report_draft")

  if (!draft) {
    return NextResponse.json({ draft: null })
  }

  return NextResponse.json({
    draft: JSON.parse(draft.value),
  })
}
