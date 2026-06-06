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
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-2">Manage your expense categories</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <AddCategoryForm />
        </div>
        
        <div className="md:col-span-2 space-y-4">
          <CategoryList initialCategories={categories || []} />
        </div>
      </div>
    </div>
  )
}
