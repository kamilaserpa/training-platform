// Página TreinoDetalhes com React Hook Form - Versão Completa
import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, useLocation } from 'react-router-dom'
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
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
} from '@mui/material'

import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  FitnessCenter as FitnessCenterIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Timer as TimerIcon,
} from '@mui/icons-material'

import {
  FormInput,
  FormSelect,
  FormDatePicker,
  FormCheckbox,
} from '../../components/form'

// Schema de validação (Yup)
const validationSchema = yup.object().shape({
  data: yup.date().typeError('Data inválida').required('Data é obrigatória'),
  semana: yup.string().required('Semana é obrigatória'),
  padrao_movimento: yup.string().required('Padrão de movimento é obrigatório'),
  observacoes: yup.string(),
  observacoes_internas: yup.string(),
  link_ativo: yup.boolean(),
})

function TreinoDetalhesForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const shouldUseDefaultBlocks = searchParams.get('defaultBlocks') === 'true'

  // Função para criar blocos padrão do treino
  const createDefaultBlocks = () => {
    return {
      mobilidade: ['Ombro', 'Tronco', 'Quadril', 'Tornozelo'],
      core: [
        { nome: 'Prancha', series: 3, tempo: 30, intervalo: 10 },
        { nome: 'Respiração diafragmática', series: 3, tempo: 30, intervalo: 10 }
      ],
      neural: [
        { nome: 'Polichinelos', series: 3, tempo: 20 },
        { nome: 'Corrida estacionária', series: 3, tempo: 20 }
      ],
      bloco1: [],
      bloco2: [],
      condicionamento: []
    }
  }

  // Estados para cada seção do treino
  const [mobilidadeItems, setMobilidadeItems] = useState(() => 
    shouldUseDefaultBlocks ? createDefaultBlocks().mobilidade : []
  )
  const [coreItems, setCoreItems] = useState(() => 
    shouldUseDefaultBlocks ? createDefaultBlocks().core : []
  )
  const [neuralItems, setNeuralItems] = useState(() => 
    shouldUseDefaultBlocks ? createDefaultBlocks().neural : []
  )
  const [treinoBloco1, setTreinoBloco1] = useState(() => 
    shouldUseDefaultBlocks ? createDefaultBlocks().bloco1 : []
  )
  const [treinoBloco2, setTreinoBloco2] = useState(() => 
    shouldUseDefaultBlocks ? createDefaultBlocks().bloco2 : []
  )
  const [condicionamentoItems, setCondicionamentoItems] = useState(() => 
    shouldUseDefaultBlocks ? createDefaultBlocks().condicionamento : []
  )

  // Estados para dialogs
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})

  // Configuração do React Hook Form
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      data: null,
      semana: '',
      padrao_movimento: '',
      observacoes: '',
      observacoes_internas: '',
      link_ativo: false,
    },
  })

  const { handleSubmit, formState: { errors } } = methods

  // Dados mockados para os selects
  const semanasOptions = [
    { id: 'sem1', label: 'Semana 1 - Força 85%' },
    { id: 'sem2', label: 'Semana 2 - Hipertrofia 65%' },
    { id: 'sem3', label: 'Semana 3 - Hipertrofia 75%' },
    { id: 'sem4', label: 'Semana 4 - Potência 90%' },
  ]

  const padroesMovimentoOptions = [
    { id: 'agachar', label: 'Agachar' },
    { id: 'empurrar_horizontal', label: 'Empurrar Horizontal' },
    { id: 'empurrar_vertical', label: 'Empurrar Vertical' },
    { id: 'puxar_horizontal', label: 'Puxar Horizontal' },
    { id: 'puxar_vertical', label: 'Puxar Vertical' },
    { id: 'dobrar', label: 'Dobrar' },
    { id: 'rotacao', label: 'Rotação' },
    { id: 'locomocao', label: 'Locomoção' },
    { id: 'unilateral', label: 'Unilateral' },
    { id: 'isometrico', label: 'Isométrico' },
  ]

  const mobilidadeOptions = ['Ombro', 'Tronco', 'Quadril', 'Tornozelo', 'Joelho', 'Coluna', 'Punho']

  // Handlers para abrir dialogs
  const handleOpenDialog = (section, item = null) => {
    setCurrentSection(section)
    setEditingItem(item)

    // Preencher dados do item para edição
    if (item) {
      setFormData(item)
    } else {
      setFormData({})
    }

    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setCurrentSection('')
    setEditingItem(null)
    setFormData({})
  }

  // Função para aplicar blocos padrão
  const handleApplyDefaultBlocks = () => {
    const defaultBlocks = createDefaultBlocks()
    setMobilidadeItems(defaultBlocks.mobilidade)
    setCoreItems(defaultBlocks.core)
    setNeuralItems(defaultBlocks.neural)
    setTreinoBloco1(defaultBlocks.bloco1)
    setTreinoBloco2(defaultBlocks.bloco2)
    setCondicionamentoItems(defaultBlocks.condicionamento)
  }

  // Função para limpar todos os blocos
  const handleClearAllBlocks = () => {
    setMobilidadeItems([])
    setCoreItems([])
    setNeuralItems([])
    setTreinoBloco1([])
    setTreinoBloco2([])
    setCondicionamentoItems([])
  }

  // Handler para salvar item
  const handleSaveItem = () => {
    switch (currentSection) {
      case 'mobilidade':
        if (editingItem !== null) {
          const newItems = [...mobilidadeItems]
          newItems[editingItem] = formData.nome
          setMobilidadeItems(newItems)
        } else {
          setMobilidadeItems([...mobilidadeItems, formData.nome])
        }
        break

      case 'core':
        if (editingItem !== null) {
          const newItems = [...coreItems]
          newItems[editingItem] = formData
          setCoreItems(newItems)
        } else {
          setCoreItems([...coreItems, formData])
        }
        break

      case 'neural':
        if (editingItem !== null) {
          const newItems = [...neuralItems]
          newItems[editingItem] = formData
          setNeuralItems(newItems)
        } else {
          setNeuralItems([...neuralItems, formData])
        }
        break

      case 'treino1':
        if (editingItem !== null) {
          const newItems = [...treinoBloco1]
          newItems[editingItem] = formData
          setTreinoBloco1(newItems)
        } else {
          setTreinoBloco1([...treinoBloco1, formData])
        }
        break

      case 'treino2':
        if (editingItem !== null) {
          const newItems = [...treinoBloco2]
          newItems[editingItem] = formData
          setTreinoBloco2(newItems)
        } else {
          setTreinoBloco2([...treinoBloco2, formData])
        }
        break

      case 'condicionamento':
        if (editingItem !== null) {
          const newItems = [...condicionamentoItems]
          newItems[editingItem] = formData
          setCondicionamentoItems(newItems)
        } else {
          setCondicionamentoItems([...condicionamentoItems, formData])
        }
        break
    }

    handleCloseDialog()
  }

  // Handlers para remover itens
  const handleRemoveItem = (section, index) => {
    switch (section) {
      case 'mobilidade':
        setMobilidadeItems(mobilidadeItems.filter((_, i) => i !== index))
        break
      case 'core':
        setCoreItems(coreItems.filter((_, i) => i !== index))
        break
      case 'neural':
        setNeuralItems(neuralItems.filter((_, i) => i !== index))
        break
      case 'treino1':
        setTreinoBloco1(treinoBloco1.filter((_, i) => i !== index))
        break
      case 'treino2':
        setTreinoBloco2(treinoBloco2.filter((_, i) => i !== index))
        break
      case 'condicionamento':
        setCondicionamentoItems(condicionamentoItems.filter((_, i) => i !== index))
        break
    }
  }

  // Calcular tempo total do treino bloco 1
  const calcularTempoTotal = (items) => {
    const totalSegundos = items.reduce((acc, item) => acc + (item.tempo || 0), 0)
    const minutos = Math.floor(totalSegundos / 60)
    const segundos = totalSegundos % 60
    return `${minutos}min ${segundos}s`
  }

  // Handler do submit
  const onSubmit = (data) => {
    const treinoCompleto = {
      ...data,
      mobilidade: mobilidadeItems,
      core: coreItems,
      neural: neuralItems,
      treino_bloco1: treinoBloco1,
      treino_bloco2: treinoBloco2,
      condicionamento: condicionamentoItems,
    }
    console.log('📋 Dados do formulário completo:', treinoCompleto)
    alert('✅ Treino salvo! Veja o console para os dados completos.')
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="700" mb={1}>
            Criar Treino
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Preencha os campos abaixo para criar um treino completo.
          </Typography>
        </Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/treinos')}
          variant="outlined"
        >
          Voltar
        </Button>
      </Stack>

      {/* Formulário */}
      <FormProvider {...methods}>
        <form>
          <Stack direction="column" spacing={3}>
            {/* Card: Informações Básicas */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Informações Básicas
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {/* Primeira linha: 3 campos lado a lado (responsivo) */}
                  <Grid item xs={12} md={4}>
                    <FormSelect
                      name="padrao_movimento"
                      label="Padrão de Movimento"
                      options={padroesMovimentoOptions}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormSelect
                      name="semana"
                      label="Semana"
                      options={semanasOptions}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormDatePicker
                      name="data"
                      label="Data do Treino"
                      required
                    />
                  </Grid>

                  {/* Segunda linha: Observações ocupando toda largura */}
                  <Grid item xs={12}>
                    <FormInput
                      name="observacoes"
                      label="Observações Gerais (visíveis para o aluno)"
                      multiline
                      rows={2}
                    />
                  </Grid>

                  {/* Terceira linha: Checkbox ocupando toda largura */}
                  <Grid item xs={12}>
                    <FormCheckbox
                      name="link_ativo"
                      label="Link de compartilhamento ativo"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Card: Estrutura do Treino */}
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="600">
                    🏋️ Estrutura do Treino
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FitnessCenterIcon />}
                      onClick={handleApplyDefaultBlocks}
                      color="primary"
                    >
                      Aplicar Blocos Padrão
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleClearAllBlocks}
                      color="error"
                    >
                      Limpar Tudo
                    </Button>
                  </Stack>
                </Box>
                {shouldUseDefaultBlocks && (
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label="Blocos padrão aplicados automaticamente: Mobilidade Articular, Ativação de Core e Ativação Neural" 
                      color="primary" 
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                )}
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {/* Mobilidade Articular */}
                  <Grid item  md={6} lg={4} xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight="600">
                        Mobilidade Articular
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog('mobilidade')}
                      >
                        Adicionar
                      </Button>
                    </Box>
                    <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                      {mobilidadeItems.length === 0 ? (
                        <ListItem>
                          <ListItemText
                            primary="Nenhum item adicionado"
                            secondary="Clique em Adicionar para incluir"
                          />
                        </ListItem>
                      ) : (
                        mobilidadeItems.map((item, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleRemoveItem('mobilidade', index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            }
                          >
                            <ListItemText primary={item} />
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Grid>

                  {/* Ativação de Core */}
                  <Grid item md={6} lg={4} xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight="600">
                        Ativação de Core
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog('core')}
                      >
                        Adicionar
                      </Button>
                    </Box>
                    <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                      {coreItems.length === 0 ? (
                        <ListItem>
                          <ListItemText
                            primary="Nenhum exercício adicionado"
                            secondary="Clique em Adicionar para incluir"
                          />
                        </ListItem>
                      ) : (
                        coreItems.map((item, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleOpenDialog('core', index)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleRemoveItem('core', index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            }
                          >
                            <ListItemText
                              primary={item.nome}
                              secondary={`${item.series}x - ${item.tempo}s on / ${item.intervalo}s off`}
                            />
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Grid>

                  {/* Ativação Neural */}
                  <Grid item md={6} lg={4} xs={12}> 
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight="600">
                        Ativação Neural
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog('neural')}
                      >
                        Adicionar
                      </Button>
                    </Box>
                    <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                      {neuralItems.length === 0 ? (
                        <ListItem>
                          <ListItemText
                            primary="Nenhum exercício adicionado"
                            secondary="Clique em Adicionar para incluir"
                          />
                        </ListItem>
                      ) : (
                        neuralItems.map((item, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleOpenDialog('neural', index)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleRemoveItem('neural', index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            }
                          >
                            <ListItemText
                              primary={item.nome}
                              secondary={`${item.series}x - ${item.tempo}s`}
                            />
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Grid>

                  {/* Treino Bloco 01 */}
                  <Grid item md={6} lg={4} xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="600">
                          Treino Bloco 01
                        </Typography>
                        {treinoBloco1.length > 0 && (
                          <Chip
                            icon={<TimerIcon />}
                            label={`Tempo total: ${calcularTempoTotal(treinoBloco1)}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog('treino1')}
                      >
                        Adicionar
                      </Button>
                    </Box>
                    <List sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                      {treinoBloco1.length === 0 ? (
                        <ListItem>
                          <ListItemText
                            primary="Nenhum exercício adicionado"
                            secondary="Clique em Adicionar para incluir exercícios"
                          />
                        </ListItem>
                      ) : (
                        treinoBloco1.map((item, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleOpenDialog('treino1', index)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleRemoveItem('treino1', index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            }
                          >
                            <ListItemText
                              primary={`${index + 1}. ${item.nome}`}
                              secondary={`${item.series} séries × ${item.repeticoes} reps • ${item.carga} • ~${item.tempo}s/série`}
                            />
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Grid>

                  {/* Treino Bloco 02 (Opcional) */}
                  <Grid item md={6} lg={4} xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="600">
                          Treino Bloco 02 <Chip label="Opcional" size="small" />
                        </Typography>
                        {treinoBloco2.length > 0 && (
                          <Chip
                            icon={<TimerIcon />}
                            label={`Tempo total: ${calcularTempoTotal(treinoBloco2)}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog('treino2')}
                      >
                        Adicionar
                      </Button>
                    </Box>
                    <List sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                      {treinoBloco2.length === 0 ? (
                        <ListItem>
                          <ListItemText
                            primary="Bloco opcional vazio"
                            secondary="Adicione exercícios se necessário"
                          />
                        </ListItem>
                      ) : (
                        treinoBloco2.map((item, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleOpenDialog('treino2', index)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleRemoveItem('treino2', index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>}                          >
                            <ListItemText
                              primary={`${index + 1}. ${item.nome}`}
                              secondary={`${item.series} séries × ${item.repeticoes} reps • ${item.carga} • ~${item.tempo}s/série`}
                            />
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Grid>

                  {/* Condicionamento Físico */}
                  <Grid item md={6} lg={4} xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight="600">
                        Condicionamento Físico <Chip label="Opcional" size="small" />
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog('condicionamento')}
                      >
                        Adicionar
                      </Button>
                    </Box>
                    <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                      {condicionamentoItems.length === 0 ? (
                        <ListItem>
                          <ListItemText
                            primary="Nenhum exercício adicionado"
                            secondary="Clique em Adicionar para incluir"
                          />
                        </ListItem>
                      ) : (
                        condicionamentoItems.map((item, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleOpenDialog('condicionamento', index)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleRemoveItem('condicionamento', index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            }
                          >
                            <ListItemText
                              primary={item.nome}
                              secondary={item.duracao}
                            />
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Card: Observações Internas */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  🔒 Observações Internas
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  Estas observações são visíveis apenas para o profissional, não aparecem no compartilhamento
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <FormInput
                  name="observacoes_internas"
                  label="Observações Internas (não visíveis no compartilhamento)"
                  multiline
                  rows={4}
                  placeholder="Ex: Atenção especial ao joelho esquerdo, histórico de lesão..."
                />
              </CardContent>
            </Card>

            {/* Resumo de Erros */}
            {Object.keys(errors).length > 0 && (
              <Paper sx={{ p: 3, bgcolor: 'error.lighter', borderLeft: 4, borderColor: 'error.main' }}>
                <Typography variant="h6" color="error" gutterBottom>
                  ⚠️ Erros de Validação
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
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
            >
              Salvar Treino
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

      {/* Dialog para Adicionar/Editar Itens */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem !== null ? 'Editar' : 'Adicionar'} {
            currentSection === 'mobilidade' ? 'Mobilidade' :
              currentSection === 'core' ? 'Ativação de Core' :
                currentSection === 'neural' ? 'Ativação Neural' :
                  currentSection === 'treino1' ? 'Exercício (Bloco 1)' :
                    currentSection === 'treino2' ? 'Exercício (Bloco 2)' :
                      'Condicionamento'
          }
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Mobilidade: apenas select */}
            {currentSection === 'mobilidade' && (
              <TextField
                select
                label="Articulação"
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                fullWidth
              >
                {mobilidadeOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            )}

            {/* Core: nome, séries, tempo, intervalo */}
            {currentSection === 'core' && (
              <>
                <TextField
                  label="Nome do Exercício"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Séries"
                  type="number"
                  value={formData.series || ''}
                  onChange={(e) => setFormData({ ...formData, series: parseInt(e.target.value) })}
                  fullWidth
                />
                <TextField
                  label="Tempo (segundos)"
                  type="number"
                  value={formData.tempo || ''}
                  onChange={(e) => setFormData({ ...formData, tempo: parseInt(e.target.value) })}
                  fullWidth
                />
                <TextField
                  label="Intervalo (segundos)"
                  type="number"
                  value={formData.intervalo || ''}
                  onChange={(e) => setFormData({ ...formData, intervalo: parseInt(e.target.value) })}
                  fullWidth
                />
              </>
            )}

            {/* Neural: nome, séries, tempo */}
            {currentSection === 'neural' && (
              <>
                <TextField
                  label="Nome do Exercício"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Séries"
                  type="number"
                  value={formData.series || ''}
                  onChange={(e) => setFormData({ ...formData, series: parseInt(e.target.value) })}
                  fullWidth
                />
                <TextField
                  label="Tempo (segundos)"
                  type="number"
                  value={formData.tempo || ''}
                  onChange={(e) => setFormData({ ...formData, tempo: parseInt(e.target.value) })}
                  fullWidth
                />
              </>
            )}

            {/* Treino 1 e 2: nome, séries, repetições, carga, tempo */}
            {(currentSection === 'treino1' || currentSection === 'treino2') && (
              <>
                <TextField
                  label="Nome do Exercício"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  fullWidth
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Séries"
                      type="number"
                      value={formData.series || ''}
                      onChange={(e) => setFormData({ ...formData, series: parseInt(e.target.value) })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Repetições"
                      value={formData.repeticoes || ''}
                      onChange={(e) => setFormData({ ...formData, repeticoes: e.target.value })}
                      placeholder="Ex: 8-10"
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Carga"
                  value={formData.carga || ''}
                  onChange={(e) => setFormData({ ...formData, carga: e.target.value })}
                  placeholder="Ex: 80kg ou Corporal"
                  fullWidth
                />
                <TextField
                  label="Tempo estimado por série (segundos)"
                  type="number"
                  value={formData.tempo || ''}
                  onChange={(e) => setFormData({ ...formData, tempo: parseInt(e.target.value) })}
                  fullWidth
                  helperText="Usado para calcular o tempo total do treino"
                />
              </>
            )}

            {/* Condicionamento: nome e duração */}
            {currentSection === 'condicionamento' && (
              <>
                <TextField
                  label="Nome do Exercício"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Duração"
                  value={formData.duracao || ''}
                  onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                  placeholder="Ex: 4 min, 20 min, Tabata 8 rounds"
                  fullWidth
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveItem}
            disabled={!formData.nome}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default TreinoDetalhesForm;


