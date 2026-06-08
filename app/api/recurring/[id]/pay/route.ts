import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { calculateNextDueDate } from '@/lib/recurring-utils'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // 1. Fetch the recurring expense
    const { data: recurring, error: fetchError } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('id', id)
      .single()
      
    if (fetchError) throw fetchError
    if (!recurring || !recurring.is_active) {
      throw new Error('Recurring expense not found or inactive')
    }

    // 2. Insert into expenses
    const today = new Date().toISOString().split('T')[0]
    const { data: expense, error: insertError } = await supabase
      .from('expenses')
      .insert({
        amount: recurring.amount,
        category_id: recurring.category_id,
        date: today,
        note: recurring.name
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 3. Calculate next_due_date
    const nextDate = calculateNextDueDate(
      recurring.next_due_date,
      recurring.frequency,
      recurring.frequency === 'custom' ? (recurring.custom_days || 30) : recurring.custom_days
    )

    // 4. Update recurring_expenses
    const { data: updatedRecurring, error: updateError } = await supabase
      .from('recurring_expenses')
      .update({ next_due_date: nextDate })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ expense, updatedRecurring })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
