import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Profile operations
export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProfile = async (profileData: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId || 'default-user', // You'll want to implement proper auth
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      setProfile(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, saveProfile, loadProfile };
};

// Workout sessions operations
export const useWorkoutSessions = (userId?: string) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveWorkoutSession = async (sessionData: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          profile_id: userId || 'default-user',
          ...sessionData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setSessions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadWorkoutSessions = async (profileId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sessions, loading, error, saveWorkoutSession, loadWorkoutSessions };
};

// Connection test hook
export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (error) throw error;
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setIsConnected(false);
        setError(err instanceof Error ? err.message : 'Connection failed');
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return { isConnected, loading, error };
}; 