import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Supabase
    const { error } = await supabase
      .from('auth_otps')
      .upsert(
        {
          phone,
          otp,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        },
        { onConflict: 'phone' }
      );

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'OTP sent',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
