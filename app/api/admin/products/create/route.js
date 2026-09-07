import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: 'Supabase environment variables are missing on the server.' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

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

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, product: data })
  } catch (error) {
    return Response.json(
      { error: error.message || 'Unknown server error' },
      { status: 500 }
    )
  }
}
