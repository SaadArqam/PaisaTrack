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
    <div className="p-6 md:p-10 space-y-10 max-w-5xl">
      <div>
        <h1 className="swiss-page-heading border-b-4 border-[#FF3000] inline-block pb-2">
          CATEGORIES
        </h1>
      </div>

      <div className="space-y-10">
        <div>
          <p className="swiss-section-label">01. EXPENSE TYPES</p>
          <AddCategoryForm />
        </div>

        <CategoryList initialCategories={categories || []} />
      </div>
    </div>
  )
}
