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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_learning_history: {
        Row: {
          ai_node_id: string
          ai_node_type: string
          context: Json | null
          created_at: string | null
          id: string
          prompt: string
          response: string
          success_score: number | null
          user_feedback: number | null
          user_id: string | null
        }
        Insert: {
          ai_node_id: string
          ai_node_type: string
          context?: Json | null
          created_at?: string | null
          id?: string
          prompt: string
          response: string
          success_score?: number | null
          user_feedback?: number | null
          user_id?: string | null
        }
        Update: {
          ai_node_id?: string
          ai_node_type?: string
          context?: Json | null
          created_at?: string | null
          id?: string
          prompt?: string
          response?: string
          success_score?: number | null
          user_feedback?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_analysis: {
        Row: {
          analysis_result: Json | null
          analysis_type: string
          created_at: string | null
          id: string
          input_data: Json | null
          insights: string[] | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          analysis_type: string
          created_at?: string | null
          id?: string
          input_data?: Json | null
          insights?: string[] | null
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          analysis_type?: string
          created_at?: string | null
          id?: string
          input_data?: Json | null
          insights?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      generated_code: {
        Row: {
          ai_node_id: string
          code_content: string
          code_language: string
          created_at: string | null
          description: string | null
          execution_success: boolean | null
          id: string
          user_id: string | null
        }
        Insert: {
          ai_node_id: string
          code_content: string
          code_language: string
          created_at?: string | null
          description?: string | null
          execution_success?: boolean | null
          id?: string
          user_id?: string | null
        }
        Update: {
          ai_node_id?: string
          code_content?: string
          code_language?: string
          created_at?: string | null
          description?: string | null
          execution_success?: boolean | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          ai_node_id: string
          created_at: string | null
          generation_time_ms: number | null
          id: string
          image_url: string
          prompt: string
          user_id: string | null
        }
        Insert: {
          ai_node_id: string
          created_at?: string | null
          generation_time_ms?: number | null
          id?: string
          image_url: string
          prompt: string
          user_id?: string | null
        }
        Update: {
          ai_node_id?: string
          created_at?: string | null
          generation_time_ms?: number | null
          id?: string
          image_url?: string
          prompt?: string
          user_id?: string | null
        }
        Relationships: []
      }
      optimized_prompts: {
        Row: {
          ai_node_type: string
          avg_success_score: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          prompt_content: string
          prompt_version: number | null
          usage_count: number | null
        }
        Insert: {
          ai_node_type: string
          avg_success_score?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          prompt_content: string
          prompt_version?: number | null
          usage_count?: number | null
        }
        Update: {
          ai_node_type?: string
          avg_success_score?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          prompt_content?: string
          prompt_version?: number | null
          usage_count?: number | null
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          ai_node_type: string
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_content: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          ai_node_type: string
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_content: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          ai_node_type?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_content?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      user_exports: {
        Row: {
          content: Json
          created_at: string | null
          export_format: string
          export_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          export_format: string
          export_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          export_format?: string
          export_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      voice_recordings: {
        Row: {
          ai_node_id: string | null
          audio_url: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          transcription: string | null
          user_id: string | null
        }
        Insert: {
          ai_node_id?: string | null
          audio_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          transcription?: string | null
          user_id?: string | null
        }
        Update: {
          ai_node_id?: string | null
          audio_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          transcription?: string | null
          user_id?: string | null
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
