import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const {
      name,
      description,
      categoryId,
      subcategoryId,
      brand,
      sku,
      price,
      sellingPrice,
      quantity,
      unit, // NEW
      bulkDiscount, // NEW
      imageUrls,
    } = req.body

    const productData = {
      name,
      description,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      brand,
      sku,
      price,
      selling_price: sellingPrice,
      quantity_in_stock: quantity,
      unit, // NEW - save to database
      bulk_discount_percent: bulkDiscount, // NEW - save to database
      image_urls: imageUrls,
    }

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) throw error

    res.status(200).json({ success: true, product: data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
