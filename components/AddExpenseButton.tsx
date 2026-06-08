'use client'

import { useQuickAddStore } from '@/lib/quickAddStore'

export function AddExpenseButton() {
  const { open } = useQuickAddStore()

  return (
    <button
      onClick={open}
      className="w-full h-[52px] bg-[#E8B84B] rounded-[13px] font-outfit text-[14px] font-600 text-[#0C0C0C] flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all duration-150"
    >
      <span className="w-6 h-6 bg-[rgba(0,0,0,0.15)] rounded-full flex items-center justify-center text-[18px] text-[#0C0C0C]">
        +
      </span>
      Add Expense
    </button>
  )
}
