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

    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    // Verify OTP
    const { data: otpData, error: otpError } = await supabase
      .from('auth_otps')
      .select('*')
      .eq('phone', phone)
      .eq('otp', otp)
      .single();

    if (otpError || !otpData) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    if (new Date(otpData.expires_at) < new Date()) {
      return res.status(401).json({ error: 'OTP expired' });
    }

    // Check if user exists
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (userError && userError.code === 'PGRST116') {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ phone, role: 'customer' }])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    } else if (userError) {
      throw userError;
    }

    // Delete OTP
    await supabase.from('auth_otps').delete().eq('phone', phone);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
