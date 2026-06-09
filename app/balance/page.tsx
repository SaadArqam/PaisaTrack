import { createClient } from '@/lib/supabase-server'
import { AddBalanceForm } from '@/components/AddBalanceForm'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function BalancePage() {
  const supabase = await createClient()
  
  const { data: history } = await supabase
    .from('balance_entries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="pt-2 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">Balance</h1>
        <div style={{ width: '40px', height: '3px', backgroundColor: '#E8B84B', borderRadius: '2px', marginTop: '6px' }} />
        <p className="text-muted-foreground mt-2">Manage your wallet balance and view history</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AddBalanceForm />
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-md border-muted/50">
            <CardHeader>
              <CardTitle>Balance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history && history.length > 0 ? (
                      history.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className="hover:bg-muted/50 transition-colors"
                          style={entry.type === 'credit' ? { borderLeft: '3px solid #5DBE8A' } : undefined}
                        >
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {format(new Date(entry.created_at), 'dd MMM yyyy, h:mm a')}
                          </TableCell>
                          <TableCell>
                            {entry.type === 'credit' ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-200 shadow-none font-medium">Credit</Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-200 shadow-none font-medium">Debit</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">{entry.note || '-'}</TableCell>
                          <TableCell
                            className={`text-right ${entry.type === 'credit' ? 'text-base font-semibold text-emerald-500' : 'font-semibold text-rose-500'}`}
                          >
                            {entry.type === 'credit' ? '+' : '-'}₹{Number(entry.amount).toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                          No history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
