export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      invoices: {
        Row: {
          amount_kobo: number
          created_at: string
          due_date: string
          id: string
          lease_id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string | null
        }
        Insert: {
          amount_kobo: number
          created_at?: string
          due_date: string
          id?: string
          lease_id: string
          paid_at?: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string | null
        }
        Update: {
          amount_kobo?: number
          created_at?: string
          due_date?: string
          id?: string
          lease_id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: true
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string
          end_date: string
          id: string
          lease_status: Database["public"]["Enums"]["lease_status"]
          rent_kobo: number
          start_date: string
          tenant_id: string
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          lease_status: Database["public"]["Enums"]["lease_status"]
          rent_kobo: number
          start_date: string
          tenant_id: string
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          lease_status?: Database["public"]["Enums"]["lease_status"]
          rent_kobo?: number
          start_date?: string
          tenant_id?: string
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: true
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_events: {
        Row: {
          changed_by: string
          created_at: string
          from_status: Database["public"]["Enums"]["maintenance_requests_status"]
          id: string
          request_id: string
          to_status: Database["public"]["Enums"]["maintenance_requests_status"]
        }
        Insert: {
          changed_by: string
          created_at?: string
          from_status: Database["public"]["Enums"]["maintenance_requests_status"]
          id?: string
          request_id: string
          to_status: Database["public"]["Enums"]["maintenance_requests_status"]
        }
        Update: {
          changed_by?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["maintenance_requests_status"]
          id?: string
          request_id?: string
          to_status?: Database["public"]["Enums"]["maintenance_requests_status"]
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_events_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          assigned_staff_id: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["maintenance_requests_priority"]
          property_id: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["maintenance_requests_status"]
          title: string
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_staff_id?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          priority: Database["public"]["Enums"]["maintenance_requests_priority"]
          property_id: string
          resolved_at?: string | null
          status: Database["public"]["Enums"]["maintenance_requests_status"]
          title: string
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_staff_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["maintenance_requests_priority"]
          property_id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_requests_status"]
          title?: string
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_assigned_staff_id_fkey1"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_kobo: number
          id: string
          invoice_id: string
          paid_at: string
          payment_method: string
        }
        Insert: {
          amount_kobo: number
          id?: string
          invoice_id: string
          paid_at?: string
          payment_method: string
        }
        Update: {
          amount_kobo?: number
          id?: string
          invoice_id?: string
          paid_at?: string
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone_number?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          organization_id: string
          total_units: number
          type: Database["public"]["Enums"]["buidling_type"]
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          organization_id: string
          total_units: number
          type: Database["public"]["Enums"]["buidling_type"]
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          organization_id?: string
          total_units?: number
          type?: Database["public"]["Enums"]["buidling_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["staff_status"]
        }
        Insert: {
          created_at?: string
          id: string
          status: Database["public"]["Enums"]["staff_status"]
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["staff_status"]
        }
        Relationships: [
          {
            foreignKeyName: "staff_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_assignments: {
        Row: {
          assigned_at: string
          id: string
          property_id: string
          role: Database["public"]["Enums"]["staff_role"]
          staff_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          property_id: string
          role: Database["public"]["Enums"]["staff_role"]
          staff_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          property_id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_invites: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          organization_id: string
          redeemed_at: string | null
          redeemed_by: string | null
          status: Database["public"]["Enums"]["staff_invite_status"]
          text_code: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          organization_id: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status: Database["public"]["Enums"]["staff_invite_status"]
          text_code: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          organization_id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: Database["public"]["Enums"]["staff_invite_status"]
          text_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invites_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_invites: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          organization_id: string
          redeemed_at: string | null
          redeemed_by: string | null
          status: Database["public"]["Enums"]["tenant_invite_status"]
          text_code: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          organization_id: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status: Database["public"]["Enums"]["tenant_invite_status"]
          text_code: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          organization_id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: Database["public"]["Enums"]["tenant_invite_status"]
          text_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invites_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["tenant_status"]
        }
        Insert: {
          created_at?: string
          id: string
          status: Database["public"]["Enums"]["tenant_status"]
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["tenant_status"]
        }
        Relationships: [
          {
            foreignKeyName: "tenants_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_occupants: {
        Row: {
          created_at: string
          left_at: string | null
          tenant_id: string
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          left_at?: string | null
          tenant_id: string
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          left_at?: string | null
          tenant_id?: string
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_occupants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_occupants_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          id: string
          property_id: string
          unit_description: string | null
          unit_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          unit_description?: string | null
          unit_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          unit_description?: string | null
          unit_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      buidling_type: "commercial" | "residential"
      invoice_status: "draft" | "issued" | "paid" | "overdue"
      lease_status: "active" | "expired" | "pending"
      maintenance_requests_priority: "low" | "medium" | "high" | "urgent"
      maintenance_requests_status:
        | "open"
        | "in_progress"
        | "resolved"
        | "closed"
      staff_invite_status: "pending" | "redeemed" | "expired" | "revoked"
      staff_role:
        | "security"
        | "cleaning"
        | "electrical"
        | "manager"
        | "plumbing"
      staff_status: "active" | "inactive"
      tenant_invite_status: "pending" | "redeemed" | "expired" | "revoked"
      tenant_status: "active" | "terminated" | "pending"
      user_role: "admin" | "owner" | "tenant" | "staff"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      buidling_type: ["commercial", "residential"],
      invoice_status: ["draft", "issued", "paid", "overdue"],
      lease_status: ["active", "expired", "pending"],
      maintenance_requests_priority: ["low", "medium", "high", "urgent"],
      maintenance_requests_status: [
        "open",
        "in_progress",
        "resolved",
        "closed",
      ],
      staff_invite_status: ["pending", "redeemed", "expired", "revoked"],
      staff_role: ["security", "cleaning", "electrical", "manager", "plumbing"],
      staff_status: ["active", "inactive"],
      tenant_invite_status: ["pending", "redeemed", "expired", "revoked"],
      tenant_status: ["active", "terminated", "pending"],
      user_role: ["admin", "owner", "tenant", "staff"],
    },
  },
} as const

