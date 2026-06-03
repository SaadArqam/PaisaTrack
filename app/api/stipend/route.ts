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

    // First check if there's an existing config
    const { data: existing, error: existingError } = await supabase
      .from('stipend_config')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (existingError) throw existingError

    let data, error
    if (existing) {
      // Update existing config
      const result = await supabase
        .from('stipend_config')
        .update({ amount: Number(amount), credit_day: Number(credit_day) })
        .eq('id', existing.id)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Insert new config
      const result = await supabase
        .from('stipend_config')
        .insert({ amount: Number(amount), credit_day: Number(credit_day) })
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Stipend POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
