-- Enable Row Level Security (RLS) on all 6 public tables to fix Supabase Linter Security Errors

ALTER TABLE public.cover_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appsumo_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appsumo_valid_codes ENABLE ROW LEVEL SECURITY;
