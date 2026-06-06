import { createClient } from '@/lib/supabase-server'
import { AddBalanceForm } from '@/components/AddBalanceForm'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function BalancePage() {
  const supabase = await createClient()
  
  const { data: history } = await supabase
    .from('balance_entries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-5xl">
      <div>
        <h1 className="swiss-page-heading border-b-4 border-[#FF3000] inline-block pb-2">
          ADD BALANCE
        </h1>
      </div>

      <div className="space-y-10">
        <AddBalanceForm />

        <div>
          <p className="swiss-section-label">02. TRANSACTION HISTORY</p>
          <Table className="swiss-table">
            <TableHeader>
              <TableRow className="bg-black hover:bg-black border-none">
                <TableHead className="text-white bg-black">Date</TableHead>
                <TableHead className="text-white bg-black">Type</TableHead>
                <TableHead className="text-white bg-black">Note</TableHead>
                <TableHead className="text-white bg-black text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history && history.length > 0 ? (
                history.map((entry, index) => (
                  <TableRow
                    key={entry.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'}
                  >
                    <TableCell className="uppercase tracking-wide text-xs whitespace-nowrap">
                      {format(new Date(entry.created_at), 'dd MMM yyyy, h:mm a')}
                    </TableCell>
                    <TableCell>
                      {entry.type === 'credit' ? (
                        <Badge className="bg-black text-white border-black uppercase text-xs px-2 py-1">
                          Credit
                        </Badge>
                      ) : (
                        <Badge className="bg-[#FF3000] text-white border-[#FF3000] uppercase text-xs px-2 py-1">
                          Debit
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-xs">
                      {entry.note || '—'}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {entry.type === 'credit' ? '+' : '−'}₹{Number(entry.amount).toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center uppercase tracking-widest text-xs">
                    No history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
