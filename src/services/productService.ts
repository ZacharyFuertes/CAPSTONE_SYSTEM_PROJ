import { supabase } from './supabaseClient'
import { Product, FeaturedProduct } from '../types/index'

/**
 * Product Service
 * Handles all product and featured product database operations
 */

// Products Operations
export const productService = {
  /**
   * Fetch all products for a shop
   */
  async getAllProducts(shopId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching products:', err)
      return []
    }
  },

  /**
   * Get a single product by ID
   */
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error
      return data || null
    } catch (err) {
      console.error('Error fetching product:', err)
      return null
    }
  },

  /**
   * Create a new product
   */
  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()

      if (error) throw error
      console.log('✅ Product created:', data)
      return data || null
    } catch (err) {
      console.error('Error creating product:', err)
      return null
    }
  },

  /**
   * Update a product
   */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single()

      if (error) throw error
      console.log('✅ Product updated:', data)
      return data || null
    } catch (err) {
      console.error('Error updating product:', err)
      return null
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      // First delete featured products referencing this product
      await supabase
        .from('featured_products')
        .delete()
        .eq('product_id', productId)

      // Then delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error
      console.log('✅ Product deleted')
      return true
    } catch (err) {
      console.error('Error deleting product:', err)
      return false
    }
  },
}

// Featured Products Operations
export const featuredProductService = {
  /**
   * Fetch all featured products for a shop (ordered by display_order)
   */
  async getFeaturedProducts(shopId: string): Promise<FeaturedProduct[]> {
    try {
      const { data, error } = await supabase
        .from('featured_products')
        .select(`
          id,
          shop_id,
          product_id,
          display_order,
          is_active,
          created_at,
          updated_at,
          product:products(*)
        `)
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      return (data as unknown as FeaturedProduct[]) || []
    } catch (err) {
      console.error('Error fetching featured products:', err)
      return []
    }
  },

  /**
   * Get all featured products (including inactive) for admin management
   */
  async getAllFeaturedProducts(shopId: string): Promise<FeaturedProduct[]> {
    try {
      const { data, error } = await supabase
        .from('featured_products')
        .select(`
          id,
          shop_id,
          product_id,
          display_order,
          is_active,
          created_at,
          updated_at,
          product:products(*)
        `)
        .eq('shop_id', shopId)
        .order('display_order', { ascending: true })

      if (error) throw error
      return (data as unknown as FeaturedProduct[]) || []
    } catch (err) {
      console.error('Error fetching featured products:', err)
      return []
    }
  },

  /**
   * Add a product to featured products
   */
  async addFeaturedProduct(
    shopId: string,
    productId: string,
    displayOrder: number
  ): Promise<FeaturedProduct | null> {
    try {
      const { data, error } = await supabase
        .from('featured_products')
        .insert([
          {
            shop_id: shopId,
            product_id: productId,
            display_order: displayOrder,
            is_active: true,
          },
        ])
        .select(`
          id,
          shop_id,
          product_id,
          display_order,
          is_active,
          created_at,
          updated_at,
          product:products(*)
        `)
        .single()

      if (error) throw error
      console.log('✅ Featured product added:', data)
      return (data as unknown as FeaturedProduct) || null
    } catch (err) {
      console.error('Error adding featured product:', err)
      return null
    }
  },

  /**
   * Remove a product from featured products
   */
  async removeFeaturedProduct(featuredProductId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('featured_products')
        .delete()
        .eq('id', featuredProductId)

      if (error) throw error
      console.log('✅ Featured product removed')
      return true
    } catch (err) {
      console.error('Error removing featured product:', err)
      return false
    }
  },

  /**
   * Toggle featured product visibility
   */
  async toggleFeaturedProduct(featuredProductId: string, isActive: boolean): Promise<FeaturedProduct | null> {
    try {
      const { data, error } = await supabase
        .from('featured_products')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', featuredProductId)
        .select(`
          id,
          shop_id,
          product_id,
          display_order,
          is_active,
          created_at,
          updated_at,
          product:products(*)
        `)
        .single()

      if (error) throw error
      console.log('✅ Featured product toggled:', data)
      return (data as unknown as FeaturedProduct) || null
    } catch (err) {
      console.error('Error toggling featured product:', err)
      return null
    }
  },

  /**
   * Update display order of featured products
   */
  async updateDisplayOrder(updates: Array<{ id: string; display_order: number }>): Promise<boolean> {
    try {
      for (const update of updates) {
        const { error } = await supabase
          .from('featured_products')
          .update({ display_order: update.display_order, updated_at: new Date().toISOString() })
          .eq('id', update.id)

        if (error) throw error
      }
      console.log('✅ Display order updated')
      return true
    } catch (err) {
      console.error('Error updating display order:', err)
      return false
    }
  },
}
