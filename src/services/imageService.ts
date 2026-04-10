import { supabase } from "./supabaseClient";

/**
 * Image Service
 * Handles image uploads to Supabase Storage
 */

export const imageService = {
  /**
   * Upload an image to Supabase Storage
   * Stores in the 'parts' bucket
   */
  async uploadPartImage(file: File, partName: string): Promise<string | null> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${partName.replace(/\s+/g, "_")}_${timestamp}_${file.name}`;
      const filePath = `parts/${filename}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("parts")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("parts")
        .getPublicUrl(filePath);

      console.log("✅ Image uploaded:", publicData.publicUrl);
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
      // Extract filename from URL
      const urlParts = imageUrl.split("/").pop();
      if (!urlParts) throw new Error("Invalid image URL");

      const filePath = `parts/${urlParts}`;

      const { error } = await supabase.storage.from("parts").remove([filePath]);

      if (error) {
        throw error;
      }

      console.log("✅ Image deleted");
      return true;
    } catch (err) {
      console.error("Error deleting image:", err);
      return false;
    }
  },
};
