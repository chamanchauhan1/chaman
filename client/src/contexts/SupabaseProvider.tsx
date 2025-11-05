import { createContext, useContext, useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@database/supabase-client";

type SupabaseContextType = {
  supabase: SupabaseClient | null;
};

const SupabaseContext = createContext<SupabaseContextType>({ supabase: null });

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    setSupabaseClient(supabase);
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase: supabaseClient }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};