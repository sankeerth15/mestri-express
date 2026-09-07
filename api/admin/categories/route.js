import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin operations
)

export async function POST(request) {
  try {
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return Response.json(
        { message: 'Category name is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: name.trim() }])
      .select()

    if (error) throw error

    return Response.json({ category: data[0] })
  } catch (error) {
    console.error('Error creating category:', error)
    return Response.json(
      { message: error.message },
      { status: 500 }
    )
  }
}
