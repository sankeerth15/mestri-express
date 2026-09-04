import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { q, category, brand, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (q) {
      query = query.ilike('name', `%${q}%`);
    }
    if (category) {
      query = query.eq('category_id', category);
    }
    if (brand) {
      query = query.ilike('brand', `%${brand}%`);
    }
    if (minPrice) {
      query = query.gte('selling_price', minPrice);
    }
    if (maxPrice) {
      query = query.lte('selling_price', maxPrice);
    }

    const offset = (page - 1) * limit;
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('selling_price', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      products: data,
      pagination: { page, limit, total: count }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
