# 🗄️ Supabase Database Setup Guide

This guide will help you set up Supabase to automatically store user account data and admin information.

## ✅ Step 1: Create a Supabase Project

1. Go to **[https://supabase.com](https://supabase.com)**
2. Click **"Start Your Project"**
3. Sign up or log in with your account
4. Click **"New Project"**
5. Fill in:
   - **Project Name**: `motoshop-db`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
6. Click **"Create new project"** and wait for it to initialize (2-3 minutes)

---

## ✅ Step 2: Get Your Credentials

1. After project is created, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (under `Project URL`)
   - **`anon` public key** (under `Project API keys`)
3. Paste them in `.env.local` file in your project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

4. **Restart your dev server** after adding these:
   ```bash
   npm run dev
   ```

---

## ✅ Step 3: Create Database Tables

Go to Supabase Dashboard → **SQL Editor** and run these SQL commands:

### **Table 1: Users Table**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'mechanic')),
  shop_id UUID NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_shop_id ON users(shop_id);
```

### **Table 2: Shops Table (for Admin/Mechanic shops)**

```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  city TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shops_owner_id ON shops(owner_id);
```

### **Table 3: Customers Table**

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  phone TEXT,
  address TEXT,
  city TEXT,
  vehicle_type TEXT,
  vehicle_plate TEXT,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_shop_id ON customers(shop_id);
```

### **Table 4: Appointments Table**

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  mechanic_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_shop_id ON appointments(shop_id);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_mechanic_id ON appointments(mechanic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
```

### **Table 5: Parts/Inventory Table**

```sql
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL,
  category TEXT,
  quantity_in_stock INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  unit_price DECIMAL(10, 2) NOT NULL,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parts_shop_id ON parts(shop_id);
CREATE INDEX idx_parts_sku ON parts(sku);
CREATE INDEX idx_parts_category ON parts(category);
```

### **Table 6: Job Orders Table**

```sql
CREATE TABLE job_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  mechanic_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'billed')),
  total_cost DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_orders_shop_id ON job_orders(shop_id);
CREATE INDEX idx_job_orders_customer_id ON job_orders(customer_id);
CREATE INDEX idx_job_orders_mechanic_id ON job_orders(mechanic_id);
```

---

## ✅ Step 4: Set Up Row-Level Security (RLS) - Optional but Recommended

This ensures users can only see their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile (needed for signup/first login)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Shops owner can view their shop
CREATE POLICY "Users can view owned shops" ON shops
  FOR SELECT USING (auth.uid() = owner_id);

-- Shops owner can insert their own shop
CREATE POLICY "Users can insert own shops" ON shops
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

**IMPORTANT:** If you see RLS policy errors after logout and refresh, make sure the above INSERT policies are created. These are essential for:
- ✅ New user signup (profile creation)
- ✅ Login after session expiration (profile restoration)
- ✅ Database connection after logout → refresh cycle

---

## ✅ Step 5: Test the Connection

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Open your browser console (F12) and look for:
   - ✅ `Supabase connected successfully!` → Connection is working
   - ❌ Error messages → Check your `.env.local` credentials

---

## 🔐 What Happens Automatically?

### **When Customer Signs Up:**
- ✅ Supabase creates an auth user (secure login)
- ✅ User data saved to `users` table with role = 'customer'
- ✅ Can view bookings, book appointments, track service history

### **When Admin/Staff Signs Up:**
- ✅ Supabase creates an auth user (secure login)
- ✅ User data saved to `users` table with role = 'owner' or 'mechanic'
- ✅ A `shop_id` UUID is auto-generated for their shop
- ✅ Can manage appointments, inventory, customers, products

---

## 📝 Database Schema Summary

| Table | Purpose | Auto-filled |
|-------|---------|-------------|
| **users** | Login accounts & profiles | Email, name, role, admin shop_id |
| **shops** | Auto shop details | Owner, name, address |
| **customers** | Customer profiles | User link, vehicle info |
| **appointments** | Booking system | Date, status, mechanic assignment |
| **parts** | Inventory management | SKU, stock level, price |
| **job_orders** | Service records | Cost, status, mechanic |

---

## 🆘 Troubleshooting

**"VITE_SUPABASE_URL is not set" error?**
- Check `.env.local` exists in project root
- Verify correct credentials are pasted
- Restart dev server

**"users table does not exist" error?**
- Run the SQL commands in Supabase SQL Editor
- Make sure each command executes successfully

**"Authentication failed" when signing up?**
- Check database is accessible in Supabase dashboard
- Check user doesn't already exist in auth.users

---

## 🚀 Next Steps

Your database is now connected! Users will automatically store data when:
1. ✅ **Creating a customer account** → Data stored
2. ✅ **Creating an admin/mechanic account** → Data stored + shop assigned
3. ✅ **Booking appointments** → Stored in database
4. ✅ **Managing inventory** → Stored in database

The system is now **fully integrated** with Supabase! 🎉
