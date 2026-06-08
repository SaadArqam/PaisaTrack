import { createClient } from '@/lib/supabase-server'
import { AddBalanceForm } from '@/components/AddBalanceForm'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function BalancePage() {
  const supabase = await createClient()
  
  const { data: history } = await supabase
    .from('balance_entries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 py-4 md:px-6 md:py-6">
      <h1 className="text-[24px] font-700 tracking-[-0.5px] text-[#E8E4DC] mb-4">
        Add Balance
      </h1>

      <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-5 mb-4">
        <AddBalanceForm />
      </div>

      <div className="text-[10px] font-600 tracking-[1.2px] uppercase text-[#444] mb-2">
        Transaction History
      </div>
      <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden">
        {history && history.length > 0 ? (
          history.map((entry, index) => (
            <div
              key={entry.id}
              className={`px-4 py-3 border-b border-[#181818] ${index === history.length - 1 ? 'border-b-0' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[17px] ${
                    entry.type === 'credit' 
                      ? 'bg-[rgba(93,190,138,0.12)] text-[#5DBE8A] border border-[rgba(93,190,138,0.25)]' 
                      : 'bg-[rgba(201,107,107,0.12)] text-[#C96B6B] border border-[rgba(201,107,107,0.25)]'
                  }`}>
                    {entry.type === 'credit' ? '+' : '-'}
                  </div>
                  <div>
                    <div className="text-[13px] font-500 text-[#D4D0C8]">
                      {entry.note || (entry.type === 'credit' ? 'Credit' : 'Debit')}
                    </div>
                    <div className="font-mono text-[10px] text-[#3A3A3A] mt-1 tracking-[0.3px]">
                      {format(new Date(entry.created_at), 'dd MMM')}
                    </div>
                  </div>
                </div>
                <div className={`font-mono text-[14px] font-500 ${
                  entry.type === 'credit' ? 'text-[#5DBE8A]' : 'text-[#C96B6B]'
                }`}>
                  {entry.type === 'credit' ? '+' : '-'}₹{Number(entry.amount).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-center text-[11px] uppercase tracking-[0.8px] text-[#444]">
            No history found
          </div>
        )}
      </div>
    </div>
  )
}

