export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_phone: string | null
          discount_amount: number | null
          estimated_delivery_date: string | null
          fulfillment_method: string
          id: string
          mpesa_transaction_id: string | null
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          pickup_location: string | null
          pickup_phone: string | null
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
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_phone?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          fulfillment_method: string
          id?: string
          mpesa_transaction_id?: string | null
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_location?: string | null
          pickup_phone?: string | null
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
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_phone?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          fulfillment_method?: string
          id?: string
          mpesa_transaction_id?: string | null
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_location?: string | null
          pickup_phone?: string | null
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
          brand: string | null
          category: string
          commission_percentage: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          display_size: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          main_category: string | null
          main_image: string | null
          name: string
          original_price: number | null
          pickup_location: string | null
          pickup_phone: string | null
          pickup_phone_number: string | null
          price: number
          processor: string | null
          ram: string | null
          rating: number | null
          review_count: number | null
          sku: string | null
          specifications: Json | null
          stock_quantity: number | null
          storage: string | null
          sub_subcategory: string | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          commission_percentage?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_size?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          main_category?: string | null
          main_image?: string | null
          name: string
          original_price?: number | null
          pickup_location?: string | null
          pickup_phone?: string | null
          pickup_phone_number?: string | null
          price: number
          processor?: string | null
          ram?: string | null
          rating?: number | null
          review_count?: number | null
          sku?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          storage?: string | null
          sub_subcategory?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          commission_percentage?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_size?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          main_category?: string | null
          main_image?: string | null
          name?: string
          original_price?: number | null
          pickup_location?: string | null
          pickup_phone?: string | null
          pickup_phone_number?: string | null
          price?: number
          processor?: string | null
          ram?: string | null
          rating?: number | null
          review_count?: number | null
          sku?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          storage?: string | null
          sub_subcategory?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vendor_id?: string | null
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
          admin_notes: string | null
          avatar_url: string | null
          business_type: string | null
          company: string | null
          company_website: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          location: string | null
          phone_number: string | null
          preferences: Json | null
          role: string | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          admin_notes?: string | null
          avatar_url?: string | null
          business_type?: string | null
          company?: string | null
          company_website?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          phone_number?: string | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          admin_notes?: string | null
          avatar_url?: string | null
          business_type?: string | null
          company?: string | null
          company_website?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          phone_number?: string | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_type?: string | null
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
          id: string
          product_category: string | null
          product_id: string
          product_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_category?: string | null
          product_id: string
          product_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_category?: string | null
          product_id?: string
          product_name?: string | null
          user_id?: string | null
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
        ]
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
      vendor_applications: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_description: string | null;
          business_address: string | null;
          business_phone: string | null;
          business_email: string | null;
          business_website: string | null;
          tax_id: string | null;
          bank_account_info: Json | null;
          documents: Json | null;
          status: string;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          business_description?: string | null;
          business_address?: string | null;
          business_phone?: string | null;
          business_email?: string | null;
          business_website?: string | null;
          tax_id?: string | null;
          bank_account_info?: Json | null;
          documents?: Json | null;
          status: string;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          business_description?: string | null;
          business_address?: string | null;
          business_phone?: string | null;
          business_email?: string | null;
          business_website?: string | null;
          tax_id?: string | null;
          bank_account_info?: Json | null;
          documents?: Json | null;
          status?: string;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_applications_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_applications_reviewed_by_fkey",
            columns: ["reviewed_by"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ];
      },
      vendor_application_steps: {
        Row: {
          id: string;
          user_id: string;
          step_name: string;
          step_data: Json | null;
          completed_at: string | null;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          step_name: string;
          step_data?: Json | null;
          completed_at?: string | null;
          is_completed: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          step_name?: string;
          step_data?: Json | null;
          completed_at?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      },
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
    }
    Functions: {
      approve_vendor_application: {
        Args: { application_id: string; admin_notes?: string }
        Returns: boolean
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_vendor_applications_with_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone_number: string
          company: string
          business_type: string
          status: string
          created_at: string
        }[]
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      is_vendor_order: {
        Args: {
          order_row: Database["public"]["Tables"]["orders"]["Row"]
          vendor: string
        }
        Returns: boolean
      }
      reject_vendor_application: {
        Args: { application_id: string; admin_notes?: string }
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
