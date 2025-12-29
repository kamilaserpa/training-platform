// Página TreinoDetalhes com React Hook Form - UI do exemplo
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Paper,
} from '@mui/material'
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  FitnessCenter as FitnessCenterIcon,
} from '@mui/icons-material'
import {
  FormInput,
  FormSelect,
  FormDatePicker,
  FormCheckbox,
  FormRadio,
} from '../components/form'

// Schema de validação (Yup)
const validationSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório'),
  data: yup
    .date()
    .typeError('Data inválida')
    .required('Data é obrigatória'),
  semana: yup.string().required('Semana é obrigatória'),
  tipo_treino: yup.string().required('Tipo de treino é obrigatório'),
  padrao_movimento: yup.string().required('Padrão de movimento é obrigatório'),
  observacoes: yup.string(),
  link_ativo: yup.boolean(),
  tipo_bloco: yup.string().required('Tipo de bloco é obrigatório'),
})

function TreinoDetalhesForm() {
  const navigate = useNavigate()

  // Configuração do React Hook Form
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      nome: '',
      data: null,
      semana: '',
      tipo_treino: '',
      padrao_movimento: '',
      observacoes: '',
      link_ativo: false,
      tipo_bloco: '',
    },
  })

  const { handleSubmit, formState: { errors } } = methods

  // Dados mockados para os selects
  const semanasOptions = [
    { id: 'sem1', label: 'Semana 1 - Adaptação' },
    { id: 'sem2', label: 'Semana 2 - Desenvolvimento' },
    { id: 'sem3', label: 'Semana 3 - Intensificação' },
    { id: 'sem4', label: 'Semana 4 - Deload' },
  ]

  const tiposTreinoOptions = [
    { id: 'hiper65', label: 'Hipertrofia 65%' },
    { id: 'hiper75', label: 'Hipertrofia 75%' },
    { id: 'forca85', label: 'Força 85%' },
    { id: 'potencia90', label: 'Potência 90%' },
  ]

  const padroesMovimentoOptions = [
    { id: 'dobrar_puxar', label: 'DOBRAR E PUXAR H' },
    { id: 'empurrar', label: 'EMPURRAR H' },
    { id: 'agachar', label: 'AGACHAR' },
    { id: 'articular', label: 'ARTICULAR' },
  ]

  const tiposBlocoOptions = [
    { value: 'mobilidade', label: 'Mobilidade Articular' },
    { value: 'core', label: 'Ativação de Core' },
    { value: 'neural', label: 'Ativação Neural' },
    { value: 'treino', label: 'Treino Principal' },
    { value: 'condicionamento', label: 'Condicionamento Físico' },
  ]

  // Handler do submit
  const onSubmit = (data) => {
    console.log('📋 Dados do formulário:', data)
    alert('✅ Formulário válido! Veja o console para os dados.')
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/treinos')}
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FitnessCenterIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight="700">
            Detalhes do Treino - Formulário
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Formulário com React Hook Form + Yup + Material UI
        </Typography>
      </Box>

      {/* Botão Submit no topo (como no exemplo) */}
      <Button
        variant="contained"
        size="large"
        startIcon={<SaveIcon />}
        onClick={handleSubmit(onSubmit)}
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        SALVAR TREINO
      </Button>

      {/* Formulário */}
      <FormProvider {...methods}>
        <form>
          <Stack spacing={3}>
            {/* Card 1: Informações Básicas */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  📋 Informações Básicas
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormInput
                      name="nome"
                      label="Nome do Treino"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormInput
                      name="nomeValidacao"
                      label="Nome com Validação"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormSelect
                      name="semana"
                      label="Semana"
                      options={semanasOptions}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormSelect
                      name="tipo_treino"
                      label="Tipo de Treino (com validação)"
                      options={tiposTreinoOptions}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormDatePicker
                      name="data"
                      label="Data do Treino"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormDatePicker
                      name="dataValidacao"
                      label="Data com Validação"
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormInput
                      name="observacoes"
                      label="Observações"
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Card 2: Configurações do Bloco */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  🏋️ Configurações do Bloco
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormSelect
                      name="padrao_movimento"
                      label="Padrão de Movimento (com validação)"
                      options={padroesMovimentoOptions}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormRadio
                      name="tipo_bloco"
                      label="Tipo de Bloco"
                      options={tiposBlocoOptions}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormCheckbox
                      name="link_ativo"
                      label="Link de compartilhamento ativo"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Card 3: Resumo de Erros */}
            {Object.keys(errors).length > 0 && (
              <Paper sx={{ p: 3, bgcolor: 'error.lighter', borderLeft: 4, borderColor: 'error.main' }}>
                <Typography variant="h6" color="error" gutterBottom>
                  ⚠️ Erros de Validação
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {Object.entries(errors).map(([field, error]) => (
                    <Typography key={field} component="li" color="error" variant="body2">
                      <strong>{field}:</strong> {error.message}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            )}
          </Stack>

          {/* Botões de Ação */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Salvar Alterações
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/treinos')}
              size="large"
            >
              Cancelar
            </Button>
          </Stack>
        </form>
      </FormProvider>

      {/* Info sobre o formulário */}
      <Paper sx={{ mt: 4, p: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="h6" gutterBottom>
          ℹ️ Sobre este formulário
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>✅ React Hook Form para gerenciamento de estado</li>
            <li>✅ Yup para validação de schema</li>
            <li>✅ Material UI para componentes</li>
            <li>✅ Componentes reutilizáveis em <code>src/components/form/</code></li>
            <li>✅ Validação em tempo real</li>
            <li>✅ Mensagens de erro customizadas</li>
          </ul>
        </Typography>
      </Paper>
    </Container>
  )
}

export default TreinoDetalhesForm

