const SUPABASE_URL = "https://mjntxjktydljmnbbwhem.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbnR4amt0eWRsam1uYmJ3aGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTY5MjQsImV4cCI6MjA4ODc5MjkyNH0.pKwLqXXr5PxlFAWhkj_VrlxjzKWXSHx395DfxiShQio";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);