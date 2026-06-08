export interface BalanceEntry {
  id: string;
  amount: number;
  note: string | null;
  type: 'credit' | 'debit';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  daily_budget: number | null;
  created_at: string;
}

export interface Expense {
  id: string;
  amount: number;
  note: string | null;
  date: string;
  category_id: string;
  created_at: string;
}

export interface ExpenseWithCategory extends Expense {
  category: Category;
}

export interface Summary {
  totalBalance: number;
  totalCreditedAllTime: number;
  totalSpentThisMonth: number;
  transactionCount: number;
  spendingByCategory: {
    name: string;
    icon: string;
    total: number;
  }[];
}

export interface StipendConfig {
  id: string;
  amount: number;
  credit_day: number;
  created_at: string;
  updated_at: string;
}

export interface StipendStats {
  stipendAmount: number;
  creditDay: number;
  daysUntilNextStipend: number;
  daysElapsed: number;
  totalDaysInCycle: number;
  amountSpentThisCycle: number;
  balanceLeft: number;
  safeSpendPerDay: number;
  actualSpendPerDay: number;
  projectedBalanceOnPayday: number;
  isOverspending: boolean;
  willRunOut: boolean;
}

export interface RecurringExpense {
  id: string
  name: string
  amount: number
  category_id: string | null
  frequency: 'weekly' | 'monthly' | 'custom'
  custom_days: number | null
  next_due_date: string
  is_active: boolean
  created_at: string
  categories?: { name: string; icon: string }
}

export interface RecurringWithStatus extends RecurringExpense {
  days_until_due: number
  status: 'overdue' | 'urgent' | 'upcoming' | 'normal'
}
