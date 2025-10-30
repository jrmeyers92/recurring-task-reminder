export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      task_scheduler_profiles: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          notify_via: Database["public"]["Enums"]["notify_method"] | null;
          phone: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id: string;
          notify_via?: Database["public"]["Enums"]["notify_method"] | null;
          phone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          notify_via?: Database["public"]["Enums"]["notify_method"] | null;
          phone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      task_scheduler_task_completions: {
        Row: {
          completed_at: string;
          created_at: string | null;
          id: string;
          notes: string | null;
          task_id: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          task_id: string;
          user_id: string;
        };
        Update: {
          completed_at?: string;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          task_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_scheduler_task_completions_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_overdue_tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_scheduler_task_completions_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_scheduler_task_completions_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_tasks_due_today";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_scheduler_task_completions_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_upcoming_tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_scheduler_task_completions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      task_scheduler_task_tags: {
        Row: {
          created_at: string | null;
          id: string;
          tag: string;
          task_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          tag: string;
          task_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          tag?: string;
          task_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_scheduler_task_tags_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_overdue_tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_scheduler_task_tags_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_scheduler_task_tags_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_tasks_due_today";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_scheduler_task_tags_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_upcoming_tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_scheduler_task_tags_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      task_scheduler_tasks: {
        Row: {
          active: boolean | null;
          category: Database["public"]["Enums"]["task_category"] | null;
          completion_token: string | null;
          created_at: string | null;
          day_of_month: number | null;
          description: string | null;
          frequency_type: Database["public"]["Enums"]["frequency_type"];
          frequency_value: number;
          id: string;
          last_completed_at: string | null;
          last_notified_at: string | null;
          next_due_date: string;
          notify_via: Database["public"]["Enums"]["notify_method"] | null;
          reminder_lead_time_days: number | null;
          snoozed_until: string | null;
          paused: boolean;
          start_date: string;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          active?: boolean | null;
          category?: Database["public"]["Enums"]["task_category"] | null;
          completion_token?: string | null;
          created_at?: string | null;
          day_of_month?: number | null;
          description?: string | null;
          frequency_type: Database["public"]["Enums"]["frequency_type"];
          frequency_value: number;
          id?: string;
          last_completed_at?: string | null;
          last_notified_at?: string | null;
          next_due_date: string;
          notify_via?: Database["public"]["Enums"]["notify_method"] | null;
          reminder_lead_time_days?: number | null;
          snoozed_until?: string | null;
          start_date: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          active?: boolean | null;
          category?: Database["public"]["Enums"]["task_category"] | null;
          completion_token?: string | null;
          created_at?: string | null;
          day_of_month?: number | null;
          description?: string | null;
          frequency_type?: Database["public"]["Enums"]["frequency_type"];
          frequency_value?: number;
          id?: string;
          last_completed_at?: string | null;
          last_notified_at?: string | null;
          next_due_date?: string;
          notify_via?: Database["public"]["Enums"]["notify_method"] | null;
          reminder_lead_time_days?: number | null;
          snoozed_until?: string | null;
          start_date?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_scheduler_tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      task_scheduler_overdue_tasks: {
        Row: {
          active: boolean | null;
          category: Database["public"]["Enums"]["task_category"] | null;
          completion_token: string | null;
          created_at: string | null;
          day_of_month: number | null;
          days_overdue: number | null;
          description: string | null;
          email: string | null;
          frequency_type: Database["public"]["Enums"]["frequency_type"] | null;
          frequency_value: number | null;
          id: string | null;
          last_completed_at: string | null;
          last_notified_at: string | null;
          next_due_date: string | null;
          notify_via: Database["public"]["Enums"]["notify_method"] | null;
          phone: string | null;
          reminder_lead_time_days: number | null;
          snoozed_until: string | null;
          start_date: string | null;
          title: string | null;
          updated_at: string | null;
          user_id: string | null;
          user_notify_via: Database["public"]["Enums"]["notify_method"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "task_scheduler_tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      task_scheduler_tasks_due_today: {
        Row: {
          active: boolean | null;
          category: Database["public"]["Enums"]["task_category"] | null;
          completion_token: string | null;
          created_at: string | null;
          day_of_month: number | null;
          description: string | null;
          email: string | null;
          frequency_type: Database["public"]["Enums"]["frequency_type"] | null;
          frequency_value: number | null;
          id: string | null;
          last_completed_at: string | null;
          last_notified_at: string | null;
          next_due_date: string | null;
          notify_via: Database["public"]["Enums"]["notify_method"] | null;
          phone: string | null;
          reminder_lead_time_days: number | null;
          snoozed_until: string | null;
          start_date: string | null;
          title: string | null;
          updated_at: string | null;
          user_id: string | null;
          user_notify_via: Database["public"]["Enums"]["notify_method"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "task_scheduler_tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      task_scheduler_upcoming_tasks: {
        Row: {
          active: boolean | null;
          category: Database["public"]["Enums"]["task_category"] | null;
          completion_token: string | null;
          created_at: string | null;
          day_of_month: number | null;
          days_until_due: number | null;
          description: string | null;
          email: string | null;
          frequency_type: Database["public"]["Enums"]["frequency_type"] | null;
          frequency_value: number | null;
          id: string | null;
          last_completed_at: string | null;
          last_notified_at: string | null;
          next_due_date: string | null;
          notify_via: Database["public"]["Enums"]["notify_method"] | null;
          phone: string | null;
          reminder_lead_time_days: number | null;
          snoozed_until: string | null;
          start_date: string | null;
          title: string | null;
          updated_at: string | null;
          user_id: string | null;
          user_notify_via: Database["public"]["Enums"]["notify_method"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "task_scheduler_tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "task_scheduler_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      get_clerk_user_id: { Args: never; Returns: string };

      task_scheduler_calculate_next_due_date: {
        Args: {
          p_day_of_month?: number;
          p_frequency_type: string;
          p_frequency_value: number;
          p_last_completed: string;
        };
        Returns: string;
      };
    };
    Enums: {
      frequency_type: "daily" | "weekly" | "monthly" | "yearly" | "custom";
      notify_method: "email" | "sms" | "both" | "none";
      task_category:
        | "home"
        | "vehicle"
        | "finance"
        | "health"
        | "pet"
        | "garden"
        | "appliance"
        | "insurance"
        | "subscription"
        | "maintenance"
        | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      frequency_type: ["daily", "weekly", "monthly", "yearly", "custom"],
      notify_method: ["email", "sms", "both", "none"],
      task_category: [
        "home",
        "vehicle",
        "finance",
        "health",
        "pet",
        "garden",
        "appliance",
        "insurance",
        "subscription",
        "maintenance",
        "other",
      ],
    },
  },
} as const;

export type Task = Database["public"]["Tables"]["task_scheduler_tasks"]["Row"];
export type Profile =
  Database["public"]["Tables"]["task_scheduler_profiles"]["Row"];
export type TaskCompletion =
  Database["public"]["Tables"]["task_scheduler_task_completions"]["Row"];

export type TaskInsert =
  Database["public"]["Tables"]["task_scheduler_tasks"]["Insert"];
export type ProfileInsert =
  Database["public"]["Tables"]["task_scheduler_profiles"]["Insert"];

export type TaskUpdate =
  Database["public"]["Tables"]["task_scheduler_tasks"]["Update"];

// Add these to your types file for convenience
export type TaskTag =
  Database["public"]["Tables"]["task_scheduler_task_tags"]["Row"];
export type TaskTagInsert =
  Database["public"]["Tables"]["task_scheduler_task_tags"]["Insert"];

// Enum types for type safety
export type NotifyMethod = Database["public"]["Enums"]["notify_method"];
export type FrequencyType = Database["public"]["Enums"]["frequency_type"];
export type TaskCategory = Database["public"]["Enums"]["task_category"];

// View types (for when you query the views)
export type UpcomingTask =
  Database["public"]["Views"]["task_scheduler_upcoming_tasks"]["Row"];
export type TaskDueToday =
  Database["public"]["Views"]["task_scheduler_tasks_due_today"]["Row"];
export type OverdueTask =
  Database["public"]["Views"]["task_scheduler_overdue_tasks"]["Row"];
