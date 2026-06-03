Build a complete personal expense manager web app using Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, and Supabase. Here are all the details:

## ENV Variables (already configured)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Database (already created in Supabase, do not recreate)
Tables:
- balance_entries: id (uuid), amount (numeric), note (text), type ('credit'|'debit'), created_at (timestamptz)
- categories: id (uuid), name (text unique), icon (text), created_at (timestamptz)
- expenses: id (uuid), amount (numeric), note (text), date (timestamptz), category_id (uuid → categories.id), created_at (timestamptz)

## Setup
- Install dependencies: @supabase/supabase-js @supabase/ssr date-fns recharts
- Install shadcn/ui components: button, card, input, label, select, dialog, table, badge
- Create lib/supabase.ts with browser client using createBrowserClient from @supabase/ssr
- Create lib/supabase-server.ts with server client using createServerClient from @supabase/ssr

## Pages to build

### 1. Dashboard (app/page.tsx)
- Show a large "Current Balance" card at the top (total credits minus total expenses)
- Show 3 stat cards: Total Credited, Total Spent This Month, No. of Transactions
- Show a pie chart (Recharts) of spending by category this month
- Show last 5 recent expenses in a table with category, amount, date, note
- All data fetched server-side using Supabase server client

### 2. Balance Page (app/balance/page.tsx)
- Form to add money: input for amount, optional note, submit button → inserts into balance_entries with type='credit'
- Below the form show a full history table of all balance_entries sorted by created_at descending with columns: Date, Amount, Note, Type (badge: green for credit, red for debit)

### 3. Categories Page (app/categories/page.tsx)
- Form to create a new category: name input + emoji icon input + submit button
- Show all existing categories as cards in a grid with their icon and name
- Allow deleting a category (with confirmation dialog)

### 4. Expenses Page (app/expenses/page.tsx)
- Form to add expense: select category (dropdown from categories table), amount input, date picker (default today), note input, submit button → inserts into expenses table
- Below show a filterable list of all expenses:
  - Filter by category (dropdown)
  - Filter by month (month picker)
  - Table columns: Date, Category (with icon), Amount (in ₹), Note, Delete button
- Show total of filtered expenses at the bottom of the table

## Layout & Navigation (app/layout.tsx)
- Sidebar navigation with links to: Dashboard, Add Balance, Categories, Expenses
- Each nav item should have a relevant icon (lucide-react)
- App name: "PaisaTrack" with a wallet icon
- Dark themed UI, clean and modern
- Mobile responsive (sidebar collapses to bottom nav on mobile)

## API Routes
Create the following under app/api/:
- POST /api/balance → insert into balance_entries
- GET /api/categories → fetch all categories
- POST /api/categories → insert new category
- DELETE /api/categories/[id] → delete category
- GET /api/expenses → fetch all expenses joined with categories
- POST /api/expenses → insert new expense
- DELETE /api/expenses/[id] → delete expense
- GET /api/summary → return { totalBalance, totalCreditedAllTime, totalSpentThisMonth, transactionCount, spendingByCategory }

## Important Rules
- All amounts are in Indian Rupees (₹), format using toLocaleString('en-IN')
- Use server components for data fetching where possible, client components only for forms and interactivity
- After every form submission, call router.refresh() to update the UI without full reload
- Handle loading and error states on all forms
- Use TypeScript interfaces for all data types (create types/index.ts)
- Seed 3 default categories on the categories page if none exist: Food 🍔, Travel 🚌, Shopping 🛍️

## Types (types/index.ts)
Create interfaces for: BalanceEntry, Category, Expense, ExpenseWithCategory, Summary