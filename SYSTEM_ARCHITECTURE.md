# MotoShop System Architecture & Data Flow

## 📋 Table of Contents
1. System Overview
2. Architecture Layers
3. User Signup/Login Flow
4. Core Data Flows
5. Database Schema & Relationships
6. Components & Services
7. Feature Flows
8. External Integrations

---

## 1. System Overview

**MotoShop** is a full-stack web application for motorcycle/car repair shop management. It supports two user types:
- **Customers**: Can book appointments, view repairs, track vehicles, chat with AI
- **Admin/Mechanics**: Can manage appointments, inventory, customers, job orders, and products

**Tech Stack:**
- Frontend: React 18.3.1 + TypeScript 5.4.5 + Vite 5.2.10
- Styling: Tailwind CSS 3.4.3 + Framer Motion 11.0.8
- State Management: Context API (AuthContext, LanguageContext)
- Backend: Supabase (PostgreSQL Database + Auth)
- AI/Chat: Groq API (llama-3.3-70b model)
- Forms: React Hook Form 7.50.0 + Zod 3.22.4
- Internationalization: i18next 23.7.6

---

## 2. Architecture Layers

### Layer 1: Frontend Components (React UI)
Components are organized by purpose:
- **Public Pages**: Landing, LoginChoicePage, LoginPage, AdminLoginPage
- **Customer Pages**: CustomerPortal (view/book appointments)
- **Admin Pages**: Dashboard, InventoryPage, AppointmentCalendarPage, AdminProductsPage
- **Shared Components**: Navbar, SystemNavbar, ChatWidget, DatabaseStatus, Footer

### Layer 2: Context Providers (Global State)
- **AuthContext**: Manages user authentication, login, signup, logout, role-based access
  - login(email, password) → Supabase Auth → Fetch user profile from users table
  - signup(email, password, name, role) → Create Auth user → Insert to users table
  - logout() → Clear Auth session → Clear local state
  - Methods: hasRole(role), getCurrentUser()

- **LanguageContext**: Manages app language/translations (i18n)
  - Provides i18n hook for all components
  - Supports English and other languages

### Layer 3: Services (Business Logic)
Services handle direct communication with Supabase:
- **supabaseClient.ts**: Initializes Supabase client with credentials from .env.local
  - VITE_SUPABASE_URL = Supabase project URL
  - VITE_SUPABASE_ANON_KEY = Public API key

- **appointmentService.ts**: CRUD operations for appointments
  - getAppointments(customerId) → SELECT from appointments table
  - createAppointment(data) → INSERT into appointments table
  - updateAppointment(id, data) → UPDATE appointments table
  - deleteAppointment(id) → DELETE from appointments table

- **inventoryService.ts**: Manage parts and stock levels
  - getParts() → SELECT from parts table
  - addPart(data) → INSERT into parts table
  - updatePart(id, data) → UPDATE parts table
  - deletePart(id) → DELETE from parts table

- **customerService.ts**: Customer profile management
  - getCustomers() → SELECT from customers table
  - getCustomerDetails(id) → JOIN with vehicles, appointments

- **productService.ts**: Product catalog management
  - getProducts() → SELECT from products table
  - createProduct(data) → INSERT into products table

- **jobOrderService.ts**: Job order tracking
  - getJobOrders() → SELECT from job_orders table
  - createJobOrder(data) → INSERT INTO job_orders table

### Layer 4: Database (Supabase PostgreSQL)
9 core database tables with relationships

### Layer 5: External APIs
- **Groq API**: Free LLM service for AI chatbot
  - Model: llama-3.3-70b-versatile
  - Used in: EnhancedChatbotWidget
  - Features: Diagnostic help, parts suggestions, repair recommendations

---

## 3. User Signup/Login Flow

### FLOW: Customer Signup
```
1. User clicks "Join/Sign In" on Landing Page
   ↓
2. Lands on LoginChoicePage
   - Shows: "Customer Login" vs "Admin/Staff Login"
   ↓
3. User clicks "Customer Login"
   ↓
4. Lands on LoginPage (Customer Portal)
   - Shows: Email, Password, Name fields
   - Toggle: Create Account / Sign In
   ↓
5. User fills form and clicks "Create Account"
   ↓
6. AuthContext.signup() is called:
   a) supabase.auth.signUp({email, password})
      → Creates auth user in auth.users table with UUID
      → Returns authData.user.id (the UUID)
   
   b) supabase.from('users').insert({
        id: authData.user.id,           // UUID from auth
        email: email,
        name: name,
        role: 'customer',               // Hardcoded for customer login
        shop_id: null,                  // Customers don't have shops
      })
      → Inserts user profile into users table
   
   c) onAuthStateChange listener fires:
      → Fetches user profile from users table
      → Updates AuthContext.user state
   ↓
7. If signup successful:
   - App.tsx sees isAuthenticated = true
   - Checks user.role = 'customer'
   - Automatically navigates to CustomerPortal
   ↓
8. CustomerPortal loads with authenticated user data
   - Display: Appointments, Services, Chat Widget
```

### FLOW: Admin Signup
```
1. User clicks "Admin/Staff Login" on LoginChoicePage
   ↓
2. Lands on AdminLoginPage
   - Shows: Email, Password, Name, Role dropdown
   - Role options: owner, mechanic (NOT customer)
   - Toggle: Create Account / Sign In
   ↓
3. User fills form, selects role (e.g., "owner")
   ↓
4. User clicks "Create Account"
   ↓
5. AuthContext.signup() is called with role = 'owner':
   a) supabase.auth.signUp({email, password})
      → Creates auth user with UUID
   
   b) Generate UUID for shop_id:
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
          .replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0
            const v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
          })
      }
   
   c) supabase.from('users').insert({
        id: authData.user.id,           // UUID from auth
        email: email,
        name: name,
        role: role,                     // 'owner' or 'mechanic'
        shop_id: generateUUID(),        // New UUID for shop
      })
   
   d) onAuthStateChange listener:
      → Fetches user profile
      → Updates AuthContext.user
   ↓
6. If signup successful:
   - App.tsx sees isAuthenticated = true
   - Checks user.role = 'owner' or 'mechanic'
   - Calculates isAdmin = true
   - Navigates to Dashboard
   ↓
7. Dashboard loads with:
   - Admin menu items (Appointments, Inventory, Customers, Products)
   - User role badge
   - Logout button
```

### FLOW: Customer Login (Existing User)
```
1. User on LoginPage, toggles to "Sign In"
   ↓
2. Enters Email and Password only
   ↓
3. AuthContext.login() is called:
   a) supabase.auth.signInWithPassword({email, password})
      → Authenticates against auth.users
      → Returns session and user UUID
   
   b) onAuthStateChange listener fires automatically:
      → Fetches user profile from users table
      → Matches UUID from auth.users to users.id
      → Updates AuthContext.user state
   ↓
4. Navigation:
   - user.role = 'customer' → CustomerPortal
   - user.role = 'owner'/'mechanic' → Dashboard
```

---

## 4. Core Data Flows

### FLOW A: Customer Books an Appointment
```
CustomerPortal (Frontend)
    ↓ User clicks "Book Appointment"
    ↓ Opens appointment form with date/time/service selection
    ↓ User clicks "Confirm Booking"
    ↓
appointmentService.createAppointment(appointmentData)
    ↓ CALL: supabase.from('appointments').insert({
       customer_id: currentUser.id,      // FK to customers table
       date: selectedDate,
       time: selectedTime,
       service: selectedService,
       status: 'pending',
       created_at: now()
     })
    ↓
Database: appointments table
    ↓ New record created with customer_id foreign key
    ↓ RLS policy: Only this customer can view their appointment
    ↓
Frontend notification: "Appointment booked successfully!"
    ↓
CustomerPortal re-fetches: getAppointments(customerId)
    ↓
Updated appointment list displayed
```

### FLOW B: Admin Manages Inventory
```
AdminDash (Frontend)
    ↓ Admin clicks "Inventory"
    ↓
InventoryPage loads
    ↓
inventoryService.getParts()
    ↓ CALL: supabase.from('parts').select('*')
    ↓
Database: parts table
    ↓ Returns all parts: [
       {id, sku, name, category, quantity_in_stock, reorder_level, ...}
     ]
    ↓
Frontend displays parts in table
    ↓
Admin clicks "Add Part"
    ↓ Opens form with: SKU, Name, Category, Quantity, Price
    ↓ Clicks "Save"
    ↓
inventoryService.addPart(partData)
    ↓ CALL: supabase.from('parts').insert({
       sku: sku,
       name: name,
       category: category,
       quantity_in_stock: quantity,
       price: price,
       created_at: now()
     })
    ↓
Database: New part record created
    ↓
Frontend updates parts list (inventory refreshed)
```

### FLOW C: Admin Manages Appointments
```
AdminDash
    ↓ Admin clicks "Appointments"
    ↓
AppointmentCalendarPage loads
    ↓
appointmentService.getAppointments()
    ↓ CALL: supabase.from('appointments')
       .select('*, customers(*), job_orders(*)')
    ↓
Database: appointments table with customer data
    ↓ Returns: [
       {
         id, 
         customer_id, 
         customer: {id, name, phone, ...},
         date, 
         time, 
         status,
         job_orders: [{id, parts_needed, ...}]
       }
     ]
    ↓
Frontend displays calendar with appointments
    ↓
Admin clicks appointment
    ↓ Modal opens showing:
       • Customer details
       • Service details
       • Assigned mechanic (if any)
       • Job order status
    ↓
Admin clicks "Assign Mechanic" or "Mark Complete"
    ↓
appointmentService.updateAppointment(appointmentId, {
  assigned_mechanic_id: mechanic_user_id,
  status: 'completed'
})
    ↓
Database: appointments table updated
    ↓
Frontend refreshes calendar
```

### FLOW D: AI Chat (Groq API)
```
ChatWidget (Frontend)
    ↓ Customer/Admin enters question/symptom
    ↓ Clicks "Send"
    ↓
EnhancedChatbotWidget.handleSendMessage()
    ↓
1. Store input: "My bike won't start"
2. Create system prompt based on user role:
   - Customer → "You are helpful customer service AI"
   - Mechanic → "You are expert automotive mechanic AI"
3. Build conversation messages array:
   {
     role: 'system',
     content: systemPrompt
   },
   {
     role: 'user',
     content: "My bike won't start"
   }
    ↓
CALL: groqClient.chat.completions.create({
  model: 'mixtral-8x7b-32768',
  messages: conversationMessages,
  max_tokens: 1024,
  stream: true
})
    ↓
Groq API (External)
    ↓ LLM processes request
    ↓ Streams response back chunk by chunk:
       "The issue could be battery, starter, or spark plug..."
    ↓
Frontend receives stream:
    ↓
1. Collect all chunks into botResponseContent
2. Extract suggested parts from response:
   - "battery" → matches parts table
   - "starter" → matches parts table
3. Match with inventory: matchPartsWithInventory()
    ↓
Display in ChatWidget:
    ✓ Full AI response
    ✓ Suggested parts as badges
    ✓ Option to add parts to order
    ↓
Save conversation to chat_messages table:
  supabase.from('chat_messages').insert({
    user_id: currentUser.id,
    shop_id: currentUser.shop_id,
    message: "My bike won't start",
    response: botResponseContent,
    timestamp: now()
  })
```

---

## 5. Database Schema & Relationships

### auth.users (Managed by Supabase)
```
id (UUID, PRIMARY KEY)         - User identifier from Supabase Auth
email (TEXT, UNIQUE)           - User email
password_hash (TEXT)           - Encrypted password (managed by Supabase)
email_confirmed_at (TIMESTAMP) - When email was verified
last_sign_in_at (TIMESTAMP)    - Last login time
```

### users table (Custom user profiles)
```
id (UUID, PRIMARY KEY)
  REFERENCES auth.users(id) ON DELETE CASCADE
  ↑ Links to Supabase Auth

email (TEXT, NOT NULL, UNIQUE)
name (TEXT, NOT NULL)
phone (TEXT, NULL)
role (TEXT, NOT NULL, DEFAULT 'customer')
  CHECK (role IN ('customer', 'owner', 'mechanic'))
shop_id (UUID, NULL)
  REFERENCES shops(id) ON DELETE SET NULL
  ↑ Links to shops table (NULL for customers)

created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEXES:
- idx_users_email (email)
- idx_users_role (role)
- idx_users_shop_id (shop_id)
```

### shops table
```
id (UUID, PRIMARY KEY)
owner_id (UUID, NOT NULL)
  REFERENCES users(id) ON DELETE CASCADE
  ↑ Links to users table (the owner)

name (TEXT, NOT NULL)
address (TEXT)
phone (TEXT)
email (TEXT)
city (TEXT)
description (TEXT)
logo_url (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEXES:
- idx_shops_owner_id (owner_id)

RELATIONSHIP:
  One shop belongs to one owner (users.role = 'owner')
  One owner can have one shop
```

### customers table
```
id (UUID, PRIMARY KEY)
user_id (UUID, NOT NULL)
  REFERENCES users(id) ON DELETE CASCADE
  ↑ Links to users table (customer login account)

shop_id (UUID, NOT NULL)
  REFERENCES shops(id) ON DELETE CASCADE
  ↑ Links to shops table (which shop serves this customer)

phone (TEXT)
address (TEXT)
city (TEXT)
vehicle_type (TEXT)
vehicle_plate (TEXT)
total_spent (DECIMAL, DEFAULT 0)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

RELATIONSHIP:
  Many customers → One shop
  One customer → One user (login account)
  Customers can have multiple appointments
```

### appointments table
```
id (UUID, PRIMARY KEY)
customer_id (UUID, NOT NULL)
  REFERENCES customers(id) ON DELETE CASCADE
  ↑ Appointment belongs to a customer

date (DATE, NOT NULL)
time (TIME)
service (TEXT)           - "General Maintenance", "Tire Change", etc.
status (TEXT)            - "pending", "confirmed", "completed", "cancelled"
assigned_mechanic_id (UUID, NULL)
  REFERENCES users(id)   - Which mechanic is assigned
notes (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

RELATIONSHIP:
  Many appointments → One customer
  Each appointment can have one job_order
  Each appointment can have one assigned mechanic
```

### vehicles table
```
id (UUID, PRIMARY KEY)
customer_id (UUID, NOT NULL)
  REFERENCES customers(id) ON DELETE CASCADE
  ↑ Vehicle belongs to a customer

plate (TEXT, UNIQUE)
model (TEXT)
make (TEXT)
year (INTEGER)
color (TEXT)
vin (TEXT)
mileage (INTEGER)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

RELATIONSHIP:
  Many vehicles → One customer
  One vehicle → Many maintenance records (appointments)
```

### job_orders table
```
id (UUID, PRIMARY KEY)
appointment_id (UUID, NOT NULL)
  REFERENCES appointments(id) ON DELETE CASCADE
  ↑ Job order belongs to an appointment

status (TEXT)            - "pending", "in_progress", "completed"
parts_needed (TEXT[])    - Array of part names/IDs
labor_hours (DECIMAL)
notes (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

RELATIONSHIP:
  One job_order → One appointment
  One job_order → One invoice
  Many parts → One job_order (from parts_needed array)
```

### parts table
```
id (UUID, PRIMARY KEY)
sku (TEXT, UNIQUE)       - Stock Keeping Unit
name (TEXT, NOT NULL)
category (TEXT)          - "Engine", "Brakes", "Tires", etc.
description (TEXT)
quantity_in_stock (INTEGER, DEFAULT 0)
reorder_level (INTEGER)  - When to reorder
price (DECIMAL)
supplier (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEXES:
- idx_parts_sku (sku)
- idx_parts_category (category)

RELATIONSHIP:
  Parts are suggested in job_orders
  Parts are displayed in inventory
  Parts are suggested by AI chatbot
```

### invoices table
```
id (UUID, PRIMARY KEY)
job_order_id (UUID, NOT NULL)
  REFERENCES job_orders(id) ON DELETE CASCADE
  ↑ Invoice for a job order

customer_id (UUID, NOT NULL)
  REFERENCES customers(id) ON DELETE CASCADE

amount (DECIMAL)
tax (DECIMAL)
total_amount (DECIMAL)
status (TEXT)            - "draft", "sent", "paid", "overdue"
issue_date (DATE)
due_date (DATE)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

RELATIONSHIP:
  One invoice → One job_order
  One invoice → One customer
```

### chat_messages table
```
id (UUID, PRIMARY KEY)
user_id (UUID, NOT NULL)
  REFERENCES users(id) ON DELETE CASCADE
  ↑ Who sent the message

shop_id (UUID, NULL)
  REFERENCES shops(id) ON DELETE CASCADE
  ↑ Associated shop (for admin chats)

message (TEXT, NOT NULL)
response (TEXT)          - AI response (if applicable)
message_type (TEXT)      - "customer_query", "admin_diagnostic", etc.
created_at (TIMESTAMP)

RELATIONSHIP:
  Many chat_messages → One user
  Many chat_messages → One shop (optional)
  Used for audit trail and historical references
```

---

## 6. Components & Services Summary

### Frontend Components Layer
```
App.tsx
├── AppContent (main routing logic)
├── LandingPage
│   ├── Navbar (onSignIn callback)
│   ├── HeroSlideshow
│   ├── ChatAssistantWidget
│   ├── FeaturedSection
│   ├── TrustSection
│   └── Footer
├── LoginChoicePage
│   ├── Customer Login option
│   └── Admin/Staff Login option
├── CustomerPage (LoginPage)
│   ├── Email input
│   ├── Password input
│   ├── Name input (signup only)
│   ├── Toggle sign up / sign in
│   ├── Home button
│   └── Back button
├── AdminLoginPage
│   ├── Email input
│   ├── Password input
│   ├── Name input (signup only)
│   ├── Role dropdown (owner/mechanic only)
│   ├── Home button
│   └── Back button
└── AuthenticatedArea (if isAuthenticated)
    ├── SystemNavbar
    │   ├── Home button
    │   ├── Menu items (role-based)
    │   ├── User profile
    │   ├── Language toggle
    │   └── Logout button
    ├── Dashboard (Admin)
    │   ├── Overview stats
    │   ├── Menu navigation
    │   └── Quick actions
    ├── InventoryPage
    │   ├── Parts list table
    │   ├── Add part form
    │   ├── Edit part modal
    │   └── Delete confirmation
    ├── AppointmentCalendarPage
    │   ├── Calendar view
    │   ├── Appointment cards
    │   ├── Assignment modal
    │   └── Status updater
    ├── CustomerPortal
    │   ├── View appointments section
    │   ├── Book appointment section
    │   ├── Vehicle info
    │   └── Service history
    ├── AdminProductsPage
    │   ├── Product grid
    │   ├── Add product form
    │   └── Edit product modal
    └── EnhancedChatbotWidget
        ├── Chat button
        ├── Messages list
        ├── Message input
        ├── Suggested parts badges
        └── Groq streaming responses
```

### Services Layer
```
supabaseClient.ts
├── createClient(url, key)
└── testDatabaseConnection()

appointmentService.ts
├── getAppointments(customerId)
├── createAppointment(data)
├── updateAppointment(id, data)
└── deleteAppointment(id)

inventoryService.ts
├── getParts()
├── addPart(data)
├── updatePart(id, data)
└── deletePart(id)

customerService.ts
├── getCustomers()
├── getCustomerDetails(id)
└── createOrUpdateCustomer(data)

productService.ts
├── getProducts()
├── createProduct(data)
├── updateProduct(id, data)
└── deleteProduct(id)

jobOrderService.ts
├── getJobOrders()
├── createJobOrder(data)
├── updateJobOrder(id, data)
└── deleteJobOrder(id)
```

### Context Providers
```
AuthContext.tsx
├── State: user, loading, isAuthenticated
├── Functions:
│   ├── login(email, password)
│   ├── signup(email, password, name, role)
│   ├── logout()
│   └── hasRole(role)
└── Listener: onAuthStateChange (auto-sync with Supabase)

LanguageContext.tsx
├── State: currentLanguage
├── Functions:
│   ├── changeLanguage(lang)
│   └── getTranslation(key)
└── Provider: Makes i18n available throughout app
```

---

## 7. Feature Flows

### Feature: Customer Books Appointment
```
START: Customer clicks "Book Appointment" on CustomerPortal
  ↓
FORM VALIDATION: React Hook Form validates:
  ✓ Date is future date
  ✓ Time is valid format
  ✓ Service is selected
  ↓
SUBMIT: appointmentService.createAppointment({
  customer_id: auth.user.id,
  date,
  time,
  service,
  status: 'pending'
})
  ↓
DATABASE: 
  INSERT INTO appointments (customer_id, date, time, service, status)
  VALUES (UUID, DATE, TIME, TEXT, 'pending')
  ↓
RESPONSE: Return new appointment ID
  ↓
FRONTEND: 
  ✓ Show success notification
  ✓ Re-fetch appointments list (getAppointments)
  ✓ Update UI with new appointment
  ↓
DATA VISIBLE: 
  - Customer Portal shows: "Your appointment on [date] at [time]"
  - Admin Dashboard shows: "New appointment from [customer]"
  ↓
END
```

### Feature: Admin Updates Inventory
```
START: Admin clicks "Inventory" on Dashboard
  ↓
LOAD: inventoryService.getParts()
  ↓
QUERY: SELECT * FROM parts
  ↓
DISPLAY: Table with sku, name, quantity, price, actions
  ↓
USER ACTION: Admin clicks "Add Part"
  ↓
FORM: Opens modal with fields:
  - SKU (text)
  - Name (text)
  - Category (select: Engine, Brakes, Tires, etc.)
  - Quantity (number)
  - Price (decimal)
  ↓
SUBMIT: inventoryService.addPart({
  sku,
  name,
  category,
  quantity_in_stock,
  price
})
  ↓
DATABASE:
  INSERT INTO parts (sku, name, category, quantity_in_stock, price)
  VALUES (...)
  ↓
RESPONSE: New part ID
  ↓
REFRESH: Re-fetch parts list
  ↓
DISPLAY: Table updates with new part
  ↓
END
```

### Feature: AI Chat Diagnostic
```
START: Customer opens ChatWidget and asks "My bike won't start"
  ↓
INPUT VALIDATION:
  ✓ Message not empty
  ✓ Groq API key loaded
  ↓
SYSTEM PROMPT: Select based on user role:
  if user.role === 'customer':
    systemPrompt = "You are helpful customer service AI..."
  else if user.role === 'mechanic':
    systemPrompt = "You are expert automotive mechanic AI..."
  ↓
GROQ API CALL:
  groqClient.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {role: 'system', content: systemPrompt},
      {role: 'user', content: "My bike won't start"}
    ],
    stream: true
  })
  ↓
GROQ PROCESSES:
  ✓ Analyzes question
  ✓ Generates response with parts suggestions
  ✓ Streams response back
  ↓
FRONTEND STREAMS:
  for await (chunk of stream) {
    botResponseContent += chunk.delta.content
  }
  ↓
PARTS EXTRACTION:
  1. Parse response for keywords: "battery", "starter", "spark plug"
  2. Match with parts table inventory
  3. Create badges for suggested parts
  ↓
DISPLAY:
  ✓ Full AI response: "Check battery, could be starter..."
  ✓ Suggested parts as clickable badges
  ✓ Option to add parts to job order
  ↓
SAVE TO DB:
  chat_messages.insert({
    user_id,
    shop_id,
    message: "My bike won't start",
    response: botResponseContent,
    timestamp: now()
  })
  ↓
END
```

---

## 8. External Integrations

### Groq API Integration
```
Purpose: Free LLM service for AI diagnostics and recommendations

Configuration:
- API Key: VITE_GROQ_API_KEY from .env.local
- Model: mixtral-8x7b-32768 or llama-3.3-70b-versatile
- Library: groq-sdk (npm package)

Usage:
import { Groq } from 'groq-sdk'

const groqClient = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true  // Allow browser-side requests
})

const stream = await groqClient.chat.completions.create({
  model: 'mixtral-8x7b-32768',
  messages: conversationMessages,
  max_tokens: 1024,
  temperature: 0.7,
  stream: true
})

for await (const chunk of stream) {
  if (chunk.choices[0]?.delta?.content) {
    botResponseContent += chunk.choices[0].delta.content
  }
}

Use Cases:
1. Customer Service: Answer questions about services and pricing
2. Mechanic Diagnostics: Analyze symptoms and suggest repairs
3. Parts Suggestions: Recommend parts based on issues
4. Repair Estimates: Provide labor and cost estimates
```

### Supabase Integration
```
Purpose: Backend database, authentication, and real-time features

Configuration:
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

Features Used:
1. Auth.users table (managed)
   - Email/password authentication
   - Session management
   - Auto-generates UUID for each user

2. PostgreSQL Database
   - 9 tables for business logic
   - Relationships with foreign keys
   - Indexes for performance
   - RLS policies for security

3. Auth State Listener
   onAuthStateChange((event, session) => {
     // Auto-sync auth state with app
     // Fetch user profile from users table
     // Update AuthContext automatically
   })

4. CRUD Operations
   supabase.from('table').select(...)
   supabase.from('table').insert(...)
   supabase.from('table').update(...)
   supabase.from('table').delete(...)
```

---

## 9. Authentication & Authorization

### Role-Based Access Control (RBAC)

```
Role: customer
└─ Can:
   ✓ Create account
   ✓ View own appointments
   ✓ Book new appointments
   ✓ View own vehicles
   ✓ Chat with AI
   ✓ View service history
   ✓ Track repair status
└─ Cannot:
   ✗ Access admin dashboard
   ✗ Manage other customers
   ✗ Manage inventory
   ✗ Manage products
   ✗ Assign mechanics

Role: owner
└─ Can:
   ✓ All admin features
   ✓ Manage all appointments
   ✓ Manage all customers
   ✓ Add/edit/delete parts
   ✓ Add/edit/delete products
   ✓ Assign mechanics
   ✓ View business reports
   ✓ Chat diagnostic (AI)
└─ Cannot:
   ✗ Create another owner account
   ✗ Delete shop data

Role: mechanic
└─ Can:
   ✓ View assigned appointments
   ✓ View customer details for appointment
   ✓ Update appointment status
   ✓ View parts inventory
   ✓ Chat diagnostic (AI)
   ✓ View job orders
└─ Cannot:
   ✗ Delete appointments
   ✗ Delete customers
   ✗ Manage products
   ✗ Manage other mechanics
```

### Auth Flow in App.tsx
```
1. User visits app
  ↓
2. AuthProvider initializes:
   onAuthStateChange fires
   ↓
3. If session exists with valid token:
   ✓ Fetch user profile from users table
   ✓ Set AuthContext.user = {id, email, role, shop_id}
   ✓ Set AuthContext.isAuthenticated = true
   ↓
4. AppContent checks isAuthenticated:
   if (!isAuthenticated):
     → Show: Landing + Login pages
   else:
     → Check user.role
     → if role === 'customer':
       → Show: CustomerPortal + relevant menu
     → else if role === 'owner' or 'mechanic':
       → Show: AdminDash + all admin features
   ↓
5. On logout:
   ✓ supabase.auth.signOut()
   ✓ Clear AuthContext.user = null
   ✓ Clear AuthContext.isAuthenticated = false
   ✓ Redirect to landing page
```

---

## 10. Data Persistence & Synchronization

### Automatic Auth State Sync
```
Supabase provides onAuthStateChange listener that:
1. Watches for auth state changes
2. Fires on: signup, login, logout, token refresh
3. Automatically fetches user profile from users table
4. Updates React context state
5. Triggers UI re-render

This ensures:
✓ UI always reflects current auth state
✓ User data always synced with database
✓ No manual REST calls needed
✓ Handles token refresh automatically
```

### Form Data Persistence
```
When user submits form:
1. React Hook Form validates input
2. If valid, service function called
3. Service calls supabase.from('table').insert(data)
4. Database validates and stores data
5. Frontend shows success notification
6. Page re-fetches data to display latest
7. User sees updated data immediately

Example:
User books appointment
  ↓
Form.onSubmit()
  ↓
appointmentService.createAppointment({...})
  ↓
supabase.from('appointments').insert({...})
  ↓
Database confirms insert
  ↓
Frontend: getAppointments() re-fetches
  ↓
UI updates with new appointment
```

---

## Summary

**MotoShop System** follows a clean, layered architecture:

1. **Frontend Layer**: React components handle UI/UX
2. **State Layer**: Context API manages global auth state
3. **Business Logic Layer**: Services handle database operations
4. **Data Layer**: Supabase PostgreSQL stores all data
5. **Auth Layer**: Supabase Auth manages user credentials
6. **External Layer**: Groq API provides AI capabilities

**Data flows seamlessly** through:
- User Input → Components → Services → Supabase → Database
- Database → Services → Context → Components → Display

**Key characteristics:**
✓ Type-safe with TypeScript
✓ Real-time auth sync with Supabase listener
✓ Role-based access control
✓ Responsive UI with Tailwind + Framer Motion
✓ AI-powered diagnostics with Groq
✓ Multi-language support with i18n
✓ Form validation with React Hook Form + Zod
