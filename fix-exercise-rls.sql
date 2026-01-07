-- Políticas RLS para exercícios - Sistema de Treinos
-- Execute no SQL Editor do Supabase

-- Política para leitura de exercícios - todos podem ver
CREATE POLICY "Anyone can read exercises" ON exercises
    FOR SELECT 
    USING (true);

-- Política para criação - usuários autenticados podem criar (será associado ao created_by)
CREATE POLICY "Authenticated users can create exercises" ON exercises
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND (created_by = auth.uid() OR created_by IS NULL)
    );

-- Política para atualização - apenas o criador pode editar seus exercícios
CREATE POLICY "Users can update own exercises" ON exercises
    FOR UPDATE 
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Política para exclusão - apenas o criador pode deletar seus exercícios  
CREATE POLICY "Users can delete own exercises" ON exercises
    FOR DELETE 
    USING (created_by = auth.uid());

-- Verificar se a coluna created_by existe e adicionar se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercises' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE exercises ADD COLUMN created_by UUID REFERENCES auth.users(id);
        
        -- Criar índice para performance
        CREATE INDEX idx_exercises_created_by ON exercises(created_by);
        
        -- Atualizar exercícios existentes para ter um created_by padrão (opcional)
        -- UPDATE exercises SET created_by = (SELECT id FROM auth.users LIMIT 1) WHERE created_by IS NULL;
    END IF;
END $$;

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'exercises';