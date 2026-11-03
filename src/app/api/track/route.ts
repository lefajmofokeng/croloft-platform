import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function POST(request: Request) {
  let body: { site_key?: string; path?: string; visitor_id?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: corsHeaders })
  }

  const { site_key, path, visitor_id } = body

  if (!site_key || !path || !visitor_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders })
  }

  const admin = createAdminClient()

  const { data: project } = await admin
    .from('projects')
    .select('id, show_analytics')
    .eq('analytics_site_key', site_key)
    .single()

  if (!project || !project.show_analytics) {
    return NextResponse.json({ ok: true }, { headers: corsHeaders })
  }

  await admin.from('analytics_events').insert({
    project_id: project.id,
    path: path.slice(0, 500),
    visitor_id: visitor_id.slice(0, 100),
  })

  return NextResponse.json({ ok: true }, { headers: corsHeaders })
}

// Allow the browser's cross-site request from the client's own domain
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}