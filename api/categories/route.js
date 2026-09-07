import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return Response.json({ categories: data || [] })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
