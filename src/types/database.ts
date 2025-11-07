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
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsersInsert {
  id?: string;
  email: string;
  name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UsersUpdate {
  id?: string;
  email?: string;
  name?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Topics table types
export interface TopicsRow {
  id: string;
  title: string;
  description: string | null;
  difficulty_level: number;
  created_at: string;
  updated_at: string;
}

export interface TopicsInsert {
  id?: string;
  title: string;
  description?: string | null;
  difficulty_level?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TopicsUpdate {
  id?: string;
  title?: string;
  description?: string | null;
  difficulty_level?: number;
  created_at?: string;
  updated_at?: string;
}

// Speeches table types
export interface SpeechesRow {
  id: string;
  user_id: string;
  topic_id: string;
  audio_url: string;
  transcription: string | null;
  ai_feedback: Json | null;
  score: number | null;
  duration_seconds: number;
  created_at: string;
}

export interface SpeechesInsert {
  id?: string;
  user_id: string;
  topic_id: string;
  audio_url: string;
  transcription?: string | null;
  ai_feedback?: Json | null;
  score?: number | null;
  duration_seconds: number;
  created_at?: string;
}

export interface SpeechesUpdate {
  id?: string;
  user_id?: string;
  topic_id?: string;
  audio_url?: string;
  transcription?: string | null;
  ai_feedback?: Json | null;
  score?: number | null;
  duration_seconds?: number;
  created_at?: string;
}
