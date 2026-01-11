# Funcionalidade de Exportação de Treinos

## 📋 Visão Geral

Sistema de exportação de dados prescritos da plataforma para formatos CSV e PDF, implementado inteiramente no frontend sem necessidade de alterações no backend.

## 🎯 Funcionalidades Implementadas

### ✅ Exportação CSV
- Formato tabular ideal para análise em planilhas
- Compatível com Excel, Google Sheets e LibreOffice
- Encoding UTF-8 com BOM para suporte a caracteres especiais
- Uma linha por exercício com todas as informações hierárquicas

### ✅ Exportação PDF
- Formato estruturado para impressão e compartilhamento
- Hierarquia visual: Semanas → Treinos → Blocos → Exercícios
- Tabelas formatadas com jspdf-autotable
- Quebra de página automática
- Cabeçalhos e metadados

### ✅ Interface do Usuário
- Botão "Exportar Treinos" no Dashboard
- Modal com checkboxes para seleção de formatos
- Feedback visual durante exportação
- Validação de dados antes da exportação
- Mensagens de erro claras

## 📦 Bibliotecas Utilizadas

```json
{
  "papaparse": "^5.4.1",          // Geração de CSV
  "jspdf": "^2.5.2",              // Geração de PDF
  "jspdf-autotable": "^3.8.3",   // Tabelas no PDF
  "@types/papaparse": "^5.3.15"  // Tipos TypeScript
}
```

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

1. **`src/services/exportService.ts`**
   - Lógica de conversão de dados
   - Geração de CSV com papaparse
   - Geração de PDF com jspdf
   - Formatação de protocolos de exercícios

2. **`src/components/export/ExportModal.tsx`**
   - Modal de seleção de formatos
   - Checkboxes para CSV e PDF
   - Validação e feedback
   - Estados de loading e erro

3. **`src/hooks/useExportData.ts`**
   - Hook para buscar dados completos
   - Carrega semanas, treinos, blocos e exercícios
   - Cache e atualização de dados

### Arquivos Modificados

1. **`src/pages/dashboard/Dashboard.tsx`**
   - Adicionado botão "Exportar Treinos"
   - Integração com ExportModal
   - Uso do hook useExportData

2. **`package.json`**
   - Novas dependências instaladas

## 🔧 Estrutura de Dados Exportados

### Hierarquia
```
Semanas
├── Nome da semana
├── Foco (ex: "Hipertrofia 65%")
├── Período (data início → data fim)
└── Treinos
    ├── Nome do treino
    ├── Dia/Data
    └── Blocos
        ├── Nome do bloco
        ├── Tipo (Mobilidade, Ativação, Treino Principal, etc)
        └── Exercícios
            ├── Nome do exercício
            ├── Protocolo (séries, reps, carga, descanso)
            └── Observações
```

### Exemplo de Protocolo Formatado
```
3× 10 reps @75% (descanso: 90s)
2× 30s (descanso: 1min)
4× 8-12 reps @RPE 8
```

## 📊 Formato CSV

### Estrutura
```csv
Semana,Foco,Período,Treino,Dia,Bloco,Exercício,Protocolo,Observações
Semana 1,Hipertrofia 65%,01/01/2024 → 07/01/2024,Treino A,02/01/2024,Mobilidade Articular,Rotação de ombros,2× 30s,Movimentos suaves
Semana 1,Hipertrofia 65%,01/01/2024 → 07/01/2024,Treino A,02/01/2024,Treino Principal,Agachamento Livre,3× 10 @75% (descanso: 90s),Foco na técnica
```

### Características
- Delimitador: vírgula (`,`)
- Aspas: automáticas para valores com vírgulas ou quebras de linha
- Encoding: UTF-8 com BOM
- Header: sempre incluído

## 📄 Formato PDF

### Estrutura Visual

```
Treinos Prescritos
Gerado em: 09/01/2026 14:30

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Semana 1
Foco: Hipertrofia 65%
Período: 01/01/2024 → 07/01/2024

  Treino A - 02/01/2024
  
    Mobilidade Articular
    ┌──────────────────────┬──────────────┬──────────────┐
    │ Exercício            │ Protocolo    │ Observações  │
    ├──────────────────────┼──────────────┼──────────────┤
    │ Rotação de ombros    │ 2× 30s      │ Movimentos   │
    │                      │              │ suaves       │
    └──────────────────────┴──────────────┴──────────────┘
    
    Treino Principal
    ┌──────────────────────┬──────────────┬──────────────┐
    │ Exercício            │ Protocolo    │ Observações  │
    ├──────────────────────┼──────────────┼──────────────┤
    │ Agachamento Livre    │ 3× 10 @75%   │ Foco na      │
    │                      │ (90s)        │ técnica      │
    └──────────────────────┴──────────────┴──────────────┘
```

### Características
- Formato: A4 (210x297mm)
- Margens: 14mm
- Quebra de página automática
- Tabelas com cores (header azul)
- Fontes: Helvetica
- Metadados: data de geração

## 🔐 Segurança e Privacidade

### O que É Exportado ✅
- Nome das semanas
- Foco e período
- Nome dos treinos e datas
- Blocos de treino
- Exercícios e protocolos
- Observações técnicas

### O que NÃO É Exportado ❌
- Dados pessoais de alunos
- Informações de contato
- Medidas corporais
- Dados de avaliação física
- Histórico de progresso individual
- Dados sensíveis de saúde

## 🚀 Como Usar

### Para o Usuário

1. **Acessar Dashboard**
   - Entre na plataforma
   - Navegue até o Dashboard

2. **Clicar em "Exportar Treinos"**
   - Botão localizado no topo direito do Dashboard

3. **Selecionar Formatos**
   - ☑️ CSV (Excel/Sheets)
   - ☑️ PDF
   - Pode selecionar ambos

4. **Exportar**
   - Clicar no botão "Exportar"
   - Downloads iniciam automaticamente
   - Arquivos salvos com nome: `treinos-prescritos-YYYY-MM-DD.(csv|pdf)`

### Exemplo de Nome de Arquivo
```
treinos-prescritos-2026-01-09.csv
treinos-prescritos-2026-01-09.pdf
```

## 💻 Para Desenvolvedores

### Usar o Serviço de Exportação

```typescript
import { exportToCSV, exportToPDF, exportBothFormats } from '@/services/exportService';
import type { TrainingWeek } from '@/types/database.types';

// Dados de exemplo
const weeks: TrainingWeek[] = [...];

// Exportar apenas CSV
exportToCSV(weeks);

// Exportar apenas PDF
exportToPDF(weeks);

// Exportar ambos
exportBothFormats(weeks);
```

### Usar o Hook de Dados

```typescript
import { useExportData } from '@/hooks/useExportData';

function MyComponent() {
  const { weeks, loading, error, refresh } = useExportData();
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return (
    <button onClick={() => exportToCSV(weeks)}>
      Exportar CSV
    </button>
  );
}
```

### Usar o Modal

```typescript
import ExportModal from '@/components/export/ExportModal';

function MyPage() {
  const [open, setOpen] = useState(false);
  const { weeks } = useExportData();
  
  return (
    <>
      <button onClick={() => setOpen(true)}>
        Exportar
      </button>
      
      <ExportModal
        open={open}
        onClose={() => setOpen(false)}
        weeks={weeks}
      />
    </>
  );
}
```

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

### Dispositivos
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (iOS 14+, Android 10+)
- ✅ Tablet

### PWA/Offline
- ✅ Funciona offline se os dados já estiverem carregados
- ✅ As bibliotecas são incluídas no bundle
- ⚠️ Primeira carga requer conexão para baixar dados

## 🧪 Testes

### Teste Manual

1. **Preparar Dados**
   ```typescript
   // Criar semanas de teste no sistema
   // Adicionar treinos com blocos e exercícios
   ```

2. **Testar CSV**
   - Exportar CSV
   - Abrir no Excel/Sheets
   - Verificar encoding UTF-8
   - Validar estrutura de dados

3. **Testar PDF**
   - Exportar PDF
   - Abrir em leitor de PDF
   - Verificar quebras de página
   - Validar formatação de tabelas

### Cenários de Teste

#### ✅ Cenário 1: Semana Completa
- Semana com 4-5 treinos
- Cada treino com 3-4 blocos
- Cada bloco com 4-6 exercícios
- **Esperado**: Exportação completa e formatada

#### ✅ Cenário 2: Semana Vazia
- Semana sem treinos
- **Esperado**: Linha/página com mensagem apropriada

#### ✅ Cenário 3: Treino Sem Exercícios
- Treino com blocos vazios
- **Esperado**: Exibir bloco com indicação de vazio

#### ✅ Cenário 4: Caracteres Especiais
- Nomes com acentos: "Rotação", "Flexão"
- Símbolos: @, ×, →
- **Esperado**: Renderização correta

#### ✅ Cenário 5: Múltiplas Semanas
- 10+ semanas
- 50+ treinos
- **Esperado**: PDF com quebras de página corretas

## 🐛 Troubleshooting

### Problema: CSV abre com caracteres estranhos
**Solução**: Arquivo está sendo aberto com encoding errado
- Excel: Use "Importar Dados" e selecione UTF-8
- Google Sheets: Upload direto funciona automaticamente

### Problema: PDF não gera quebra de página
**Solução**: Conteúdo muito longo em uma seção
- Sistema detecta automaticamente
- Se persistir, verificar yPosition no código

### Problema: Dados não aparecem no modal
**Solução**: Hook não carregou os dados
- Verificar se há semanas cadastradas
- Checar console para erros de API
- Validar permissões de acesso

### Problema: Download não inicia
**Solução**: Popup blocker ou permissões
- Permitir downloads no navegador
- Verificar extensões que bloqueiam downloads
- Tentar em janela anônima

## 📈 Melhorias Futuras

### Curto Prazo
- [ ] Filtro por período de datas
- [ ] Filtro por foco/objetivo
- [ ] Opção de incluir/excluir blocos específicos
- [ ] Preview antes de exportar

### Médio Prazo
- [ ] Exportação para Excel (.xlsx) nativo
- [ ] Gráficos de volume/intensidade no PDF
- [ ] Templates personalizáveis de PDF
- [ ] Compressão de arquivos grandes

### Longo Prazo
- [ ] Exportação para formato de impressão (booklet)
- [ ] QR code com link para versão online
- [ ] Integração com Google Drive/Dropbox
- [ ] Agendamento de exports automáticos

## 📝 Changelog

### v1.0.0 (2026-01-09)
- ✨ Implementação inicial
- ✨ Exportação CSV com papaparse
- ✨ Exportação PDF com jspdf + jspdf-autotable
- ✨ Modal de seleção de formatos
- ✨ Hook useExportData
- ✨ Integração com Dashboard
- 🔒 Exclusão de dados sensíveis
- 📱 Suporte PWA/offline

## 🤝 Contribuindo

Para adicionar novos formatos ou melhorias:

1. **Adicionar novo formato**
   - Implementar função em `exportService.ts`
   - Seguir padrão: `exportTo[FORMAT](weeks: TrainingWeek[]): void`
   - Adicionar checkbox no `ExportModal.tsx`

2. **Personalizar formatação**
   - Editar função `formatProtocol()` para protocolos
   - Ajustar estilos de PDF em `exportToPDF()`
   - Modificar colunas CSV em `convertToCSVRows()`

3. **Adicionar filtros**
   - Estender interface de `ExportModal`
   - Adicionar lógica de filtro em `exportService.ts`
   - Manter retrocompatibilidade

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: suporte@plataforma.com
- 💬 Chat: Disponível no Dashboard
- 📚 Docs: /docs/export

---

**Desenvolvido com ❤️ para a Plataforma de Treinos**
