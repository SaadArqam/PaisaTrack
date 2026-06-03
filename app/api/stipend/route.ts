import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('stipend_config')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()
    const { amount, credit_day } = json

    // Delete all existing rows (singleton pattern) then insert new
    await supabase.from('stipend_config').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const { data, error } = await supabase
      .from('stipend_config')
      .insert({ amount: Number(amount), credit_day: Number(credit_day) })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
