import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tables = [
      'expenses',
      'categories',
      'balance_entries',
      'recurring_expenses',
      'stipend_config',
    ]

    const results: Record<string, number> = {}

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .update({ user_id: user.id })
        .is('user_id', null)
        .select('id')

      if (error) {
        console.error(`Migration error for ${table}:`, error)
      } else {
        results[table] = data?.length ?? 0
      }
    }

    return NextResponse.json({ success: true, migrated: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
