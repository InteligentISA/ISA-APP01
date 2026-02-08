import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  location?: string;
  phone_number?: string;
  avatar_url?: string;
  user_type: 'customer' | 'vendor';
  company?: string;
  business_type?: string;
  status?: string;
  rejection_reason?: string;
  
  // New hierarchical location fields
  county?: string;
  constituency?: string;
  ward?: string;
  whatsapp_number?: string;
  
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  location?: string;
  phone_number?: string;
  avatar_url?: string;
  company?: string;
  business_type?: string;
  email?: string;
  user_type?: string;
  status?: string;
  admin_notes?: string;
  rejection_reason?: string;
  
  // New hierarchical location fields
  county?: string;
  constituency?: string;
  ward?: string;
  whatsapp_number?: string;
}

export class UserProfileService {
  // Fetch complete user profile from Supabase
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('UserProfileService: Fetching profile for userId:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('UserProfileService: Profile fetch result:', { data: !!data, error: error?.message });

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as unknown as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, profileData: UpdateProfileData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      };
    }
  }

  // Upload profile picture to Supabase Storage
  static async uploadProfilePicture(file: File, userId: string): Promise<{ url: string; error?: string }> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const filename = `profile-${userId}-${timestamp}-${randomString}.${extension}`;
      const filePath = `profiles/${filename}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        return { url: '', error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return { url: urlData.publicUrl };
    } catch (error) {
      return { 
        url: '', 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  // Delete old profile picture
  static async deleteProfilePicture(filePath: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      return { error: error?.message };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Delete failed' };
    }
  }

  // Get user profile by email (for existing users)
  static async getUserProfileByEmail(email: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error fetching user profile by email:', error);
        return null;
      }

      return data as unknown as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile by email:', error);
      return null;
    }
  }
} 