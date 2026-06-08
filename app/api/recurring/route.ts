import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select(`
        *,
        categories(name, icon)
      `)
      .eq('is_active', true)
      .order('next_due_date', { ascending: true })

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
    const { name, amount, category_id, frequency, custom_days, next_due_date } = json

    const { data, error } = await supabase
      .from('recurring_expenses')
      .insert({ 
        name, 
        amount, 
        category_id, 
        frequency: frequency || 'monthly', 
        custom_days: frequency === 'custom' ? (custom_days || 30) : null, 
        next_due_date 
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
