
-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('panjar', 'karung', 'admin');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create catatan_panjar table
CREATE TABLE public.catatan_panjar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nama TEXT NOT NULL,
  nominal DECIMAL(15,2) NOT NULL,
  status TEXT CHECK (status IN ('lunas', 'belum_lunas')) NOT NULL,
  tanggal DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kas_kecil table
CREATE TABLE public.kas_kecil (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tanggal DATE NOT NULL,
  keterangan TEXT NOT NULL,
  tipe TEXT CHECK (tipe IN ('masuk', 'keluar')) NOT NULL,
  nominal DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kas_besar table
CREATE TABLE public.kas_besar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tanggal DATE NOT NULL,
  keterangan TEXT NOT NULL,
  tipe TEXT CHECK (tipe IN ('masuk', 'keluar')) NOT NULL,
  nominal DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create data_karung table
CREATE TABLE public.data_karung (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tanggal DATE NOT NULL,
  nomor TEXT NOT NULL,
  nama TEXT NOT NULL,
  bruto DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  kadar_air DECIMAL(5,2) NOT NULL,
  netto DECIMAL(10,2) NOT NULL,
  harga DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catatan_panjar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas_kecil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas_besar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_karung ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for catatan_panjar
CREATE POLICY "Users can view their own catatan_panjar" ON public.catatan_panjar
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own catatan_panjar" ON public.catatan_panjar
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catatan_panjar" ON public.catatan_panjar
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catatan_panjar" ON public.catatan_panjar
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for kas_kecil
CREATE POLICY "Users can view their own kas_kecil" ON public.kas_kecil
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kas_kecil" ON public.kas_kecil
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kas_kecil" ON public.kas_kecil
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kas_kecil" ON public.kas_kecil
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for kas_besar
CREATE POLICY "Users can view their own kas_besar" ON public.kas_besar
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kas_besar" ON public.kas_besar
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kas_besar" ON public.kas_besar
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kas_besar" ON public.kas_besar
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for data_karung
CREATE POLICY "Users can view their own data_karung" ON public.data_karung
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data_karung" ON public.data_karung
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data_karung" ON public.data_karung
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data_karung" ON public.data_karung
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'panjar'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert demo users for testing
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'user1@demo.com',
    crypt('pass1', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"username": "user1", "name": "User Panjar", "role": "panjar"}'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'user2@demo.com',
    crypt('pass2', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"username": "user2", "name": "User Karung", "role": "karung"}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'user3@demo.com',
    crypt('pass3', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"username": "user3", "name": "Admin/Supervisor", "role": "admin"}'::jsonb
  );
