#!/usr/bin/env node

/**
 * Seed script to create demo account for MotoShop
 * Run with: node seed-demo.js
 * 
 * This creates:
 * - Demo Auth user: demo@motoshop.com / demo123
 * - Demo user profile in users table
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=')
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const SUPABASE_URL = envVars.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const DEMO_EMAIL = 'demo@motoshop.com'
const DEMO_PASSWORD = 'demo123'
const DEMO_NAME = 'Demo Owner'
const DEMO_SHOP_ID = 'a0000000-0000-0000-0000-000000000001' // Valid UUID for demo shop

// Simple UUID v4 generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n')

    // Step 0: Try to log in first to see if account exists and works
    console.log(`🔑 Testing login with ${DEMO_EMAIL}...`)
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    let userId = loginData?.user?.id
    let accountJustCreated = false

    if (loginError) {
      console.log(`⚠️  Login failed: ${loginError.message}`)
      
      // Account might not exist, try to create it
      console.log(`\n📝 Creating demo auth user: ${DEMO_EMAIL}`)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })

      if (signUpError) {
        throw new Error(`Auth signup failed: ${signUpError.message}`)
      }

      userId = authData.user?.id
      accountJustCreated = true
      console.log(`✅ Auth user created: ${userId}`)
    } else {
      console.log(`✅ Login successful! Account exists and password is correct.`)
    }

    if (!userId) {
      throw new Error('Could not determine user ID for demo account')
    }

    // Step 1: Check/create user profile
    console.log(`\n📋 Checking user profile... (ID: ${userId})`)

    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (selectError && selectError.code === 'PGRST116') {
      // User doesn't exist, create profile
      console.log('📝 Creating user profile...')
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: DEMO_EMAIL,
          name: DEMO_NAME,
          role: 'owner',
          shop_id: DEMO_SHOP_ID,
          phone: '+63 912 345 6789',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(`User profile creation failed: ${insertError.message}`)
      }

      console.log(`✅ User profile created: ${newUser.id}`)
    } else if (existingUser) {
      console.log(`ℹ️  User profile already exists (Name: ${existingUser.name}, Role: ${existingUser.role})`)
    }

    console.log(`\n🎉 Database seed complete!\n`)
    console.log('✅ You can now log in with:')
    console.log(`   📧 Email: ${DEMO_EMAIL}`)
    console.log(`   🔑 Password: ${DEMO_PASSWORD}\n`)

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message)
    process.exit(1)
  }
}

async function getUserIdFromEmail(email) {
  // This is a workaround - normally you'd need admin API for this
  // For now, we'll return null and let Supabase handle it
  return null
}

seedDatabase()
