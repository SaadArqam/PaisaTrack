import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()
    const { amount, note, type, date } = json

    const insertData: Record<string, any> = { amount, note, type }
    if (date) {
      // Store the user-selected date as created_at (ISO format)
      insertData.created_at = new Date(date).toISOString()
    }

    const { data, error } = await supabase
      .from('balance_entries')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
