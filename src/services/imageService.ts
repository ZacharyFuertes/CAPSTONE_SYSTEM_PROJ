import { supabase } from "./supabaseClient";

/**
 * Image Service
 * Handles image uploads to Supabase Storage
 * Uses the 'product-images' bucket
 */

const BUCKET_NAME = "product-images";

export const imageService = {
  /**
   * Upload an image to Supabase Storage
   * Stores in the 'product-images' bucket
   */
  async uploadPartImage(file: File, partName: string): Promise<string | null> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = partName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
      const filename = `${sanitizedName}_${timestamp}_${file.name}`;
      const filePath = `parts/${filename}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error details:", error);
        throw error;
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log("✅ Image uploaded to product-images bucket:", publicData.publicUrl);
      return publicData.publicUrl;
    } catch (err) {
      console.error("Error uploading image:", err);
      return null;
    }
  },

  /**
   * Delete an image from Supabase Storage
   */
  async deletePartImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract the path after the bucket name from the URL
      // URL format: .../storage/v1/object/public/product-images/parts/filename.jpg
      const bucketMarker = `${BUCKET_NAME}/`;
      const bucketIndex = imageUrl.indexOf(bucketMarker);

      let filePath: string;
      if (bucketIndex !== -1) {
        filePath = imageUrl.substring(bucketIndex + bucketMarker.length);
      } else {
        // Fallback: extract just the filename
        const urlParts = imageUrl.split("/").pop();
        if (!urlParts) throw new Error("Invalid image URL");
        filePath = `parts/${urlParts}`;
      }

      const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

      if (error) {
        throw error;
      }

      console.log("✅ Image deleted from product-images bucket");
      return true;
    } catch (err) {
      console.error("Error deleting image:", err);
      return false;
    }
  },
};
