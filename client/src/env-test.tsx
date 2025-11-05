// Test component to check if environment variables are loaded
export function EnvTest() {
  console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "Present" : "Missing");
  
  return (
    <div style={{ padding: "20px", background: "#f0f0f0", margin: "20px" }}>
      <h3>Environment Variables Test:</h3>
      <p>SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? "Present" : "Missing"}</p>
      <p>SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? "Present" : "Missing"}</p>
    </div>
  );
}