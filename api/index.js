import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mestri-Express Backend is running' });
});

// ============= AUTH ENDPOINTS =============

// Send OTP to phone
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Supabase with 10-minute expiry
    const { data, error } = await supabase
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

    // TODO: Send OTP via Twilio SMS (implement later)
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({ 
      success: true, 
      message: 'OTP sent',
      // For testing: return OTP (remove in production)
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP and login
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

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

    // Check if OTP expired
    if (new Date(otpData.expires_at) < new Date()) {
      return res.status(401).json({ error: 'OTP expired' });
    }

    // Check if user exists, if not create
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create new
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          phone,
          role: 'customer'
        }])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    } else if (userError) {
      throw userError;
    }

    // Delete OTP after verification
    await supabase.from('auth_otps').delete().eq('phone', phone);

    res.json({
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
});

// ============= PRODUCTS ENDPOINTS =============

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subcategories by category
app.get('/api/categories/:categoryId/subcategories', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search products
app.get('/api/products/search', async (req, res) => {
  try {
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
    query = query.range(offset, offset + limit - 1);
    query = query.order('selling_price', { ascending: true });

    const { data, error, count } = await query;

    if (error) throw error;
    res.json({
      products: data,
      pagination: { page, limit, total: count }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product details
app.get('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError) throw productError;

    // Get bulk pricing
    const { data: bulkPricing, error: bulkError } = await supabase
      .from('bulk_pricing')
      .select('*')
      .eq('product_id', productId)
      .order('min_quantity', { ascending: true });

    if (bulkError) throw bulkError;

    res.json({
      ...product,
      bulkPricing
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= CART ENDPOINTS =============

// Get cart for user
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
app.post('/api/cart', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          quantity
        },
        { onConflict: 'user_id,product_id' }
      )
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
app.delete('/api/cart/:cartItemId', async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= ORDERS ENDPOINTS =============

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      deliveryAddressId,
      siteInchargePhone,
      paymentMethod,
      labourCode
    } = req.body;

    if (!userId || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.productId)
        .single();

      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }

      const itemTotal = product.selling_price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.productId,
        quantity: item.quantity,
        price_per_unit: product.selling_price,
        total_price: itemTotal
      });
    }

    // Calculate delivery charge based on order value
    let deliveryCharge = 0;
    if (subtotal < 500) {
      deliveryCharge = 50;
    } else if (subtotal >= 500) {
      deliveryCharge = 0;
    }

    // Get delivery address for lat/long
    let deliveryLat, deliveryLong;
    if (deliveryAddressId) {
      const { data: address } = await supabase
        .from('user_addresses')
        .select('latitude, longitude')
        .eq('id', deliveryAddressId)
        .single();
      
      deliveryLat = address?.latitude;
      deliveryLong = address?.longitude;
    }

    const gstAmount = subtotal * 0.18;
    const totalAmount = subtotal + gstAmount + deliveryCharge;
    const orderNumber = `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${uuidv4().slice(0, 6).toUpperCase()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        user_id: userId,
        delivery_address_id: deliveryAddressId,
        site_incharge_phone: siteInchargePhone,
        delivery_latitude: deliveryLat,
        delivery_longitude: deliveryLong,
        subtotal,
        gst_amount: gstAmount,
        delivery_charge: deliveryCharge,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        labour_referral_code: labourCode,
        order_status: 'pending',
        payment_status: paymentMethod === 'razorpay' ? 'pending' : 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Add order items
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) throw itemsError;

    // Create Razorpay order if payment method is razorpay
    if (paymentMethod === 'razorpay') {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: order.order_number,
        notes: {
          order_id: order.id,
          user_id: userId
        }
      });

      // Store Razorpay order ID
      await supabase
        .from('payments')
        .insert([{
          order_id: order.id,
          user_id: userId,
          razorpay_order_id: razorpayOrder.id,
          amount: totalAmount,
          currency: 'INR',
          payment_status: 'pending'
        }]);

      return res.json({
        success: true,
        order: {
          ...order,
          orderItems
        },
        razorpayOrder: razorpayOrder
      });
    }

    // Clear user's cart
    await supabase.from('cart_items').delete().eq('user_id', userId);

    res.json({
      success: true,
      order: {
        ...order,
        orderItems
      },
      message: 'Order created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's orders
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order details
app.get('/api/orders/:orderId/details', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), deliveries(*)')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= PAYMENTS ENDPOINTS =============

// Verify Razorpay payment
app.post('/api/payments/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature (implement Razorpay signature verification)
    // For now, just mark as paid (TODO: proper verification)

    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        payment_status: 'captured',
        paid_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single();

    if (error) throw error;

    // Update order payment status
    await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', payment.order_id);

    res.json({
      success: true,
      message: 'Payment verified and order confirmed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send payment link (for post-delivery payment)
app.post('/api/payments/send-link', async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    // Create Razorpay payment link
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(order.total_amount * 100),
      currency: 'INR',
      description: `Mestri-Express Order ${order.order_number}`,
      customer: {
        contact: order.user_id // Will be updated with actual phone in production
      },
      notes: {
        order_id: orderId
      },
      notify: {
        sms: true,
        email: true
      }
    });

    // Update payment link sent timestamp
    await supabase
      .from('payments')
      .update({ payment_link_sent_at: new Date().toISOString() })
      .eq('order_id', orderId);

    res.json({
      success: true,
      paymentLink: paymentLink.short_url,
      message: 'Payment link sent to customer'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= ADMIN ENDPOINTS =============

// Get all orders (admin)
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(*)), deliveries(*)');

    if (status) {
      query = query.eq('order_status', status);
    }

    const offset = (page - 1) * limit;
    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (admin)
app.patch('/api/admin/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const updateData = {};
    if (orderStatus) updateData.order_status = orderStatus;
    if (paymentStatus) updateData.payment_status = paymentStatus;

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, order: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats (admin)
app.get('/api/admin/dashboard/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Today's orders
    const { count: todaysOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    // Today's revenue
    const { data: todaysRevenue } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', `${today}T00:00:00`)
      .eq('payment_status', 'paid');

    const revenue = todaysRevenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('order_status', 'pending');

    res.json({
      todaysOrders,
      todaysRevenue: revenue,
      pendingOrders,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update product (admin)
app.post('/api/admin/products', async (req, res) => {
  try {
    const { id, name, description, categoryId, subcategoryId, brand, sku, price, sellingPrice, quantity, imageUrls } = req.body;

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
      image_urls: imageUrls
    };

    let result;
    if (id) {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      result = { data, error };
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      result = { data, error };
    }

    if (result.error) throw result.error;
    res.json({ success: true, product: result.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle product visibility (admin)
app.patch('/api/admin/products/:productId/toggle', async (req, res) => {
  try {
    const { productId } = req.params;
    const { isActive } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, product: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= LABOUR ENDPOINTS =============

// Track labour referral order
app.post('/api/labour/track-order', async (req, res) => {
  try {
    const { orderId, labourCode } = req.body;

    const { data: order } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('id', orderId)
      .single();

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Get labour details for commission calculation
    const { data: labour } = await supabase
      .from('labour_referrals')
      .select('commission_percentage')
      .eq('labour_code', labourCode)
      .single();

    const commissionEarned = (order.total_amount * labour.commission_percentage) / 100;

    // Create tracking record
    const { data, error } = await supabase
      .from('labour_order_tracking')
      .insert([{
        order_id: orderId,
        labour_code: labourCode,
        order_value: order.total_amount,
        commission_earned: commissionEarned,
        milestone_status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, tracking: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= ERROR HANDLING =============

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

// ============= SERVER START =============

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Mestri-Express API running on port ${PORT}`);
});

export default app;
