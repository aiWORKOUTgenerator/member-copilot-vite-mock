import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for your database (you can generate these from Supabase CLI)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          experience_level: string
          physical_activity: string
          preferred_duration: string
          time_commitment: string
          intensity_level: string
          workout_type: string
          preferred_activities: string[]
          available_equipment: string[]
          primary_goal: string
          goal_timeline: string
          age: string
          height: string
          weight: string
          gender: string
          has_cardiovascular_conditions: string
          injuries: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          experience_level?: string
          physical_activity?: string
          preferred_duration?: string
          time_commitment?: string
          intensity_level?: string
          workout_type?: string
          preferred_activities?: string[]
          available_equipment?: string[]
          primary_goal?: string
          goal_timeline?: string
          age?: string
          height?: string
          weight?: string
          gender?: string
          has_cardiovascular_conditions?: string
          injuries?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          experience_level?: string
          physical_activity?: string
          preferred_duration?: string
          time_commitment?: string
          intensity_level?: string
          workout_type?: string
          preferred_activities?: string[]
          available_equipment?: string[]
          primary_goal?: string
          goal_timeline?: string
          age?: string
          height?: string
          weight?: string
          gender?: string
          has_cardiovascular_conditions?: string
          injuries?: string[]
        }
      }
      workout_sessions: {
        Row: {
          id: string
          profile_id: string
          created_at: string
          workout_focus: string
          workout_intensity: string
          workout_type: string
          focus_areas: string[]
          current_soreness: string[]
          equipment: string[]
          energy_level: string
          sleep_quality: string
          stress_level: string
          include_exercises: string[]
          exclude_exercises: string[]
          duration: string
        }
        Insert: {
          id?: string
          profile_id: string
          created_at?: string
          workout_focus?: string
          workout_intensity?: string
          workout_type?: string
          focus_areas?: string[]
          current_soreness?: string[]
          equipment?: string[]
          energy_level?: string
          sleep_quality?: string
          stress_level?: string
          include_exercises?: string[]
          exclude_exercises?: string[]
          duration?: string
        }
        Update: {
          id?: string
          profile_id?: string
          created_at?: string
          workout_focus?: string
          workout_intensity?: string
          workout_type?: string
          focus_areas?: string[]
          current_soreness?: string[]
          equipment?: string[]
          energy_level?: string
          sleep_quality?: string
          stress_level?: string
          include_exercises?: string[]
          exclude_exercises?: string[]
          duration?: string
        }
      }
    }
  }
} 