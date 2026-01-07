-- Fix block_type enum for training platform
-- Run this in your Supabase SQL editor

-- Drop existing enum if it exists (this might fail if there are references)
-- DROP TYPE IF EXISTS public.block_type CASCADE;

-- Create or replace the block_type enum with correct values
DO $$ 
BEGIN
    -- Try to create the enum type
    BEGIN
        CREATE TYPE public.block_type AS ENUM (
            'MOBILIDADE_ARTICULAR',
            'ATIVACAO_CORE', 
            'ATIVACAO_NEURAL',
            'TREINO_PRINCIPAL',
            'CONDICIONAMENTO_FISICO'
        );
    EXCEPTION
        WHEN duplicate_object THEN
            -- If enum exists, we need to add missing values
            -- Check if each value exists and add if missing
            BEGIN
                ALTER TYPE public.block_type ADD VALUE IF NOT EXISTS 'MOBILIDADE_ARTICULAR';
            EXCEPTION WHEN OTHERS THEN NULL;
            END;
            
            BEGIN
                ALTER TYPE public.block_type ADD VALUE IF NOT EXISTS 'ATIVACAO_CORE';
            EXCEPTION WHEN OTHERS THEN NULL;
            END;
            
            BEGIN
                ALTER TYPE public.block_type ADD VALUE IF NOT EXISTS 'ATIVACAO_NEURAL';
            EXCEPTION WHEN OTHERS THEN NULL;
            END;
            
            BEGIN
                ALTER TYPE public.block_type ADD VALUE IF NOT EXISTS 'TREINO_PRINCIPAL';
            EXCEPTION WHEN OTHERS THEN NULL;
            END;
            
            BEGIN
                ALTER TYPE public.block_type ADD VALUE IF NOT EXISTS 'CONDICIONAMENTO_FISICO';
            EXCEPTION WHEN OTHERS THEN NULL;
            END;
    END;
END $$;

-- Verify the enum values exist
SELECT enumlabel as available_values 
FROM pg_enum 
WHERE enumtypid = 'public.block_type'::regtype 
ORDER BY enumsortorder;