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
