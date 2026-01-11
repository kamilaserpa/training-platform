# 📄 Funcionalidade de Exportação PDF

## Visão Geral

Este documento descreve a implementação completa da funcionalidade de exportação de treinos e semanas em formato PDF, permitindo que professores compartilhem planilhas de treino profissionais com seus alunos.

## 🎯 Características

### Layout 1: Treino Individual (Detalhado)
- **Formato**: 1 treino por página
- **Conteúdo**:
  - Cabeçalho com logo, nome do app, data e professor
  - Nome do treino
  - Informações: data, semana, foco, padrão de movimento, intensidade
  - Observações gerais
  - Blocos de treino com tabelas de exercícios
  - Protocolo detalhado (séries, repetições, descanso)
  - Grupos musculares
  - Rodapé com paginação

### Layout 2: Semana Completa (Compacto)
- **Formato**: Múltiplos treinos por página (até 6)
- **Conteúdo**:
  - Cabeçalho com informações da semana
  - Tabela resumida: Dia | Exercícios | Blocos | Cond. Físico | Obs
  - Resumo estatístico (total de treinos, blocos, exercícios)
  - Auto-paginação quando necessário

## 📦 Estrutura de Arquivos

```
src/utils/pdf/
├── index.js                    # Módulo de exportação
├── pdfStyles.js                # Configuração de estilos
├── pdfUtils.js                 # Funções auxiliares
├── generateTreinoPDF.js        # Geração de treino individual
└── generateSemanaPDF.js        # Geração de semana completa
```

## 🔧 Dependências

- **jspdf**: Biblioteca principal para geração de PDF
- **jspdf-autotable**: Plugin para criação de tabelas

```bash
npm install jspdf jspdf-autotable
```

## 💻 Uso

### Exportar Treino Individual

```typescript
import { generateTreinoPDF } from '../../utils/pdf/generateTreinoPDF';
import { imageToBase64 } from '../../utils/pdf/pdfUtils';
import logoImage from '../../assets/images/logo-main.png';

// Em um componente React
const handleExportPDF = async (treino) => {
  try {
    const logoBase64 = await imageToBase64(logoImage);
    await generateTreinoPDF(treino, logoBase64);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF: ' + error.message);
  }
};
```

### Exportar Semana Completa

```typescript
import { generateSemanaPDF } from '../../utils/pdf/generateSemanaPDF';
import { trainingService } from '../../services/trainingService';

const handleExportWeekPDF = async (week) => {
  try {
    const treinos = await trainingService.getTrainingsByWeek(week.id);
    const logoBase64 = await imageToBase64(logoImage);
    await generateSemanaPDF(week, treinos, logoBase64);
  } catch (error) {
    console.error('Erro ao gerar PDF da semana:', error);
    alert('Erro ao gerar PDF: ' + error.message);
  }
};
```

## 🎨 Personalização de Estilos

### pdfStyles.js

```javascript
export const pdfConfig = {
  orientation: 'portrait',
  format: 'a4',
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    text: '#333333',
    textLight: '#666666',
  },
  fonts: {
    title: 16,
    subtitle: 14,
    heading: 12,
    body: 10,
    small: 9,
  },
};
```

Para alterar cores ou fontes, edite o arquivo `pdfStyles.js`.

## 📱 Interface do Usuário

### Página de Treinos

Cada card de treino possui um botão de exportação:

- **Ícone**: 📄 (PictureAsPdf)
- **Cor**: Secondary (magenta)
- **Ação**: Exporta o treino individual em PDF
- **Localização**: Entre os botões de Detalhes e Editar

### Página de Semanas

Cada linha da tabela possui um botão de exportação:

- **Ícone**: 📄 (PictureAsPdf)
- **Cor**: Secondary (magenta)
- **Ação**: Exporta todos os treinos da semana em PDF compacto
- **Localização**: Antes dos botões Editar e Excluir

## 🔄 Formato de Dados

### Estrutura do Treino

```typescript
interface Treino {
  id: string;
  name: string;
  scheduled_date: string;
  intensity_level?: number;
  description?: string;
  training_week?: {
    name: string;
    week_focus?: {
      name: string;
    };
  };
  movement_pattern?: {
    name: string;
  };
  training_blocks?: TrainingBlock[];
}
```

### Estrutura do Bloco

```typescript
interface TrainingBlock {
  name: string;
  exercise_prescriptions: {
    exercise?: {
      name: string;
      muscle_groups?: string[];
    };
    sets?: number;
    reps?: string;
    duration_seconds?: number;
    rest_seconds?: number;
  }[];
}
```

## ⚙️ Funções Auxiliares

### imageToBase64(url)
Converte uma imagem (logo) para base64 para inclusão no PDF.

```javascript
const logoBase64 = await imageToBase64(logoImage);
```

### formatDate(dateString)
Formata data no formato brasileiro.

```javascript
formatDate('2024-01-15') // "Segunda-feira, 15 de janeiro de 2024"
```

### formatProtocol(prescription)
Formata protocolo de exercício.

```javascript
formatProtocol({ sets: 3, reps: '10', rest_seconds: 90 }) // "3x10 ⏱90""
```

### checkPageBreak(doc, yPosition, requiredHeight)
Verifica se é necessário adicionar nova página.

```javascript
yPos = checkPageBreak(doc, yPos, 40);
```

## 🚀 Funcionalidades Avançadas

### Auto-paginação
- Detecta automaticamente quando o conteúdo ultrapassa o tamanho da página
- Adiciona quebras de página automaticamente
- Mantém formatação consistente entre páginas

### Responsividade
- Ajusta larguras de colunas automaticamente
- Trunca texto longo quando necessário
- Adapta tamanho de fonte para melhor legibilidade

### Offline (PWA)
- Funciona completamente offline
- Não depende de serviços externos
- Gera PDF diretamente no navegador

## 📤 Compartilhamento

### WhatsApp
PDFs podem ser compartilhados diretamente via WhatsApp:

1. Gere o PDF clicando no botão de exportação
2. O arquivo será baixado automaticamente
3. Use a função de compartilhar do sistema operacional
4. Selecione WhatsApp como destino

### Email
PDFs podem ser anexados em emails:

1. Gere o PDF
2. Abra seu cliente de email
3. Anexe o arquivo baixado

### Impressão
PDFs são otimizados para impressão:

- Formato A4 padrão
- Margens adequadas
- Fonte legível (mínimo 10pt)
- Cores imprimíveis

## 🐛 Troubleshooting

### PDF não é gerado
1. Verifique se as dependências estão instaladas: `npm install jspdf jspdf-autotable`
2. Verifique se o logo existe em `src/assets/images/logo-main.png`
3. Verifique o console do navegador para erros

### Logo não aparece no PDF
1. Verifique o caminho da imagem
2. Verifique se a imagem está acessível
3. Tente usar uma imagem diferente

### Formatação incorreta
1. Verifique os dados do treino/semana
2. Verifique se todos os campos obrigatórios estão preenchidos
3. Ajuste os estilos em `pdfStyles.js`

## 🔮 Melhorias Futuras

### Possíveis Melhorias
- [ ] Adicionar mais opções de personalização
- [ ] Permitir exportação de múltiplos treinos selecionados
- [ ] Adicionar gráficos e estatísticas
- [ ] Permitir customização de cores e logo
- [ ] Adicionar marca d'água
- [ ] Exportar para outros formatos (Excel, CSV)
- [ ] Adicionar QR code para acesso rápido
- [ ] Visualização prévia antes de exportar

## 📊 Estatísticas de Uso

Para monitorar o uso da funcionalidade de exportação, adicione logging:

```javascript
console.log('📄 PDF gerado:', {
  tipo: 'treino',
  treinoId: treino.id,
  timestamp: new Date().toISOString()
});
```

## 📝 Licença

Este módulo faz parte do Training Platform e segue a mesma licença do projeto principal.

## 👥 Contribuição

Para contribuir com melhorias:

1. Crie um branch para sua feature
2. Faça suas alterações
3. Teste a geração de PDF
4. Submeta um pull request

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Consulte este documento
2. Verifique o console do navegador
3. Entre em contato com a equipe de desenvolvimento
