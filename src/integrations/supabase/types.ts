export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          is_active: boolean | null
          is_suspended: boolean | null
          last_login: string | null
          must_reset_password: boolean | null
          password_hash: string | null
          role: string
          suspended_at: string | null
          suspended_by: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          is_active?: boolean | null
          is_suspended?: boolean | null
          last_login?: string | null
          must_reset_password?: boolean | null
          password_hash?: string | null
          role: string
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          is_active?: boolean | null
          is_suspended?: boolean | null
          last_login?: string | null
          must_reset_password?: boolean | null
          password_hash?: string | null
          role?: string
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      app_sounds: {
        Row: {
          created_at: string
          enabled: boolean
          event_key: string
          id: string
          updated_at: string
          url: string
          volume: number
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          event_key: string
          id?: string
          updated_at?: string
          url: string
          volume?: number
        }
        Update: {
          created_at?: string
          enabled?: boolean
          event_key?: string
          id?: string
          updated_at?: string
          url?: string
          volume?: number
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          preview: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          preview?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          preview?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          id: string
          message: string | null
          role: string | null
          session_id: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message?: string | null
          role?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message?: string | null
          role?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      constituencies: {
        Row: {
          county_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          county_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          county_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "constituencies_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
        ]
      }
      counties: {
        Row: {
          created_at: string
          id: string
          is_hotspot: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_hotspot?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_hotspot?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_base_cost: {
        Row: {
          base_cost: number
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          base_cost?: number
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          base_cost?: number
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      delivery_constituency_costs: {
        Row: {
          cost: number
          created_at: string
          from_constituency_id: string
          id: string
          is_active: boolean
          to_constituency_id: string
          updated_at: string
        }
        Insert: {
          cost?: number
          created_at?: string
          from_constituency_id: string
          id?: string
          is_active?: boolean
          to_constituency_id: string
          updated_at?: string
        }
        Update: {
          cost?: number
          created_at?: string
          from_constituency_id?: string
          id?: string
          is_active?: boolean
          to_constituency_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_constituency_costs_from_constituency_id_fkey"
            columns: ["from_constituency_id"]
            isOneToOne: false
            referencedRelation: "constituencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_constituency_costs_to_constituency_id_fkey"
            columns: ["to_constituency_id"]
            isOneToOne: false
            referencedRelation: "constituencies"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_county_costs: {
        Row: {
          cost: number
          created_at: string
          from_county_id: string
          id: string
          is_active: boolean
          to_county_id: string
          updated_at: string
        }
        Insert: {
          cost?: number
          created_at?: string
          from_county_id: string
          id?: string
          is_active?: boolean
          to_county_id: string
          updated_at?: string
        }
        Update: {
          cost?: number
          created_at?: string
          from_county_id?: string
          id?: string
          is_active?: boolean
          to_county_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_county_costs_from_county_id_fkey"
            columns: ["from_county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_county_costs_to_county_id_fkey"
            columns: ["to_county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_orders: {
        Row: {
          actual_delivery_time: string | null
          created_at: string
          current_location_lat: number | null
          current_location_lng: number | null
          delivery_fee: number
          delivery_location_address: string
          delivery_location_lat: number
          delivery_location_lng: number
          delivery_personnel_id: string | null
          distance_km: number
          estimated_delivery_time: string | null
          id: string
          order_id: string
          pickup_location_address: string
          pickup_location_lat: number
          pickup_location_lng: number
          status: string
          tracking_updates: Json | null
          updated_at: string
        }
        Insert: {
          actual_delivery_time?: string | null
          created_at?: string
          current_location_lat?: number | null
          current_location_lng?: number | null
          delivery_fee: number
          delivery_location_address: string
          delivery_location_lat: number
          delivery_location_lng: number
          delivery_personnel_id?: string | null
          distance_km: number
          estimated_delivery_time?: string | null
          id?: string
          order_id: string
          pickup_location_address: string
          pickup_location_lat: number
          pickup_location_lng: number
          status?: string
          tracking_updates?: Json | null
          updated_at?: string
        }
        Update: {
          actual_delivery_time?: string | null
          created_at?: string
          current_location_lat?: number | null
          current_location_lng?: number | null
          delivery_fee?: number
          delivery_location_address?: string
          delivery_location_lat?: number
          delivery_location_lng?: number
          delivery_personnel_id?: string | null
          distance_km?: number
          estimated_delivery_time?: string | null
          id?: string
          order_id?: string
          pickup_location_address?: string
          pickup_location_lat?: number
          pickup_location_lng?: number
          status?: string
          tracking_updates?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_delivery_personnel_id_fkey"
            columns: ["delivery_personnel_id"]
            isOneToOne: false
            referencedRelation: "delivery_personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_personnel: {
        Row: {
          admin_notes: string | null
          constituency: string
          county: string
          created_at: string
          current_location_lat: number | null
          current_location_lng: number | null
          drivers_license_url: string
          email: string
          first_name: string
          id: string
          id_card_url: string
          is_available: boolean
          is_online: boolean
          last_name: string
          phone_number: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          constituency: string
          county: string
          created_at?: string
          current_location_lat?: number | null
          current_location_lng?: number | null
          drivers_license_url: string
          email: string
          first_name: string
          id?: string
          id_card_url: string
          is_available?: boolean
          is_online?: boolean
          last_name: string
          phone_number: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          constituency?: string
          county?: string
          created_at?: string
          current_location_lat?: number | null
          current_location_lng?: number | null
          drivers_license_url?: string
          email?: string
          first_name?: string
          id?: string
          id_card_url?: string
          is_available?: boolean
          is_online?: boolean
          last_name?: string
          phone_number?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      delivery_status_updates: {
        Row: {
          created_at: string | null
          delivery_personnel_id: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          notes: string | null
          order_id: string
          photo_url: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          delivery_personnel_id?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          order_id: string
          photo_url?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          delivery_personnel_id?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          order_id?: string
          photo_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_status_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_tracking: {
        Row: {
          accuracy: number | null
          delivery_order_id: string
          delivery_personnel_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          speed: number | null
          timestamp: string
        }
        Insert: {
          accuracy?: number | null
          delivery_order_id: string
          delivery_personnel_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          speed?: number | null
          timestamp?: string
        }
        Update: {
          accuracy?: number | null
          delivery_order_id?: string
          delivery_personnel_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          speed?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tracking_delivery_personnel_id_fkey"
            columns: ["delivery_personnel_id"]
            isOneToOne: false
            referencedRelation: "delivery_personnel"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_ward_costs: {
        Row: {
          cost: number
          created_at: string
          from_ward_id: string
          id: string
          is_active: boolean
          to_ward_id: string
          updated_at: string
        }
        Insert: {
          cost?: number
          created_at?: string
          from_ward_id: string
          id?: string
          is_active?: boolean
          to_ward_id: string
          updated_at?: string
        }
        Update: {
          cost?: number
          created_at?: string
          from_ward_id?: string
          id?: string
          is_active?: boolean
          to_ward_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_ward_costs_from_ward_id_fkey"
            columns: ["from_ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_ward_costs_to_ward_id_fkey"
            columns: ["to_ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      jumia_product_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_data: Json | null
          interaction_type: string
          jumia_product_id: string
          jumia_product_image: string | null
          jumia_product_link: string
          jumia_product_name: string
          jumia_product_price: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type: string
          jumia_product_id: string
          jumia_product_image?: string | null
          jumia_product_link: string
          jumia_product_name: string
          jumia_product_price: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
          jumia_product_id?: string
          jumia_product_image?: string | null
          jumia_product_link?: string
          jumia_product_name?: string
          jumia_product_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jumia_product_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action_taken: string
          created_at: string | null
          id: string
          moderated_message: string
          order_id: string
          original_message: string
          user_id: string
          violations: string[]
        }
        Insert: {
          action_taken: string
          created_at?: string | null
          id?: string
          moderated_message: string
          order_id: string
          original_message: string
          user_id: string
          violations?: string[]
        }
        Update: {
          action_taken?: string
          created_at?: string | null
          id?: string
          moderated_message?: string
          order_id?: string
          original_message?: string
          user_id?: string
          violations?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_tokens: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          product_id: string | null
          read: boolean
          type: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          product_id?: string | null
          read?: boolean
          type: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          product_id?: string | null
          read?: boolean
          type?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          total_price: number
          unit_price: number
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          product_sku?: string | null
          quantity: number
          total_price: number
          unit_price: number
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_messages: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_read: boolean | null
          message_text: string | null
          order_id: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message_text?: string | null
          order_id: string
          sender_id: string
          sender_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message_text?: string | null
          order_id?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_returns: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_id: string
          description: string | null
          id: string
          order_id: string
          processed_by: string | null
          reason: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          order_id: string
          processed_by?: string | null
          reason: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          order_id?: string
          processed_by?: string | null
          reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          billing_address: Json
          completion_code: string | null
          created_at: string | null
          currency: string | null
          customer_additional_requests: string | null
          customer_email: string
          customer_phone: string | null
          delivery_fee: number | null
          delivery_location_address: string | null
          delivery_location_lat: number | null
          delivery_location_lng: number | null
          delivery_photo_url: string | null
          delivery_rating: number | null
          delivery_review_comment: string | null
          delivery_type: string | null
          discount_amount: number | null
          estimated_delivery_date: string | null
          fulfillment_method: string
          id: string
          mpesa_transaction_id: string | null
          notes: string | null
          order_number: string
          packaging_guidelines: string | null
          payment_method: string | null
          payment_status: string | null
          pickup_location: string | null
          pickup_phone: string | null
          product_rating: number | null
          product_review_comment: string | null
          rated_at: string | null
          shipping_address: Json | null
          shipping_amount: number | null
          status: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_delivery_date?: string | null
          billing_address?: Json
          completion_code?: string | null
          created_at?: string | null
          currency?: string | null
          customer_additional_requests?: string | null
          customer_email: string
          customer_phone?: string | null
          delivery_fee?: number | null
          delivery_location_address?: string | null
          delivery_location_lat?: number | null
          delivery_location_lng?: number | null
          delivery_photo_url?: string | null
          delivery_rating?: number | null
          delivery_review_comment?: string | null
          delivery_type?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          fulfillment_method: string
          id?: string
          mpesa_transaction_id?: string | null
          notes?: string | null
          order_number: string
          packaging_guidelines?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_location?: string | null
          pickup_phone?: string | null
          product_rating?: number | null
          product_review_comment?: string | null
          rated_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_delivery_date?: string | null
          billing_address?: Json
          completion_code?: string | null
          created_at?: string | null
          currency?: string | null
          customer_additional_requests?: string | null
          customer_email?: string
          customer_phone?: string | null
          delivery_fee?: number | null
          delivery_location_address?: string | null
          delivery_location_lat?: number | null
          delivery_location_lng?: number | null
          delivery_photo_url?: string | null
          delivery_rating?: number | null
          delivery_review_comment?: string | null
          delivery_type?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          fulfillment_method?: string
          id?: string
          mpesa_transaction_id?: string | null
          notes?: string | null
          order_number?: string
          packaging_guidelines?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_location?: string | null
          pickup_phone?: string | null
          product_rating?: number | null
          product_review_comment?: string | null
          rated_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          id: string
          order_id: string
          payment_method: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          id?: string
          order_id: string
          payment_method?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          id?: string
          order_id?: string
          payment_method?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      points_config: {
        Row: {
          created_at: string
          customer_premium_enabled: boolean
          first_purchase_points: number
          id: string
          point_value_kes: number
          points_expiry_months: number
          quiz_completion_points: number
          redemption_enabled: boolean
          referral_purchase_points: number
          referral_signup_points: number
          spending_points_per_100_kes: number
          updated_at: string
          vendor_subscription_enabled: boolean
        }
        Insert: {
          created_at?: string
          customer_premium_enabled?: boolean
          first_purchase_points?: number
          id?: string
          point_value_kes?: number
          points_expiry_months?: number
          quiz_completion_points?: number
          redemption_enabled?: boolean
          referral_purchase_points?: number
          referral_signup_points?: number
          spending_points_per_100_kes?: number
          updated_at?: string
          vendor_subscription_enabled?: boolean
        }
        Update: {
          created_at?: string
          customer_premium_enabled?: boolean
          first_purchase_points?: number
          id?: string
          point_value_kes?: number
          points_expiry_months?: number
          quiz_completion_points?: number
          redemption_enabled?: boolean
          referral_purchase_points?: number
          referral_signup_points?: number
          spending_points_per_100_kes?: number
          updated_at?: string
          vendor_subscription_enabled?: boolean
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          order_id: string | null
          points: number
          reason: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points: number
          reason: string
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points?: number
          reason?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_attributes: {
        Row: {
          attribute_name: string
          attribute_value: string
          created_at: string
          id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          attribute_name: string
          attribute_value: string
          created_at?: string
          id?: string
          product_id: string
          updated_at?: string
        }
        Update: {
          attribute_name?: string
          attribute_value?: string
          created_at?: string
          id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_description: string | null
          image_url: string
          is_main_image: boolean
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_description?: string | null
          image_url: string
          is_main_image?: boolean
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_description?: string | null
          image_url?: string
          is_main_image?: boolean
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_verified_purchase: boolean | null
          product_id: string | null
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          banned: boolean
          banned_reason: string | null
          battery_capacity_mah: number | null
          brand: string | null
          brand_level: string | null
          category: string
          commission_percentage: number | null
          connection_gender: string | null
          cpu_manufacturer: string | null
          created_at: string | null
          currency: string | null
          delivery_methods: Json | null
          description: string | null
          display_resolution: string | null
          display_size: string | null
          display_size_inch: number | null
          graphics_memory_gb: number | null
          has_warranty: boolean | null
          hdd_size: string | null
          height_cm: number | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          length_cm: number | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          main_category: string | null
          main_image: string | null
          materials: string[] | null
          memory_capacity_gb: number | null
          memory_technology: string | null
          modem_type: string | null
          mount_type: string | null
          name: string
          original_price: number | null
          panel_type: string | null
          pickup_constituency: string | null
          pickup_county: string | null
          pickup_location: string | null
          pickup_phone: string | null
          pickup_phone_number: string | null
          pickup_ward: string | null
          plug_type: string | null
          price: number
          processor: string | null
          processor_type: string | null
          ram: string | null
          rating: number | null
          rejection_reason: string | null
          return_eligible: boolean | null
          return_policy_guidelines: string | null
          return_policy_reason: string | null
          review_count: number | null
          sku: string | null
          specifications: Json | null
          status: string
          stock_quantity: number | null
          storage: string | null
          storage_capacity_gb: number | null
          sub_subcategory: string | null
          subcategory: string | null
          system_memory: string | null
          tags: string[] | null
          updated_at: string | null
          vendor_id: string | null
          voltage: string | null
          warranty_period: number | null
          warranty_unit: string | null
          weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          banned?: boolean
          banned_reason?: string | null
          battery_capacity_mah?: number | null
          brand?: string | null
          brand_level?: string | null
          category: string
          commission_percentage?: number | null
          connection_gender?: string | null
          cpu_manufacturer?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_methods?: Json | null
          description?: string | null
          display_resolution?: string | null
          display_size?: string | null
          display_size_inch?: number | null
          graphics_memory_gb?: number | null
          has_warranty?: boolean | null
          hdd_size?: string | null
          height_cm?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          length_cm?: number | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          main_category?: string | null
          main_image?: string | null
          materials?: string[] | null
          memory_capacity_gb?: number | null
          memory_technology?: string | null
          modem_type?: string | null
          mount_type?: string | null
          name: string
          original_price?: number | null
          panel_type?: string | null
          pickup_constituency?: string | null
          pickup_county?: string | null
          pickup_location?: string | null
          pickup_phone?: string | null
          pickup_phone_number?: string | null
          pickup_ward?: string | null
          plug_type?: string | null
          price: number
          processor?: string | null
          processor_type?: string | null
          ram?: string | null
          rating?: number | null
          rejection_reason?: string | null
          return_eligible?: boolean | null
          return_policy_guidelines?: string | null
          return_policy_reason?: string | null
          review_count?: number | null
          sku?: string | null
          specifications?: Json | null
          status?: string
          stock_quantity?: number | null
          storage?: string | null
          storage_capacity_gb?: number | null
          sub_subcategory?: string | null
          subcategory?: string | null
          system_memory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vendor_id?: string | null
          voltage?: string | null
          warranty_period?: number | null
          warranty_unit?: string | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          banned?: boolean
          banned_reason?: string | null
          battery_capacity_mah?: number | null
          brand?: string | null
          brand_level?: string | null
          category?: string
          commission_percentage?: number | null
          connection_gender?: string | null
          cpu_manufacturer?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_methods?: Json | null
          description?: string | null
          display_resolution?: string | null
          display_size?: string | null
          display_size_inch?: number | null
          graphics_memory_gb?: number | null
          has_warranty?: boolean | null
          hdd_size?: string | null
          height_cm?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          length_cm?: number | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          main_category?: string | null
          main_image?: string | null
          materials?: string[] | null
          memory_capacity_gb?: number | null
          memory_technology?: string | null
          modem_type?: string | null
          mount_type?: string | null
          name?: string
          original_price?: number | null
          panel_type?: string | null
          pickup_constituency?: string | null
          pickup_county?: string | null
          pickup_location?: string | null
          pickup_phone?: string | null
          pickup_phone_number?: string | null
          pickup_ward?: string | null
          plug_type?: string | null
          price?: number
          processor?: string | null
          processor_type?: string | null
          ram?: string | null
          rating?: number | null
          rejection_reason?: string | null
          return_eligible?: boolean | null
          return_policy_guidelines?: string | null
          return_policy_reason?: string | null
          review_count?: number | null
          sku?: string | null
          specifications?: Json | null
          status?: string
          stock_quantity?: number | null
          storage?: string | null
          storage_capacity_gb?: number | null
          sub_subcategory?: string | null
          subcategory?: string | null
          system_memory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vendor_id?: string | null
          voltage?: string | null
          warranty_period?: number | null
          warranty_unit?: string | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          account_setup_completed: boolean | null
          admin_notes: string | null
          age: number | null
          avatar_url: string | null
          bank_name: string | null
          brand_name: string | null
          business_type: string | null
          chat_count: number | null
          company: string | null
          company_website: string | null
          constituency: string | null
          county: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          heard_about_us: string | null
          id: string
          last_name: string | null
          location: string | null
          phone_number: string | null
          plan: string | null
          plan_expiry: string | null
          preferences: Json | null
          rejection_reason: string | null
          role: string | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          user_type: string | null
          vendor_serial_number: string | null
          ward: string | null
          website_url: string | null
          whatsapp_number: string | null
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          account_setup_completed?: boolean | null
          admin_notes?: string | null
          age?: number | null
          avatar_url?: string | null
          bank_name?: string | null
          brand_name?: string | null
          business_type?: string | null
          chat_count?: number | null
          company?: string | null
          company_website?: string | null
          constituency?: string | null
          county?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          heard_about_us?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          phone_number?: string | null
          plan?: string | null
          plan_expiry?: string | null
          preferences?: Json | null
          rejection_reason?: string | null
          role?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_type?: string | null
          vendor_serial_number?: string | null
          ward?: string | null
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          account_setup_completed?: boolean | null
          admin_notes?: string | null
          age?: number | null
          avatar_url?: string | null
          bank_name?: string | null
          brand_name?: string | null
          business_type?: string | null
          chat_count?: number | null
          company?: string | null
          company_website?: string | null
          constituency?: string | null
          county?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          heard_about_us?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          phone_number?: string | null
          plan?: string | null
          plan_expiry?: string | null
          preferences?: Json | null
          rejection_reason?: string | null
          role?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_type?: string | null
          vendor_serial_number?: string | null
          ward?: string | null
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          action: string
          attempt_count: number | null
          blocked_until: string | null
          created_at: string | null
          first_attempt_at: string | null
          id: string
          identifier: string
          is_blocked: boolean | null
          last_attempt_at: string | null
          updated_at: string | null
        }
        Insert: {
          action: string
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier: string
          is_blocked?: boolean | null
          last_attempt_at?: string | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier?: string
          is_blocked?: boolean | null
          last_attempt_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          identifier: string
          ip_address: unknown
          metadata: Json | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          identifier: string
          ip_address?: unknown
          metadata?: Json | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          identifier?: string
          ip_address?: unknown
          metadata?: Json | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      shared_content: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          share_code: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          share_code?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          share_code?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      shipping: {
        Row: {
          actual_delivery_date: string | null
          carrier: string
          created_at: string | null
          estimated_delivery_date: string | null
          id: string
          order_id: string
          shipping_method: string
          status: string
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          carrier: string
          created_at?: string | null
          estimated_delivery_date?: string | null
          id?: string
          order_id: string
          shipping_method: string
          status?: string
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          carrier?: string
          created_at?: string | null
          estimated_delivery_date?: string | null
          id?: string
          order_id?: string
          shipping_method?: string
          status?: string
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      style_quiz_questions: {
        Row: {
          created_at: string
          gender: string
          id: string
          is_active: boolean
          options: Json
          question_order: number
          question_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gender: string
          id?: string
          is_active?: boolean
          options: Json
          question_order: number
          question_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gender?: string
          id?: string
          is_active?: boolean
          options?: Json
          question_order?: number
          question_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          created_at: string
          id: string
          message: string
          phone_number: string
          request_type: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          phone_number: string
          request_type?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          phone_number?: string
          request_type?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          module_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          module_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          module_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      trending_posts: {
        Row: {
          button_text: string | null
          created_at: string | null
          description: string
          id: string
          image_file_path: string | null
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          button_text?: string | null
          created_at?: string | null
          description: string
          id?: string
          image_file_path?: string | null
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          button_text?: string | null
          created_at?: string | null
          description?: string
          id?: string
          image_file_path?: string | null
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_cart_items: {
        Row: {
          added_at: string | null
          id: string
          price: number | null
          product_category: string | null
          product_id: string
          product_name: string | null
          quantity: number | null
          removed_at: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          price?: number | null
          product_category?: string | null
          product_id: string
          product_name?: string | null
          quantity?: number | null
          removed_at?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          price?: number | null
          product_category?: string | null
          product_id?: string
          product_name?: string | null
          quantity?: number | null
          removed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_likes: {
        Row: {
          created_at: string | null
          custom_note: string | null
          id: string
          product_category: string | null
          product_id: string
          product_name: string | null
          user_id: string | null
          wishlist_group_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_note?: string | null
          id?: string
          product_category?: string | null
          product_id: string
          product_name?: string | null
          user_id?: string | null
          wishlist_group_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_note?: string | null
          id?: string
          product_category?: string | null
          product_id?: string
          product_name?: string | null
          user_id?: string | null
          wishlist_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_likes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_likes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_likes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_likes_wishlist_group_id_fkey"
            columns: ["wishlist_group_id"]
            isOneToOne: false
            referencedRelation: "wishlist_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          action_text: string | null
          action_url: string | null
          category: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          available_points: number
          created_at: string
          id: string
          lifetime_earned: number
          lifetime_redeemed: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_points?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_redeemed?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_points?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_redeemed?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_product_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_product_interactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_product_interactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_product_interactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_purchases: {
        Row: {
          id: string
          price: number | null
          product_category: string | null
          product_id: string
          product_name: string | null
          purchase_date: string | null
          quantity: number | null
          user_id: string | null
        }
        Insert: {
          id?: string
          price?: number | null
          product_category?: string | null
          product_id: string
          product_name?: string | null
          purchase_date?: string | null
          quantity?: number | null
          user_id?: string | null
        }
        Update: {
          id?: string
          price?: number | null
          product_category?: string | null
          product_id?: string
          product_name?: string | null
          purchase_date?: string | null
          quantity?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_responses: {
        Row: {
          completed_at: string
          id: string
          question_id: string
          selected_option: Json
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          question_id: string
          selected_option: Json
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          question_id?: string
          selected_option?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "style_quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_referrals: {
        Row: {
          created_at: string
          id: string
          purchase_points_awarded: boolean
          referral_code: string
          referred_id: string
          referrer_id: string
          signup_points_awarded: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          purchase_points_awarded?: boolean
          referral_code: string
          referred_id: string
          referrer_id: string
          signup_points_awarded?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          purchase_points_awarded?: boolean
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          signup_points_awarded?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_searches: {
        Row: {
          created_at: string | null
          id: string
          search_category: string | null
          search_query: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          search_category?: string | null
          search_query: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          search_category?: string | null
          search_query?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean
          billing_cycle: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_type: string
          price_kes: number | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          billing_cycle?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type: string
          price_kes?: number | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          billing_cycle?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: string
          price_kes?: number | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_training_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          module_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          module_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_violations: {
        Row: {
          created_at: string | null
          id: string
          is_suspended: boolean
          last_violation: string
          updated_at: string | null
          user_id: string
          violation_count: number
          violation_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_suspended?: boolean
          last_violation?: string
          updated_at?: string | null
          user_id: string
          violation_count?: number
          violation_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_suspended?: boolean
          last_violation?: string
          updated_at?: string | null
          user_id?: string
          violation_count?: number
          violation_type?: string
        }
        Relationships: []
      }
      vendor_application_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          step_data: Json | null
          step_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          step_data?: Json | null
          step_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          step_data?: Json | null
          step_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_application_steps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_commissions: {
        Row: {
          category_path: string | null
          created_at: string
          freemium_commission_rate: number
          id: string
          is_active: boolean
          main_category: string | null
          premium_commission_rate: number
          sub_subcategory: string | null
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          category_path?: string | null
          created_at?: string
          freemium_commission_rate?: number
          id?: string
          is_active?: boolean
          main_category?: string | null
          premium_commission_rate?: number
          sub_subcategory?: string | null
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          category_path?: string | null
          created_at?: string
          freemium_commission_rate?: number
          id?: string
          is_active?: boolean
          main_category?: string | null
          premium_commission_rate?: number
          sub_subcategory?: string | null
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vendor_earnings: {
        Row: {
          amount: number
          available_date: string | null
          commission_rate: number
          created_at: string
          id: string
          net_amount: number
          order_id: string
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount: number
          available_date?: string | null
          commission_rate: number
          created_at?: string
          id?: string
          net_amount: number
          order_id: string
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          available_date?: string | null
          commission_rate?: number
          created_at?: string
          id?: string
          net_amount?: number
          order_id?: string
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_guidelines: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: []
      }
      vendor_payment_preferences: {
        Row: {
          airtel_number: string | null
          bank_account_holder_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          created_at: string
          id: string
          mpesa_number: string | null
          payment_interval: string
          preferred_payment_method: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          airtel_number?: string | null
          bank_account_holder_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          mpesa_number?: string | null
          payment_interval: string
          preferred_payment_method: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          airtel_number?: string | null
          bank_account_holder_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          mpesa_number?: string | null
          payment_interval?: string
          preferred_payment_method?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_payouts: {
        Row: {
          amount: number
          batch_id: string | null
          created_at: string
          id: string
          payment_details: Json
          payment_method: string
          processed_by: string | null
          processed_date: string | null
          scheduled_date: string
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount: number
          batch_id?: string | null
          created_at?: string
          id?: string
          payment_details: Json
          payment_method: string
          processed_by?: string | null
          processed_date?: string | null
          scheduled_date: string
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          batch_id?: string | null
          created_at?: string
          id?: string
          payment_details?: Json
          payment_method?: string
          processed_by?: string | null
          processed_date?: string | null
          scheduled_date?: string
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string
          expires_at: string | null
          id: string
          monthly_fee_usd: number
          plan_type: string
          started_at: string
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          monthly_fee_usd?: number
          plan_type: string
          started_at?: string
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          monthly_fee_usd?: number
          plan_type?: string
          started_at?: string
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      wards: {
        Row: {
          constituency_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          constituency_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          constituency_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wards_constituency_id_fkey"
            columns: ["constituency_id"]
            isOneToOne: false
            referencedRelation: "constituencies"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_groups: {
        Row: {
          created_at: string
          description: string | null
          hashtag: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hashtag?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hashtag?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          mpesa_number: string
          processed_at: string | null
          status: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          mpesa_number: string
          processed_at?: string | null
          status?: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          mpesa_number?: string
          processed_at?: string | null
          status?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      product_popularity: {
        Row: {
          brand: string | null
          category: string | null
          conversion_rate: number | null
          created_at: string | null
          description: string | null
          id: string | null
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          last_updated_at: string | null
          like_count: number | null
          main_image: string | null
          name: string | null
          original_price: number | null
          price: number | null
          product_id: string | null
          purchase_count: number | null
          rating: number | null
          review_count: number | null
          sku: string | null
          specifications: Json | null
          stock_quantity: number | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string | null
          vendor_id: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews_public: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string | null
          is_verified_purchase: boolean | null
          product_id: string | null
          rating: number | null
          reviewer_first_name: string | null
          reviewer_last_name: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_popularity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_product: { Args: { product_id: string }; Returns: boolean }
      approve_vendor_application: {
        Args: { admin_notes?: string; application_id: string }
        Returns: boolean
      }
      award_spending_points: {
        Args: { amount_spent: number; user_id_param: string }
        Returns: undefined
      }
      calculate_delivery_cost: {
        Args: {
          from_constituency_name?: string
          from_county_name: string
          from_ward_name?: string
          to_constituency_name?: string
          to_county_name: string
          to_ward_name?: string
        }
        Returns: number
      }
      calculate_delivery_fee: { Args: { distance_km: number }; Returns: number }
      calculate_distance_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      check_admin_access: {
        Args: { _required_role?: string; _user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: {
          blocked_until: string
          is_allowed: boolean
          remaining_attempts: number
        }[]
      }
      cleanup_old_security_records: { Args: never; Returns: number }
      create_admin_user: {
        Args: { _created_by: string; _email: string; _role: string }
        Returns: Json
      }
      debug_admin_roles: {
        Args: { user_uuid: string }
        Returns: {
          email: string
          is_admin: boolean
          roles: string[]
          tenant_id: string
          user_id: string
        }[]
      }
      disable_customer_premium: { Args: never; Returns: undefined }
      enable_customer_premium: { Args: never; Returns: undefined }
      generate_completion_code: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      generate_product_sku: {
        Args: {
          p_brand: string
          p_category: string
          p_main_image: string
          p_vendor_id: string
        }
        Returns: string
      }
      generate_share_code: { Args: never; Returns: string }
      generate_vendor_serial: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      get_user_violation_count: {
        Args: { user_uuid: string; violation_type_param: string }
        Returns: number
      }
      get_vendor_applications_with_emails: {
        Args: never
        Returns: {
          business_type: string
          company: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone_number: string
          status: string
        }[]
      }
      get_vendor_commission_rate: {
        Args: { category_path_param: string; vendor_id_param: string }
        Returns: number
      }
      has_admin_role: {
        Args: { _role?: string; _user_id: string }
        Returns: boolean
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_admin:
        | { Args: { user_id: string }; Returns: boolean }
        | { Args: never; Returns: boolean }
      is_admin_active: { Args: { _user_id?: string }; Returns: boolean }
      is_admin_user: { Args: { _user_id?: string }; Returns: boolean }
      is_main_admin: { Args: { _user_id?: string }; Returns: boolean }
      is_user_suspended: { Args: { user_uuid: string }; Returns: boolean }
      is_vendor_order:
        | {
            Args: {
              order_row: Database["public"]["Tables"]["orders"]["Row"]
              vendor: string
            }
            Returns: boolean
          }
        | { Args: { order_id: number }; Returns: boolean }
      log_security_event: {
        Args: {
          p_action: string
          p_error_message?: string
          p_event_type: string
          p_identifier: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_success?: boolean
          p_user_agent?: string
        }
        Returns: string
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: boolean
      }
      redeem_points: {
        Args: {
          order_id_param?: string
          points_to_redeem: number
          user_id_param: string
        }
        Returns: boolean
      }
      reject_product: {
        Args: { product_id: string; reason: string }
        Returns: boolean
      }
      reject_vendor_application: {
        Args: { admin_notes?: string; application_id: string }
        Returns: boolean
      }
      reset_admin_password: {
        Args: {
          _current_password: string
          _new_password: string
          _user_id: string
        }
        Returns: boolean
      }
      toggle_admin_suspension: {
        Args: { _suspend: boolean; _suspended_by: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
