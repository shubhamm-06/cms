export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          role: "admin" | "owner";
          status: "pending" | "active" | "inactive";
          avatar_url: string | null;
          is_protected: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          name: string;
          city: string | null;
          address: string | null;
          bedrooms: number | null;
          owner_id: string | null;
          owner_share: number;
          cms_share: number;
          image_url: string | null;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["properties"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Row"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          property_id: string;
          guest_name: string;
          guest_phone: string | null;
          source: string | null;
          check_in: string;
          check_out: string;
          nights: number | null;
          guests: number | null;
          nightly_rate: number | null;
          total_amount: number;
          status: "upcoming" | "in_house" | "checked_out" | "cancelled" | "blocked";
          cleaning_schedule: string | null;
          concierge: string[] | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bookings"]["Row"]> & {
          property_id: string;
          guest_name: string;
          check_in: string;
          check_out: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          expense_for: "property" | "cms";
          property_id: string | null;
          date: string;
          category: string;
          amount: number;
          vendor: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["expenses"]["Row"]> & {
          expense_for: "property" | "cms";
          date: string;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Row"]>;
        Relationships: [];
      };
      owner_payouts: {
        Row: {
          id: string;
          property_id: string;
          owner_id: string;
          month: string;
          revenue_total: number;
          expense_total: number;
          net_profit: number;
          owner_share_amount: number;
          cms_share_amount: number;
          tds_amount: number;
          final_payout_amount: number;
          status: "draft" | "ready_for_review" | "approved" | "query_raised" | "resolved" | "paid";
          admin_note: string | null;
          owner_note: string | null;
          approved_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["owner_payouts"]["Row"]> & {
          property_id: string;
          owner_id: string;
          month: string;
        };
        Update: Partial<Database["public"]["Tables"]["owner_payouts"]["Row"]>;
        Relationships: [];
      };
      owner_queries: {
        Row: {
          id: string;
          owner_id: string;
          property_id: string | null;
          payout_id: string | null;
          message: string;
          status: "open" | "resolved";
          resolved: boolean;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["owner_queries"]["Row"]> & {
          owner_id: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["owner_queries"]["Row"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["settings"]["Row"]> & {
          key: string;
          value: Json;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          message: string | null;
          source_page: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contact_submissions"]["Row"]> & {
          name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_submissions"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
