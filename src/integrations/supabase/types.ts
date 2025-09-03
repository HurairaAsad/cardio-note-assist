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
      patient_care_team: {
        Row: {
          contact_info: string | null
          created_at: string
          id: string
          is_active: boolean | null
          patient_id: string
          provider_name: string | null
          provider_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          patient_id: string
          provider_name?: string | null
          provider_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          patient_id?: string
          provider_name?: string | null
          provider_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_care_team_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_diagnoses: {
        Row: {
          category: string | null
          created_at: string
          diagnosed_date: string | null
          diagnosis_name: string
          icd_code: string
          id: string
          is_active: boolean | null
          patient_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          diagnosed_date?: string | null
          diagnosis_name: string
          icd_code: string
          id?: string
          is_active?: boolean | null
          patient_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          diagnosed_date?: string | null
          diagnosis_name?: string
          icd_code?: string
          id?: string
          is_active?: boolean | null
          patient_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_diagnoses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_encounters: {
        Row: {
          cpt_code: string | null
          created_at: string
          encounter_date: string
          encounter_type: string | null
          facility: string | null
          id: string
          notes: string | null
          patient_id: string
          provider: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cpt_code?: string | null
          created_at?: string
          encounter_date?: string
          encounter_type?: string | null
          facility?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          provider?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cpt_code?: string | null
          created_at?: string
          encounter_date?: string
          encounter_type?: string | null
          facility?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          provider?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_family_history: {
        Row: {
          condition_name: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          relative: string
          relative_age: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          condition_name: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          relative: string
          relative_age?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          condition_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          relative?: string
          relative_age?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_family_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medications: {
        Row: {
          category: string | null
          created_at: string
          dosage: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          medication_name: string
          patient_id: string
          started_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          medication_name: string
          patient_id: string
          started_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          medication_name?: string
          patient_id?: string
          started_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_procedures: {
        Row: {
          created_at: string
          facility: string | null
          id: string
          notes: string | null
          patient_id: string
          procedure_date: string | null
          procedure_name: string
          provider: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          facility?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          procedure_date?: string | null
          procedure_name: string
          provider?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          facility?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          procedure_date?: string | null
          procedure_name?: string
          provider?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_procedures_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_social_history: {
        Row: {
          alcohol_use: string | null
          created_at: string
          drug_use: string | null
          id: string
          notes: string | null
          patient_id: string
          tobacco_use: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alcohol_use?: string | null
          created_at?: string
          drug_use?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          tobacco_use?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alcohol_use?: string | null
          created_at?: string
          drug_use?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          tobacco_use?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_social_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_vitals: {
        Row: {
          created_at: string
          id: string
          measurement_date: string
          patient_id: string
          updated_at: string
          user_id: string
          values: Json | null
          vital_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          measurement_date?: string
          patient_id: string
          updated_at?: string
          user_id: string
          values?: Json | null
          vital_type: string
        }
        Update: {
          created_at?: string
          id?: string
          measurement_date?: string
          patient_id?: string
          updated_at?: string
          user_id?: string
          values?: Json | null
          vital_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          created_at: string
          date_of_birth: string | null
          facility: string | null
          first_name: string
          id: string
          last_name: string
          mr_source: string | null
          prn_mrn: string | null
          provider: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          facility?: string | null
          first_name: string
          id?: string
          last_name: string
          mr_source?: string | null
          prn_mrn?: string | null
          provider?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          facility?: string | null
          first_name?: string
          id?: string
          last_name?: string
          mr_source?: string | null
          prn_mrn?: string | null
          provider?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          license_number: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          license_number?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          license_number?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          final_report: string
          id: string
          initial_analysis: string | null
          original_document_name: string | null
          physical_exam: Json | null
          review_of_systems: Json | null
          template_type: string | null
          title: string
          updated_at: string
          user_id: string
          visit_notes: Json | null
        }
        Insert: {
          created_at?: string
          final_report: string
          id?: string
          initial_analysis?: string | null
          original_document_name?: string | null
          physical_exam?: Json | null
          review_of_systems?: Json | null
          template_type?: string | null
          title: string
          updated_at?: string
          user_id: string
          visit_notes?: Json | null
        }
        Update: {
          created_at?: string
          final_report?: string
          id?: string
          initial_analysis?: string | null
          original_document_name?: string | null
          physical_exam?: Json | null
          review_of_systems?: Json | null
          template_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visit_notes?: Json | null
        }
        Relationships: []
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
