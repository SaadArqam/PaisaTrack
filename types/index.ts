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
