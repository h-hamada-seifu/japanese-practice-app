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
      user_streaks: {
        Row: UserStreaksRow;
        Insert: UserStreaksInsert;
        Update: UserStreaksUpdate;
      };
      teachers: {
        Row: TeachersRow;
        Insert: TeachersInsert;
        Update: TeachersUpdate;
      };
      classes: {
        Row: ClassesRow;
        Insert: ClassesInsert;
        Update: ClassesUpdate;
      };
      teacher_class_assignments: {
        Row: TeacherClassAssignmentsRow;
        Insert: TeacherClassAssignmentsInsert;
        Update: TeacherClassAssignmentsUpdate;
      };
      student_class_assignments: {
        Row: StudentClassAssignmentsRow;
        Insert: StudentClassAssignmentsInsert;
        Update: StudentClassAssignmentsUpdate;
      };
      teacher_notes: {
        Row: TeacherNotesRow;
        Insert: TeacherNotesInsert;
        Update: TeacherNotesUpdate;
      };
      teacher_alerts: {
        Row: TeacherAlertsRow;
        Insert: TeacherAlertsInsert;
        Update: TeacherAlertsUpdate;
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

// User Streaks table types
export interface UserStreaksRow {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_practice_date: string;
  total_practice_days: number;
  created_at: string;
  updated_at: string;
}

export interface UserStreaksInsert {
  user_id: string;
  current_streak?: number;
  longest_streak?: number;
  last_practice_date?: string;
  total_practice_days?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserStreaksUpdate {
  user_id?: string;
  current_streak?: number;
  longest_streak?: number;
  last_practice_date?: string;
  total_practice_days?: number;
  created_at?: string;
  updated_at?: string;
}

// Teachers table types
export interface TeachersRow {
  id: string;
  user_id: string;
  name: string;
  email: string;
  department: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeachersInsert {
  id?: string;
  user_id: string;
  name: string;
  email: string;
  department?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TeachersUpdate {
  id?: string;
  user_id?: string;
  name?: string;
  email?: string;
  department?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Classes table types
export interface ClassesRow {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  academic_year: string | null;
  semester: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassesInsert {
  id?: string;
  name: string;
  code?: string | null;
  description?: string | null;
  academic_year?: string | null;
  semester?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClassesUpdate {
  id?: string;
  name?: string;
  code?: string | null;
  description?: string | null;
  academic_year?: string | null;
  semester?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Teacher Class Assignments table types
export interface TeacherClassAssignmentsRow {
  id: string;
  teacher_id: string;
  class_id: string;
  role: string;
  assigned_at: string;
  assigned_by: string | null;
}

export interface TeacherClassAssignmentsInsert {
  id?: string;
  teacher_id: string;
  class_id: string;
  role?: string;
  assigned_at?: string;
  assigned_by?: string | null;
}

export interface TeacherClassAssignmentsUpdate {
  id?: string;
  teacher_id?: string;
  class_id?: string;
  role?: string;
  assigned_at?: string;
  assigned_by?: string | null;
}

// Student Class Assignments table types
export interface StudentClassAssignmentsRow {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_at: string;
  status: string;
}

export interface StudentClassAssignmentsInsert {
  id?: string;
  student_id: string;
  class_id: string;
  enrolled_at?: string;
  status?: string;
}

export interface StudentClassAssignmentsUpdate {
  id?: string;
  student_id?: string;
  class_id?: string;
  enrolled_at?: string;
  status?: string;
}

// Teacher Notes table types
export interface TeacherNotesRow {
  id: string;
  teacher_id: string;
  student_id: string;
  speech_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherNotesInsert {
  id?: string;
  teacher_id: string;
  student_id: string;
  speech_id: string;
  note: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherNotesUpdate {
  id?: string;
  teacher_id?: string;
  student_id?: string;
  speech_id?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

// Teacher Alerts table types
export interface TeacherAlertsRow {
  id: string;
  teacher_id: string;
  student_id: string;
  alert_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface TeacherAlertsInsert {
  id?: string;
  teacher_id: string;
  student_id: string;
  alert_type: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
}

export interface TeacherAlertsUpdate {
  id?: string;
  teacher_id?: string;
  student_id?: string;
  alert_type?: string;
  message?: string;
  is_read?: boolean;
  created_at?: string;
}
