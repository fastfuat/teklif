-- Create tables for gadget-trade app

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create models table
CREATE TABLE IF NOT EXISTS public.models (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    brand_id INTEGER NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create features table
CREATE TABLE IF NOT EXISTS public.features (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    model_id INTEGER NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    brand_id INTEGER NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    model_id INTEGER NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
    selected_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    contact_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS brands_category_id_idx ON public.brands(category_id);
CREATE INDEX IF NOT EXISTS models_brand_id_idx ON public.models(brand_id);
CREATE INDEX IF NOT EXISTS features_model_id_idx ON public.features(model_id);
CREATE INDEX IF NOT EXISTS quotes_category_id_idx ON public.quotes(category_id);
CREATE INDEX IF NOT EXISTS quotes_brand_id_idx ON public.quotes(brand_id);
CREATE INDEX IF NOT EXISTS quotes_model_id_idx ON public.quotes(model_id);

-- Create RLS policies for the tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Policy for categories - Anyone can read, only authenticated users can write
CREATE POLICY "Anyone can read categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert categories" ON public.categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories" ON public.categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories" ON public.categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy for brands - Anyone can read, only authenticated users can write
CREATE POLICY "Anyone can read brands" ON public.brands
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert brands" ON public.brands
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update brands" ON public.brands
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete brands" ON public.brands
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy for models - Anyone can read, only authenticated users can write
CREATE POLICY "Anyone can read models" ON public.models
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert models" ON public.models
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update models" ON public.models
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete models" ON public.models
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy for features - Anyone can read, only authenticated users can write
CREATE POLICY "Anyone can read features" ON public.features
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert features" ON public.features
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update features" ON public.features
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete features" ON public.features
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy for quotes - Anyone can create, only authenticated users can read/manage
CREATE POLICY "Anyone can create quotes" ON public.quotes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read quotes" ON public.quotes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update quotes" ON public.quotes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete quotes" ON public.quotes
    FOR DELETE USING (auth.role() = 'authenticated'); 