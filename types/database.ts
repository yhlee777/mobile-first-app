export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          role: "advertiser" | "influencer"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          phone?: string | null
          role: "advertiser" | "influencer"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          phone?: string | null
          role?: "advertiser" | "influencer"
          created_at?: string
          updated_at?: string
        }
      }
      influencers: {
        Row: {
          id: string
          user_id: string
          instagram_handle: string | null
          full_name: string | null
          bio: string | null
          category: string | null
          location: string | null
          followers_count: number | null
          engagement_rate: number | null
          is_public: boolean
          profile_picture_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          instagram_handle?: string | null
          full_name?: string | null
          bio?: string | null
          category?: string | null
          location?: string | null
          followers_count?: number | null
          engagement_rate?: number | null
          is_public?: boolean
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          instagram_handle?: string | null
          full_name?: string | null
          bio?: string | null
          category?: string | null
          location?: string | null
          followers_count?: number | null
          engagement_rate?: number | null
          is_public?: boolean
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
