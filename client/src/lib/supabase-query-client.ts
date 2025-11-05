import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "@database/supabase-client";

// Supabase-based query client
export const supabaseQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [table, ...filters] = queryKey as string[];
        
        // Handle different query patterns
        if (filters.length === 0) {
          // Simple table query
          const { data, error } = await supabase
            .from(table)
            .select('*');
          
          if (error) throw new Error(error.message);
          return data;
        } else if (filters[0] === 'by-farm') {
          // Query by farm ID
          const farmId = filters[1];
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('farm_id', farmId);
          
          if (error) throw new Error(error.message);
          return data;
        } else if (filters[0] === 'by-user') {
          // Query by user ID
          const userId = filters[1];
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', userId);
          
          if (error) throw new Error(error.message);
          return data;
        }
        
        return [];
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Helper functions for common Supabase operations
export async function getFromSupabase(table: string, filters?: Record<string, any>) {
  let query = supabase.from(table).select('*');
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function insertIntoSupabase(table: string, data: any) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return result;
}

export async function updateInSupabase(table: string, id: string, data: any) {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return result;
}

export async function deleteFromSupabase(table: string, id: string) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
  return true;
}