export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UsersRow;
        Insert: UsersInsert;
        Update: UsersUpdate;
      };
      topics: {
        Row: TopicsRow;
        Insert: TopicsInsert;
        Update: TopicsUpdate;
      };
      speeches: {
        Row: SpeechesRow;
        Insert: SpeechesInsert;
        Update: SpeechesUpdate;
      };
    };
  };
}

// Users table types
export interface UsersRow {
  id: string;
  email: string;
  display_name: string | null;
  jlpt_level: 'N3' | 'N2' | null;
  created_at: string;
  updated_at: string;
}

export interface UsersInsert {
  id?: string;
  email: string;
  display_name?: string | null;
  jlpt_level?: 'N3' | 'N2' | null;
  created_at?: string;
  updated_at?: string;
}

export interface UsersUpdate {
  id?: string;
  email?: string;
  display_name?: string | null;
  jlpt_level?: 'N3' | 'N2' | null;
  created_at?: string;
  updated_at?: string;
}

// Topics table types
export interface TopicsRow {
  id: string;
  category: string;
  title: string;
  description: string | null;
  hints: string[] | null;
  target_level: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface TopicsInsert {
  id?: string;
  category: string;
  title: string;
  description?: string | null;
  hints?: string[] | null;
  target_level?: string;
  display_order: number;
  is_active?: boolean;
  created_at?: string;
}

export interface TopicsUpdate {
  id?: string;
  category?: string;
  title?: string;
  description?: string | null;
  hints?: string[] | null;
  target_level?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
}

// Speeches table types
export interface SpeechesRow {
  id: string;
  user_id: string;
  topic_id: string;
  topic_title: string;
  audio_url: string | null;
  transcription: string;
  feedback: Json;
  duration: number | null;
  created_at: string;
}

export interface SpeechesInsert {
  id?: string;
  user_id: string;
  topic_id: string;
  topic_title: string;
  audio_url?: string | null;
  transcription: string;
  feedback: Json;
  duration?: number | null;
  created_at?: string;
}

export interface SpeechesUpdate {
  id?: string;
  user_id?: string;
  topic_id?: string;
  topic_title?: string;
  audio_url?: string | null;
  transcription?: string;
  feedback?: Json;
  duration?: number | null;
  created_at?: string;
}
