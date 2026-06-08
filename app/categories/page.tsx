import { createClient } from '@/lib/supabase-server'
import { CategoryList } from '@/components/CategoryList'
import { AddCategoryForm } from '@/components/AddCategoryForm'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  let { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })

  if (!categories || categories.length === 0) {
    const defaultCategories = [
      { name: 'Food', icon: '🍔' },
      { name: 'Travel', icon: '🚌' },
      { name: 'Shopping', icon: '🛍️' }
    ]
    
    await supabase.from('categories').insert(defaultCategories)
    
    const { data: newCategories } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true })
      
    categories = newCategories
  }

  return (
    <div className="px-4 py-4 md:px-6 md:py-6">
      <h1 className="text-[24px] font-700 tracking-[-0.5px] text-[#E8E4DC] mb-4">
        Categories
      </h1>

      <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-4 mb-4">
        <AddCategoryForm />
      </div>

      <CategoryList initialCategories={categories || []} />
    </div>
  )
}

