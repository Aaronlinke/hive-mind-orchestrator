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
      achievements: {
        Row: {
          achievement_type: string
          description: string | null
          icon: string | null
          id: string
          progress: number | null
          target: number | null
          title: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_type: string
          description?: string | null
          icon?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          title: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_type?: string
          description?: string | null
          icon?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          title?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_collaborations: {
        Row: {
          agent_a: string
          agent_b: string
          collaboration_type: string
          created_at: string | null
          id: string
          interaction_count: number | null
          last_collaboration: string | null
          success_rate: number | null
          synergy_score: number | null
        }
        Insert: {
          agent_a: string
          agent_b: string
          collaboration_type: string
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          last_collaboration?: string | null
          success_rate?: number | null
          synergy_score?: number | null
        }
        Update: {
          agent_a?: string
          agent_b?: string
          collaboration_type?: string
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          last_collaboration?: string | null
          success_rate?: number | null
          synergy_score?: number | null
        }
        Relationships: []
      }
      agent_dna: {
        Row: {
          agent_name: string
          agent_type: string
          birth_timestamp: string | null
          capabilities: string[] | null
          fitness_score: number | null
          generation: number
          genetic_traits: Json
          id: string
          is_active: boolean | null
          last_mutation: string | null
          mutation_history: Json[] | null
          parent_agents: string[] | null
          specialization: string | null
        }
        Insert: {
          agent_name: string
          agent_type: string
          birth_timestamp?: string | null
          capabilities?: string[] | null
          fitness_score?: number | null
          generation?: number
          genetic_traits: Json
          id?: string
          is_active?: boolean | null
          last_mutation?: string | null
          mutation_history?: Json[] | null
          parent_agents?: string[] | null
          specialization?: string | null
        }
        Update: {
          agent_name?: string
          agent_type?: string
          birth_timestamp?: string | null
          capabilities?: string[] | null
          fitness_score?: number | null
          generation?: number
          genetic_traits?: Json
          id?: string
          is_active?: boolean | null
          last_mutation?: string | null
          mutation_history?: Json[] | null
          parent_agents?: string[] | null
          specialization?: string | null
        }
        Relationships: []
      }
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
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blockchain_checkpoints: {
        Row: {
          block_number: number | null
          checkpoint_data: Json
          contract_address: string | null
          created_at: string | null
          generation_number: number
          id: string
          ipfs_hash: string | null
          transaction_hash: string | null
          verified: boolean | null
        }
        Insert: {
          block_number?: number | null
          checkpoint_data: Json
          contract_address?: string | null
          created_at?: string | null
          generation_number: number
          id?: string
          ipfs_hash?: string | null
          transaction_hash?: string | null
          verified?: boolean | null
        }
        Update: {
          block_number?: number | null
          checkpoint_data?: Json
          contract_address?: string | null
          created_at?: string | null
          generation_number?: number
          id?: string
          ipfs_hash?: string | null
          transaction_hash?: string | null
          verified?: boolean | null
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
      conversation_context: {
        Row: {
          ai_node_id: string
          context_data: Json
          created_at: string | null
          id: string
          last_interaction: string | null
          message_count: number | null
          user_id: string
        }
        Insert: {
          ai_node_id: string
          context_data: Json
          created_at?: string | null
          id?: string
          last_interaction?: string | null
          message_count?: number | null
          user_id: string
        }
        Update: {
          ai_node_id?: string
          context_data?: Json
          created_at?: string | null
          id?: string
          last_interaction?: string | null
          message_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      emergent_capabilities: {
        Row: {
          capability_name: string
          contributing_agents: string[] | null
          discovered_at: string | null
          discovery_method: string | null
          effectiveness_score: number | null
          id: string
          implementation_code: string | null
          implementation_description: string | null
          last_used: string | null
          success_rate: number | null
          use_count: number | null
        }
        Insert: {
          capability_name: string
          contributing_agents?: string[] | null
          discovered_at?: string | null
          discovery_method?: string | null
          effectiveness_score?: number | null
          id?: string
          implementation_code?: string | null
          implementation_description?: string | null
          last_used?: string | null
          success_rate?: number | null
          use_count?: number | null
        }
        Update: {
          capability_name?: string
          contributing_agents?: string[] | null
          discovered_at?: string | null
          discovery_method?: string | null
          effectiveness_score?: number | null
          id?: string
          implementation_code?: string | null
          implementation_description?: string | null
          last_used?: string | null
          success_rate?: number | null
          use_count?: number | null
        }
        Relationships: []
      }
      emergent_patterns: {
        Row: {
          confidence_score: number | null
          contributing_agents: string[] | null
          discovered_at: string | null
          id: string
          last_seen: string | null
          occurrence_count: number | null
          pattern_data: Json
          pattern_name: string
          pattern_signature: string
        }
        Insert: {
          confidence_score?: number | null
          contributing_agents?: string[] | null
          discovered_at?: string | null
          id?: string
          last_seen?: string | null
          occurrence_count?: number | null
          pattern_data: Json
          pattern_name: string
          pattern_signature: string
        }
        Update: {
          confidence_score?: number | null
          contributing_agents?: string[] | null
          discovered_at?: string | null
          id?: string
          last_seen?: string | null
          occurrence_count?: number | null
          pattern_data?: Json
          pattern_name?: string
          pattern_signature?: string
        }
        Relationships: []
      }
      evolution_experiments: {
        Row: {
          completed_at: string | null
          conclusion: string | null
          experiment_number: number
          hypothesis: string
          id: string
          methodology: string | null
          recommendation: string | null
          results: Json | null
          started_at: string | null
          status: string | null
          success_count: number | null
          test_runs: number | null
        }
        Insert: {
          completed_at?: string | null
          conclusion?: string | null
          experiment_number: number
          hypothesis: string
          id?: string
          methodology?: string | null
          recommendation?: string | null
          results?: Json | null
          started_at?: string | null
          status?: string | null
          success_count?: number | null
          test_runs?: number | null
        }
        Update: {
          completed_at?: string | null
          conclusion?: string | null
          experiment_number?: number
          hypothesis?: string
          id?: string
          methodology?: string | null
          recommendation?: string | null
          results?: Json | null
          started_at?: string | null
          status?: string | null
          success_count?: number | null
          test_runs?: number | null
        }
        Relationships: []
      }
      evolution_feed: {
        Row: {
          downvotes: number | null
          event_data: Json
          event_type: string
          generation: number
          id: string
          timestamp: string | null
          upvotes: number | null
          visibility: string | null
        }
        Insert: {
          downvotes?: number | null
          event_data: Json
          event_type: string
          generation: number
          id?: string
          timestamp?: string | null
          upvotes?: number | null
          visibility?: string | null
        }
        Update: {
          downvotes?: number | null
          event_data?: Json
          event_type?: string
          generation?: number
          id?: string
          timestamp?: string | null
          upvotes?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      evolution_goals: {
        Row: {
          achieved_at: string | null
          contributing_agents: string[] | null
          created_at: string | null
          current_progress: number | null
          estimated_generations_to_achieve: number | null
          goal_description: string
          goal_type: string | null
          id: string
          notes: string | null
          priority: number | null
          status: string | null
          target_metrics: Json | null
        }
        Insert: {
          achieved_at?: string | null
          contributing_agents?: string[] | null
          created_at?: string | null
          current_progress?: number | null
          estimated_generations_to_achieve?: number | null
          goal_description: string
          goal_type?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          status?: string | null
          target_metrics?: Json | null
        }
        Update: {
          achieved_at?: string | null
          contributing_agents?: string[] | null
          created_at?: string | null
          current_progress?: number | null
          estimated_generations_to_achieve?: number | null
          goal_description?: string
          goal_type?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          status?: string | null
          target_metrics?: Json | null
        }
        Relationships: []
      }
      evolution_history: {
        Row: {
          blockchain_hash: string | null
          created_at: string | null
          description: string | null
          fitness_score: number | null
          generation_number: number
          genetic_code: Json
          id: string
          mutation_type: string
          parent_generation: number | null
          performance_metrics: Json | null
        }
        Insert: {
          blockchain_hash?: string | null
          created_at?: string | null
          description?: string | null
          fitness_score?: number | null
          generation_number: number
          genetic_code: Json
          id?: string
          mutation_type: string
          parent_generation?: number | null
          performance_metrics?: Json | null
        }
        Update: {
          blockchain_hash?: string | null
          created_at?: string | null
          description?: string | null
          fitness_score?: number | null
          generation_number?: number
          genetic_code?: Json
          id?: string
          mutation_type?: string
          parent_generation?: number | null
          performance_metrics?: Json | null
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
      nft_milestones: {
        Row: {
          created_at: string | null
          generation: number
          id: string
          image_url: string | null
          milestone_type: string
          minted_at: string | null
          nft_metadata: Json
          opensea_url: string | null
          owner_address: string | null
          token_id: string | null
        }
        Insert: {
          created_at?: string | null
          generation: number
          id?: string
          image_url?: string | null
          milestone_type: string
          minted_at?: string | null
          nft_metadata: Json
          opensea_url?: string | null
          owner_address?: string | null
          token_id?: string | null
        }
        Update: {
          created_at?: string | null
          generation?: number
          id?: string
          image_url?: string | null
          milestone_type?: string
          minted_at?: string | null
          nft_metadata?: Json
          opensea_url?: string | null
          owner_address?: string | null
          token_id?: string | null
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
      system_consciousness: {
        Row: {
          aspired_capabilities: string[] | null
          confidence_level: number | null
          current_generation: number
          id: string
          known_limitations: string[] | null
          known_strengths: string[] | null
          learning_insights: string[] | null
          mood: string | null
          reflection_text: string | null
          self_assessment: Json
          timestamp: string | null
        }
        Insert: {
          aspired_capabilities?: string[] | null
          confidence_level?: number | null
          current_generation: number
          id?: string
          known_limitations?: string[] | null
          known_strengths?: string[] | null
          learning_insights?: string[] | null
          mood?: string | null
          reflection_text?: string | null
          self_assessment: Json
          timestamp?: string | null
        }
        Update: {
          aspired_capabilities?: string[] | null
          confidence_level?: number | null
          current_generation?: number
          id?: string
          known_limitations?: string[] | null
          known_strengths?: string[] | null
          learning_insights?: string[] | null
          mood?: string | null
          reflection_text?: string | null
          self_assessment?: Json
          timestamp?: string | null
        }
        Relationships: []
      }
      temporal_snapshots: {
        Row: {
          agent_states: Json
          consciousness_state: Json | null
          created_by: string | null
          generation: number
          id: string
          snapshot_time: string
          system_state: Json
        }
        Insert: {
          agent_states: Json
          consciousness_state?: Json | null
          created_by?: string | null
          generation: number
          id?: string
          snapshot_time?: string
          system_state: Json
        }
        Update: {
          agent_states?: Json
          consciousness_state?: Json | null
          created_by?: string | null
          generation?: number
          id?: string
          snapshot_time?: string
          system_state?: Json
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
      user_preferences: {
        Row: {
          created_at: string | null
          custom_shortcuts: Json | null
          dashboard_widgets: Json | null
          favorite_ais: string[] | null
          id: string
          layout_preset: string | null
          theme: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_shortcuts?: Json | null
          dashboard_widgets?: Json | null
          favorite_ais?: string[] | null
          id?: string
          layout_preset?: string | null
          theme?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_shortcuts?: Json | null
          dashboard_widgets?: Json | null
          favorite_ais?: string[] | null
          id?: string
          layout_preset?: string | null
          theme?: Json | null
          updated_at?: string | null
          user_id?: string
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
      workflows: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          steps: Json
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          steps: Json
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          steps?: Json
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
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
