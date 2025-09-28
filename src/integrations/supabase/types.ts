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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_name: string
          account_number: string | null
          account_type: Database["public"]["Enums"]["account_type"]
          balance: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number?: string | null
          account_type: Database["public"]["Enums"]["account_type"]
          balance?: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string | null
          account_type?: Database["public"]["Enums"]["account_type"]
          balance?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      bank_transfer_errors: {
        Row: {
          beneficiary_id: string
          error_code: string
          error_message: string
          error_source: string
          fix_provisions: string | null
          id: string
          notification_sent: boolean | null
          occurred_at: string
          transfer_amount: number
          user_id: string
        }
        Insert: {
          beneficiary_id: string
          error_code: string
          error_message: string
          error_source: string
          fix_provisions?: string | null
          id?: string
          notification_sent?: boolean | null
          occurred_at?: string
          transfer_amount: number
          user_id: string
        }
        Update: {
          beneficiary_id?: string
          error_code?: string
          error_message?: string
          error_source?: string
          fix_provisions?: string | null
          id?: string
          notification_sent?: boolean | null
          occurred_at?: string
          transfer_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      beneficiaries: {
        Row: {
          account_number: string
          bank_name: string
          beneficiary_email: string | null
          beneficiary_name: string
          branch_code: string | null
          created_at: string
          id: string
          kyc_verified: boolean | null
          swift_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          bank_name: string
          beneficiary_email?: string | null
          beneficiary_name: string
          branch_code?: string | null
          created_at?: string
          id?: string
          kyc_verified?: boolean | null
          swift_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          bank_name?: string
          beneficiary_email?: string | null
          beneficiary_name?: string
          branch_code?: string | null
          created_at?: string
          id?: string
          kyc_verified?: boolean | null
          swift_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bulk_payment_schedules: {
        Row: {
          amount_per_beneficiary: number
          beneficiary_ids: string[]
          created_at: string
          frequency: string
          id: string
          is_active: boolean | null
          next_execution_date: string
          schedule_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_per_beneficiary: number
          beneficiary_ids: string[]
          created_at?: string
          frequency: string
          id?: string
          is_active?: boolean | null
          next_execution_date: string
          schedule_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_per_beneficiary?: number
          beneficiary_ids?: string[]
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_execution_date?: string
          schedule_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cbs_balance_updates: {
        Row: {
          account_id: string
          adjustment_amount: number
          compliance_approved: boolean | null
          id: string
          new_balance: number
          old_balance: number
          reason: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          account_id: string
          adjustment_amount: number
          compliance_approved?: boolean | null
          id?: string
          new_balance: number
          old_balance: number
          reason: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          account_id?: string
          adjustment_amount?: number
          compliance_approved?: boolean | null
          id?: string
          new_balance?: number
          old_balance?: number
          reason?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      cbs_lawyer_letters: {
        Row: {
          account_to_credit: string
          credit_amount: number
          id: string
          letter_content: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          account_to_credit: string
          credit_amount: number
          id?: string
          letter_content: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          account_to_credit?: string
          credit_amount?: number
          id?: string
          letter_content?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cbs_notes: {
        Row: {
          account_reference: string
          amount: number
          compliance_status: string
          created_at: string
          description: string
          id: string
          note_type: string
          processed_at: string | null
          processed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          account_reference: string
          amount: number
          compliance_status?: string
          created_at?: string
          description: string
          id?: string
          note_type: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          account_reference?: string
          amount?: number
          compliance_status?: string
          created_at?: string
          description?: string
          id?: string
          note_type?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      db_change_requests: {
        Row: {
          created_at: string
          current_naming: string | null
          id: string
          proposed_naming: string | null
          reason: string | null
          request_type: string
          requester_email: string
          status: string | null
        }
        Insert: {
          created_at?: string
          current_naming?: string | null
          id?: string
          proposed_naming?: string | null
          reason?: string | null
          request_type: string
          requester_email: string
          status?: string | null
        }
        Update: {
          created_at?: string
          current_naming?: string | null
          id?: string
          proposed_naming?: string | null
          reason?: string | null
          request_type?: string
          requester_email?: string
          status?: string | null
        }
        Relationships: []
      }
      job_categories: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      job_listings: {
        Row: {
          category_id: string
          created_at: string
          currency: string
          description: string
          expected_salary_max: number
          expected_salary_min: number
          experience_level: string
          id: string
          location: string
          remote_available: boolean | null
          requirements: string
          title: string
        }
        Insert: {
          category_id: string
          created_at?: string
          currency?: string
          description: string
          expected_salary_max: number
          expected_salary_min: number
          experience_level: string
          id?: string
          location: string
          remote_available?: boolean | null
          requirements: string
          title: string
        }
        Update: {
          category_id?: string
          created_at?: string
          currency?: string
          description?: string
          expected_salary_max?: number
          expected_salary_min?: number
          experience_level?: string
          id?: string
          location?: string
          remote_available?: boolean | null
          requirements?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_job_listings_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "job_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_applications: {
        Row: {
          applicant_email: string
          application_data: Json | null
          company_name: string
          created_at: string
          documents_uploaded: Json | null
          exchange_id: string
          id: string
          status: string
          submitted_at: string | null
        }
        Insert: {
          applicant_email: string
          application_data?: Json | null
          company_name: string
          created_at?: string
          documents_uploaded?: Json | null
          exchange_id: string
          id?: string
          status?: string
          submitted_at?: string | null
        }
        Update: {
          applicant_email?: string
          application_data?: Json | null
          company_name?: string
          created_at?: string
          documents_uploaded?: Json | null
          exchange_id?: string
          id?: string
          status?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_listing_applications_exchange"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "stock_exchanges"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_requirements: {
        Row: {
          description: string
          documents_required: string[] | null
          exchange_id: string
          id: string
          mandatory: boolean | null
          requirement_type: string
        }
        Insert: {
          description: string
          documents_required?: string[] | null
          exchange_id: string
          id?: string
          mandatory?: boolean | null
          requirement_type: string
        }
        Update: {
          description?: string
          documents_required?: string[] | null
          exchange_id?: string
          id?: string
          mandatory?: boolean | null
          requirement_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_listing_requirements_exchange"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "stock_exchanges"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
        }
        Insert: {
          full_name?: string | null
          id: string
        }
        Update: {
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      stock_exchanges: {
        Row: {
          country: string
          created_at: string
          currency: string
          id: string
          market_cap_requirement: number | null
          name: string
          region: string
          trading_hours: string
          website: string | null
        }
        Insert: {
          country: string
          created_at?: string
          currency: string
          id?: string
          market_cap_requirement?: number | null
          name: string
          region: string
          trading_hours: string
          website?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          currency?: string
          id?: string
          market_cap_requirement?: number | null
          name?: string
          region?: string
          trading_hours?: string
          website?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string | null
          icon: string | null
          id: string
          name: string
          recipient_account_number: string | null
          recipient_bank_name: string | null
          recipient_name: string | null
          recipient_swift_code: string | null
          transaction_date: string
        }
        Insert: {
          account_id: string
          amount: number
          category?: string | null
          icon?: string | null
          id?: string
          name: string
          recipient_account_number?: string | null
          recipient_bank_name?: string | null
          recipient_name?: string | null
          recipient_swift_code?: string | null
          transaction_date?: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string | null
          icon?: string | null
          id?: string
          name?: string
          recipient_account_number?: string | null
          recipient_bank_name?: string | null
          recipient_name?: string | null
          recipient_swift_code?: string | null
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      treasury_holdings: {
        Row: {
          amount: number
          currency_code: string
          currency_name: string
          id: string
          last_updated: string
          liquidity_ratio: number
          reserve_ratio: number
          risk_weight: number
          updated_by: string | null
        }
        Insert: {
          amount?: number
          currency_code: string
          currency_name: string
          id?: string
          last_updated?: string
          liquidity_ratio?: number
          reserve_ratio?: number
          risk_weight?: number
          updated_by?: string | null
        }
        Update: {
          amount?: number
          currency_code?: string
          currency_name?: string
          id?: string
          last_updated?: string
          liquidity_ratio?: number
          reserve_ratio?: number
          risk_weight?: number
          updated_by?: string | null
        }
        Relationships: []
      }
      treasury_transactions: {
        Row: {
          amount: number
          exchange_rate: number
          executed_at: string
          executed_by: string
          from_currency: string
          id: string
          reason: string | null
          to_currency: string
          transaction_type: string
        }
        Insert: {
          amount: number
          exchange_rate: number
          executed_at?: string
          executed_by: string
          from_currency: string
          id?: string
          reason?: string | null
          to_currency: string
          transaction_type: string
        }
        Update: {
          amount?: number
          exchange_rate?: number
          executed_at?: string
          executed_by?: string
          from_currency?: string
          id?: string
          reason?: string | null
          to_currency?: string
          transaction_type?: string
        }
        Relationships: []
      }
      treasury_users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          password_hash: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          password_hash: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          password_hash?: string
          role?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      transfer_money: {
        Args: {
          recipient_account_number?: string
          recipient_bank_name?: string
          recipient_name: string
          recipient_swift_code?: string
          sender_account_id: string
          transfer_amount: number
        }
        Returns: undefined
      }
    }
    Enums: {
      account_type: "main" | "savings" | "credit" | "loan"
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
    Enums: {
      account_type: ["main", "savings", "credit", "loan"],
    },
  },
} as const
