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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          nome: string
          slug: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          id: string
          ordem: number
          product_id: string
          titulo: string
        }
        Insert: {
          id?: string
          ordem?: number
          product_id: string
          titulo: string
        }
        Update: {
          id?: string
          ordem?: number
          product_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "course_modules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_content: {
        Row: {
          lesson_id: string
          product_id: string
          video_url: string | null
        }
        Insert: {
          lesson_id: string
          product_id: string
          video_url?: string | null
        }
        Update: {
          lesson_id?: string
          product_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_content_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_content_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "lesson_content_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_materials: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          nome: string
          product_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          nome: string
          product_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          nome?: string
          product_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "lesson_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          concluida_em: string
          lesson_id: string
          product_id: string
          user_id: string
        }
        Insert: {
          concluida_em?: string
          lesson_id: string
          product_id: string
          user_id: string
        }
        Update: {
          concluida_em?: string
          lesson_id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "lesson_progress_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          descricao: string | null
          id: string
          module_id: string
          ordem: number
          product_id: string
          titulo: string
        }
        Insert: {
          descricao?: string | null
          id?: string
          module_id: string
          ordem?: number
          product_id: string
          titulo: string
        }
        Update: {
          descricao?: string | null
          id?: string
          module_id?: string
          ordem?: number
          product_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "lessons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          comissao_centavos: number
          created_at: string
          id: string
          liquido_centavos: number | null
          metodo: Database["public"]["Enums"]["payment_method"] | null
          pago_em: string | null
          product_id: string
          provider_payment_id: string | null
          provider_session_id: string | null
          reembolsado_em: string | null
          reembolso_ate: string | null
          reembolso_solicitado_em: string | null
          seller_id: string
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          valor_centavos: number
        }
        Insert: {
          buyer_id: string
          comissao_centavos: number
          created_at?: string
          id?: string
          liquido_centavos?: number | null
          metodo?: Database["public"]["Enums"]["payment_method"] | null
          pago_em?: string | null
          product_id: string
          provider_payment_id?: string | null
          provider_session_id?: string | null
          reembolsado_em?: string | null
          reembolso_ate?: string | null
          reembolso_solicitado_em?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          valor_centavos: number
        }
        Update: {
          buyer_id?: string
          comissao_centavos?: number
          created_at?: string
          id?: string
          liquido_centavos?: number | null
          metodo?: Database["public"]["Enums"]["payment_method"] | null
          pago_em?: string | null
          product_id?: string
          provider_payment_id?: string | null
          provider_session_id?: string | null
          reembolsado_em?: string | null
          reembolso_ate?: string | null
          reembolso_solicitado_em?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          valor_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_files: {
        Row: {
          created_at: string
          id: string
          nome: string
          product_id: string
          storage_path: string
          tamanho_bytes: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          product_id: string
          storage_path: string
          tamanho_bytes?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          product_id?: string
          storage_path?: string
          tamanho_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_files_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_files_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          capa_url: string | null
          category_id: string | null
          created_at: string
          descricao: string
          destaque: boolean
          id: string
          preco_centavos: number
          publicado: boolean
          seller_id: string
          tipo: Database["public"]["Enums"]["product_type"]
          titulo: string
          updated_at: string
        }
        Insert: {
          capa_url?: string | null
          category_id?: string | null
          created_at?: string
          descricao?: string
          destaque?: boolean
          id?: string
          preco_centavos: number
          publicado?: boolean
          seller_id: string
          tipo: Database["public"]["Enums"]["product_type"]
          titulo: string
          updated_at?: string
        }
        Update: {
          capa_url?: string | null
          category_id?: string | null
          created_at?: string
          descricao?: string
          destaque?: boolean
          id?: string
          preco_centavos?: number
          publicado?: boolean
          seller_id?: string
          tipo?: Database["public"]["Enums"]["product_type"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area_atuacao: string | null
          avatar_url: string | null
          bio: string | null
          cidade: string | null
          created_at: string
          estado: string | null
          formacao: string | null
          id: string
          link_lattes: string | null
          link_linkedin: string | null
          link_site: string | null
          nome: string
          status_profissional:
            | Database["public"]["Enums"]["status_profissional"]
            | null
          updated_at: string
          username: string
          visivel_recrutadores: boolean
        }
        Insert: {
          area_atuacao?: string | null
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          formacao?: string | null
          id: string
          link_lattes?: string | null
          link_linkedin?: string | null
          link_site?: string | null
          nome?: string
          status_profissional?:
            | Database["public"]["Enums"]["status_profissional"]
            | null
          updated_at?: string
          username: string
          visivel_recrutadores?: boolean
        }
        Update: {
          area_atuacao?: string | null
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          formacao?: string | null
          id?: string
          link_lattes?: string | null
          link_linkedin?: string | null
          link_site?: string | null
          nome?: string
          status_profissional?:
            | Database["public"]["Enums"]["status_profissional"]
            | null
          updated_at?: string
          username?: string
          visivel_recrutadores?: boolean
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comentario: string | null
          created_at: string
          id: string
          nota: number
          product_id: string
          user_id: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          id?: string
          nota: number
          product_id: string
          user_id: string
        }
        Update: {
          comentario?: string | null
          created_at?: string
          id?: string
          nota?: number
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      product_stats: {
        Row: {
          nota_media: number | null
          product_id: string | null
          total_avaliacoes: number | null
          total_vendas: number | null
        }
        Insert: {
          nota_media?: never
          product_id?: string | null
          total_avaliacoes?: never
          total_vendas?: never
        }
        Update: {
          nota_media?: never
          product_id?: string | null
          total_avaliacoes?: never
          total_vendas?: never
        }
        Relationships: []
      }
    }
    Functions: {
      become_seller: { Args: never; Returns: undefined }
      has_access: {
        Args: { _product_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "membro" | "vendedor" | "admin"
      order_status: "pendente" | "pago" | "reembolsado" | "cancelado"
      payment_method: "pix" | "cartao"
      product_type:
        | "curso"
        | "pesquisa"
        | "ebook"
        | "material_didatico"
        | "mentoria"
      status_profissional:
        | "empregado"
        | "desempregado"
        | "buscando_emprego"
        | "freelancer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["membro", "vendedor", "admin"],
      order_status: ["pendente", "pago", "reembolsado", "cancelado"],
      payment_method: ["pix", "cartao"],
      product_type: [
        "curso",
        "pesquisa",
        "ebook",
        "material_didatico",
        "mentoria",
      ],
      status_profissional: [
        "empregado",
        "desempregado",
        "buscando_emprego",
        "freelancer",
      ],
    },
  },
} as const
