# 🔧 Guia: Configurar Supabase Real

## ✅ Status Atual
- ✅ Sistema funcionando em **modo MOCK**
- ✅ Padrões de movimento salvam localmente
- ✅ Interface funcional completa

## 🚀 Para Usar Supabase Real

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e API key

### 2. Configurar Variáveis
Edite o arquivo `.env`:
```env
VITE_USE_MOCK=false
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 3. Criar Tabela
Execute no SQL Editor do Supabase:
```sql
CREATE TABLE movement_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dados iniciais
INSERT INTO movement_patterns (name, description) VALUES
  ('Agachar', 'Movimentos que envolvem flexão de joelho e quadril'),
  ('Empurrar Horizontal', 'Movimentos de empurrar no plano horizontal'),
  ('Puxar Vertical', 'Movimentos de puxar no plano vertical'),
  ('Empurrar Vertical', 'Movimentos de empurrar no plano vertical'),
  ('Puxar Horizontal', 'Movimentos de puxar no plano horizontal'),
  ('Dobrar (Dobradiça)', 'Movimentos de flexão de quadril'),
  ('Locomoção', 'Movimentos de deslocamento corporal'),
  ('Rotação', 'Movimentos que envolvem rotação do tronco'),
  ('Carregar', 'Movimentos de transporte de carga'),
  ('Anti-Movimento', 'Exercícios de estabilização');
```

### 4. Reiniciar App
```bash
npm run dev
```

## 💡 Benefícios do Modo Mock
- ✅ Funciona sem configuração
- ✅ Ideal para demonstrações
- ✅ Desenvolvimento rápido
- ✅ Zero dependências externas

## 🔄 Alternar Modos
- **Mock**: `VITE_USE_MOCK=true`
- **Real**: `VITE_USE_MOCK=false`