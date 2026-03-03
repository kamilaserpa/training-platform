# Análise UI/UX — Landing Carol Cavalcante

Objetivo: conversão (leads via Instagram). Público: mulheres 30+, emagrecimento e adesão. Identidade visual (cores primárias) preservada; ajustes em hierarquia, espaçamento, tipografia e sensação premium.

---

## 1. Hierarquia visual

**Problema:** Títulos de seção usam `variant="h4"` ou `variant="h5"` com `fontWeight: 800` inline, sem escala clara. Subordinados (subtítulos, body) não criam contraste suficiente.

**Solução:**
- **Seções:** Título principal = `h4` (ou h3 em hero), subtítulo = `subtitle1` ou `body1` com `color="text.secondary"`. Evitar sobrescrever `fontWeight` em todo lugar; usar variantes do tema.
- **Hero:** Manter H1 como único nível 1 da página; subtexto em `h6`/`subtitle1` com opacidade; CTA como único elemento de ação acima da dobra.
- **Cards/benefícios:** Título do card = `h6`, corpo = `body2`; ícone com área fixa (ex.: 48px) para alinhamento.

**Motivo:** Escala tipográfica clara (1 → 2 → 3) reduz ruído e guia o olhar para CTA e benefícios, melhorando CRO e escaneabilidade.

---

## 2. Typography MUI

**Problema:** Uso misto de `variant` + override de `fontSize`/`fontWeight` no `sx` (ex.: Hero `fontSize: { xs: '1.9rem' }`), o que quebra a escala do design system e dificulta manutenção.

**Solução:**
- Usar variantes do tema: `h1`–`h6`, `subtitle1`, `body1`, `body2`, `overline`, `caption`.
- Responsividade no **theme**: em `typography.ts`, definir `h1.mediaQuery` ou usar `theme.typography.h1` com breakpoints no tema (MUI v5+ suporta responsive font sizes no theme).
- Se precisar de ajuste pontual, usar `fontSize` em unidades do tema (ex.: `theme.typography.h4.fontSize`) ou um multiplicador, não valores soltos.
- **Overline** no Hero já está correto para “Personal online · Fortaleza”; manter e garantir `letterSpacing` e peso no tema.

**Motivo:** Consistência com o Material UI Design System e acessibilidade (escala relativa, zoom).

---

## 3. Espaçamento (margin, padding, Stack, Box, Grid)

**Problema:** Valores numéricos soltos (`py: 6`, `mb: 4`, `gap: 3`, `p: 3`) sem aderência a uma escala (ex.: múltiplos de 8px ou `theme.spacing`).

**Solução:**
- Padronizar com **theme.spacing**: `py: { xs: 8, md: 12 }` para seções (64px / 96px), `mb: 4` (32px) entre título e conteúdo, `gap: 2` ou `3` em Stacks/Grids.
- Usar **Stack** para blocos verticais (título + divisor + subtítulo + conteúdo) em vez de vários `Box` com `mb`, para consistência e menos código.
- **Grid** já está bem usado em Benefits e Authority; manter `spacing={4}` e garantir que em mobile o `spacing` não quebre (Grid do MUI já adapta).
- **Container:** `maxWidth="lg"` ou `"md"` conforme a seção; manter `px` via Container (gutters) e evitar `px: 2` duplicado onde o Container já dá padding.

**Motivo:** Ritmo visual uniforme (8pt grid) transmite ordem e “premium”; reduz decisões arbitrárias de layout.

---

## 4. Organização das seções

**Problema:** Estrutura de conteúdo está boa (Hero → Dor → Autoridade → Benefícios → Objeções → Depoimentos → CTA → Contato), mas há inconsistência: algumas seções com `borderTop`/`borderBottom`, outras com gradiente, outras só `bgcolor`.

**Solução:**
- **Alternância suave:** `background.paper` → `background.default` → `background.paper` para criar blocos visuais sem bordas pesadas.
- **Separadores:** Preferir “respiração” (espaçamento) a bordas; se usar borda, apenas `borderTop: 1, borderColor: 'divider'` em uma cor só.
- **Padrão de títulos:** Todas as seções com o mesmo padrão: título (h4/h5) → barra decorativa (primary) → subtítulo (body1 secondary). Extrair para um componente `<SectionHeader>` reutilizável.
- **IDs para navegação:** Garantir que `id="pain"`, `id="features"`, `id="benefits"`, etc. batam com os links do Navbar (AuthoritySection usa `id="features"` — conferir se é intencional; o menu diz “Quem é a Carol”).

**Motivo:** Ritmo e consistência aumentam confiança e reduzem fricção na leitura, importante para público feminino 30+ que valida credibilidade antes de converter.

---

## 5. Destaque do botão principal (CTA)

**Problema:** O CTA do Hero compete com o mesmo peso visual que outros elementos; na seção de CTA (gradiente) há dois botões (Instagram + formulário) com hierarquia similar.

**Solução:**
- **Hero:** Um único CTA principal (“Quero começar pelo Instagram”) com:
  - `size="large"`, `elevation` ou sombra do tema (ex.: `customShadows[1]` ou `boxShadow: 2`/`3`).
  - Contraste forte: botão primary com `primary.contrastText`; evitar outline no mesmo nível.
  - Área de toque generosa (minHeight 48px, padding horizontal generoso).
  - Opcional: microanimação (ex.: `transition: transform 0.2s` e `&:hover: { transform: 'translateY(-2px)' }`).
- **Seção CTA (gradiente):** Botão “Chamar no Instagram” como primário (filled, branco); “Preferir formulário” como secundário (outline). Aumentar ligeiramente o tamanho do primário e garantir que seja o primeiro na ordem de leitura.
- **Contact:** Manter “Abrir Instagram” em destaque; botão “Enviar” do form como secundário em relação ao CTA de Instagram.

**Motivo:** Um único caminho claro (“começar pelo Instagram”) aumenta conversão; psicologia de decisão (menos opções = mais ações).

---

## 6. Card, elevation e sombras

**Problema:** Uso misto de `Box` com `boxShadow: 1` ou `2` e `Paper` com `elevation={0}` e borda; customShadows do tema (com toque pink) não estão sendo usados de forma consistente.

**Solução:**
- **Cards de benefícios:** Usar `Card` do MUI (ou do tema) com `elevation={0}`, `sx={{ border: 1, borderColor: 'divider' }}` e no hover `boxShadow: theme.customShadows[0]` (ou equivalente). Assim o hover ganha profundidade suave e alinhada à marca.
- **Depoimentos:** Manter Card/Paper com borda leve; ícone de aspas em primary com opacidade; evitar sombra pesada para manter sensação acolhedora.
- **Authority (Minha história / Formação):** Dois “cards” lado a lado — usar o mesmo componente (Card ou Paper) com mesma elevação/sombra para paridade.
- **Paleta de sombras:** Usar `customShadows[0]` para cards em repouso ou hover; `customShadows[1]` para modais/destaques; não misturar com `boxShadow: 4` genérico do MUI para não fugir do rosa suave.

**Motivo:** Sombras suaves e consistentes (com toque pink) reforçam identidade e sensação premium sem parecer agressivo.

---

## 7. Primeira dobra (above the fold)

**Problema:** Em viewports médios, o CTA pode ficar abaixo da dobra; overline + H1 + parágrafo + botão + caption competem na mesma altura.

**Solução:**
- **Altura do Hero:** `minHeight: { xs: '75vh', md: '88vh' }` está bom; garantir que em `md` o conteúdo principal (título + subtexto + botão) caiba em ~70vh para que o CTA fique visível sem scroll.
- **Conteúdo:** Encurtar ligeiramente o parágrafo de apoio se necessário; ou reduzir `py` do container interno para “subir” o CTA.
- **Uma ação:** Acima da dobra, apenas um CTA (ex.: “Quero começar pelo Instagram”). “Login” no navbar é secundário (para quem já é aluna).
- **Imagem de fundo:** Gradiente escuro à esquerda já melhora legibilidade; garantir contraste WCAG do texto branco sobre a imagem (overlay suficiente).

**Motivo:** Primeira dobra com uma única oferta clara e um CTA visível aumenta taxa de clique e reduz bounce.

---

## 8. Sensação de marca premium, feminina e acolhedora

**Problema:** Base já está no caminho (primary pink, textos empáticos); falta reforçar “premium” e “acolhedor” por meio de detalhes.

**Solução:**
- **Cantos:** Manter `borderRadius: 2` (16px) em cards e botões; cantos arredondados transmitem suavidade.
- **Sombras:** Sombras rosa suaves (customShadows) em vez de cinza neutro.
- **Espaço em branco:** Aumentar um pouco o “respiro” entre seções (já sugerido no espaçamento) e dentro dos cards (padding generoso).
- **Linguagem visual:** Evitar bordas duras; preferir transições suaves (ex.: `transition: box-shadow 0.2s, border-color 0.2s`).
- **Tipografia:** DM Sans é boa escolha; evitar pesos muito altos (800) em todos os títulos — usar 700 no tema e 800 só no H1 ou em um título por seção.
- **Cores de fundo:** `background.default` (#fafafa) e `background.paper` (#fff) com alternância; evitar cinza frio; primary.soft em blocos de destaque (ex.: “Minha história”) mantém o calor da marca.

**Motivo:** Público feminino 30+ associa “premium” a clareza, espaço e suavidade; consistência nesses detalhes reforça confiança.

---

## 9. Responsividade mobile-first

**Problema:** Alguns valores são fixos (ex.: `maxWidth: 720` no Hero); Navbar e Hero já usam breakpoints, mas é possível reforçar mobile-first.

**Solução:**
- **Ordenar sx:** Escrever primeiro estilos para `xs`, depois `sm`, `md` (ex.: `py: 6` → `py: { md: 8 }`).
- **Hero:** `px: 2` no conteúdo; título com `fontSize: { xs: '1.75rem', sm: '2rem', md: '2.75rem' }` para não ficar pequeno no mobile.
- **Navbar:** Menu mobile com drawer ou lista fullWidth já está ok; garantir altura de toque ≥ 48px nos itens.
- **Grid de benefícios:** `xs={12} sm={6}` — em mobile um card por linha; espaçamento vertical entre cards suficiente (`spacing={4}`).
- **Contact:** Em mobile, empilhar mapa e formulário; manter formulário utilizável (inputs não muito pequenos).
- **Botões:** Largura total em mobile para CTAs principais (`fullWidth` em xs) pode ajudar; em telas maiores manter largura automática.

**Motivo:** Maioria do tráfego pode vir de mobile (Instagram); primeira dobra e CTA devem ser perfeitos no celular.

---

## 10. Escaneabilidade

**Problema:** Blocos longos de texto (ex.: Authority intro, Features) sem quebras ou listas; lista de dores com vários itens pode cansar.

**Solução:**
- **Listas:** Manter listas com ícone (check) e um parágrafo por linha; não aumentar demais o número de itens (5 dores está bom).
- **Parágrafos:** Limitar a 2–3 linhas por bloco quando possível; usar `lineHeight: 1.6`–`1.7` para corpo.
- **Títulos de seção:** Sempre visíveis ao scroll (tamanho e contraste suficientes); barra decorativa (primary) ajuda a “cortar” seções.
- **Cards de benefícios:** Título curto + texto em 2–3 linhas; ícone alinhado ao topo.
- **Depoimentos:** Citações curtas; autor em linha separada com peso menor.

**Motivo:** Usuárias escaneiam antes de ler; hierarquia clara e blocos curtos aumentam retenção e conversão.

---

## Sugestões técnicas pontuais

### ThemeProvider / theme
- **typography:** Adicionar variante responsiva para `h1` (ex.: `fontSize` com media queries ou uso de `pxToRem` e breakpoints) para a landing.
- **spacing:** Garantir que o tema use `8` como base (padrão MUI); não alterar.
- **customShadows:** Exportar e usar em Cards e botões (ex.: `theme.customShadows[0]` no hover de Card).
- **shape.borderRadius:** 8 está bom; manter 2 (16px) em override onde quiser mais suavidade (cards da landing).

### Componentes
- **SectionHeader:** Criar componente com título (variant), barra (Box 56x4 primary) e subtítulo opcional; usar em Pain, Authority, Benefits, Objections, Testimonials.
- **Hero:** Trocar `href` + `onClick` no CTA: usar apenas `component="a"` + `href` para Instagram; se quiser “Saiba mais” que rola até Contato, usar um segundo botão text/outline.
- **Navbar:** Links do menu devem usar os mesmos `id` das seções (pain, features, benefits, testimonials, contact-us); AuthoritySection está com `id="features"` — alinhar rótulo “Quem é a Carol” com esse id.

### Microinterações
- Botão CTA Hero: `transition: transform 0.2s ease, box-shadow 0.2s ease`; hover `transform: translateY(-2px)`.
- Cards de benefícios: `transition: box-shadow 0.2s, border-color 0.2s`; hover com sombra e borda primary.
- Links do navbar: `transition: color 0.2s` (já existe).

---

## Resumo de prioridades

1. **Alta:** CTA único e em destaque no Hero; correção de Section IDs vs Navbar; uso de theme.spacing e Stack; SectionHeader reutilizável.
2. **Média:** Uso de customShadows nos cards; tipografia responsiva no theme; alternância de background nas seções; microinteração no CTA.
3. **Baixa:** Componente SectionHeader extraído; refinamento de overline/caption no Hero.

Implementações sugeridas nos arquivos: `theme/typography.ts`, `Landing/index.tsx`, `Hero.tsx`, `Navbar.tsx`, `PainSection.tsx`, `AuthoritySection.tsx`, `BenefitsSection.tsx`, `ObjectionsSection.tsx`, `TestimonialsSection.tsx`, `CallToAction.tsx`, `Contact.tsx`, e opcionalmente um `SectionHeader.tsx`.
