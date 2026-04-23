/**
 * Supabase データベース型定義
 * 将来的に `supabase gen types typescript --project-id` で自動生成する
 */

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          role_owner: boolean;
          role_sitter: boolean;
          area_prefecture: string | null;
          area_city: string | null;
          phone_encrypted: string | null;
          notification_preferences: {
            message: boolean;
            review_request: boolean;
            calendar_reminder: boolean;
            marketing: boolean;
          };
          expo_push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']> & {
          id: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      cats: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          breed: string | null;
          gender: 'male' | 'female' | 'unknown';
          birth_date: string | null;
          avatar_url: string | null;
          personality_tags: string[];
          allergy_notes: string | null;
          medical_history: Array<{ date: string; note: string }>;
          weight_history: Array<{ date: string; kg: number }>;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cats']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['cats']['Row']>;
      };
      sitter_profiles: {
        Row: {
          user_id: string;
          bio: string | null;
          experience_years: number;
          license_number: string | null;
          license_verified: boolean;
          services: { visit: boolean; boarding: boolean };
          base_rate: number;
          option_fees: Record<string, number>;
          service_area: string[];
          acceptance_status: 'draft' | 'under_review' | 'active' | 'paused' | 'suspended' | 'rejected';
          approved_at: string | null;
          stripe_connect_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['sitter_profiles']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['sitter_profiles']['Row']>;
      };
      bookings: {
        Row: {
          id: string;
          owner_id: string;
          sitter_id: string;
          cat_ids: string[];
          start_at: string;
          end_at: string;
          service_type: 'visit' | 'boarding';
          base_fee: number;
          option_fee: number;
          insurance_fee: number;
          platform_fee: number;
          total_amount: number;
          notes: string | null;
          status: 'requested' | 'accepted' | 'confirmed' | 'completed' | 'cancelled' | 'declined' | 'disputed';
          stripe_payment_intent_id: string | null;
          cancellation_reason: string | null;
          cancelled_by: string | null;
          cancelled_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Row']>;
      };
      messages: {
        Row: {
          id: string;
          booking_id: string;
          sender_id: string;
          type: 'text' | 'image' | 'sticker' | 'report';
          content: Record<string, unknown>;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          reviewer_id: string;
          reviewee_id: string;
          direction: 'owner_to_sitter' | 'sitter_to_owner';
          rating: number;
          comment: string | null;
          photos: string[];
          published_at: string | null;
          reported_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
      };
      journal_posts: {
        Row: {
          id: string;
          author_id: string;
          cat_id: string | null;
          text: string | null;
          photos: string[];
          visibility: 'private' | 'followers' | 'public';
          like_count: number;
          comment_count: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['journal_posts']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['journal_posts']['Row']>;
      };
      schedules: {
        Row: {
          id: string;
          cat_id: string;
          type: 'food_purchase' | 'litter_change' | 'vaccine' | 'filaria' | 'custom';
          scheduled_at: string;
          is_auto_generated: boolean;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['schedules']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['schedules']['Row']>;
      };
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
