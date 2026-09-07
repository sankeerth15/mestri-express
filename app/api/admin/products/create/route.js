import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()

    const {
      name,
      description,
      brand,
      categoryId,
      price,
      sellingPrice,
      quantity,
      unit,
      bulkDiscount,
    } = body

    const productData = {
      name,
      description,
      brand,
      category_id: categoryId,
      price,
      selling_price: sellingPrice,
      quantity_in_stock: quantity,
      unit,
      bulk_discount_percent: bulkDiscount,
      is_active: true,
    }

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, product: data })
  } catch (error) {
    console.error('Error creating product:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
