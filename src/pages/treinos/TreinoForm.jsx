// Formulário de Treino - Criar/Editar
import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'

// Imports dos serviços
import { weekService } from '../../services/weekService'
import { movementPatternService } from '../../services/movementPatternService'
import { exerciseService } from '../../services/exerciseService'
import { trainingService } from '../../services/trainingService'

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
  Chip,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material'

import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  FitnessCenter as FitnessCenterIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Timer as TimerIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
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

function TreinoForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: editingTrainingId } = useParams() // Pegar ID da URL RESTful
  const searchParams = new URLSearchParams(location.search)
  const shouldUseDefaultBlocks = searchParams.get('defaultBlocks') === 'true'
  const isEditMode = !!editingTrainingId

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

  const { handleSubmit, formState: { errors }, watch, setValue } = methods

  // Estados para dados dos selects
  const [semanasOptions, setSemanasOptions] = useState([])
  const [semanasCompletas, setSemanasCompletas] = useState([]) // Semanas com todas as informações
  const [padroesMovimentoOptions, setPadroesMovimentoOptions] = useState([])
  const [exerciciosOptions, setExerciciosOptions] = useState([])
  
  // Estados para destacar dias da semana no date picker
  const [weekStartDate, setWeekStartDate] = useState(null)
  const [weekEndDate, setWeekEndDate] = useState(null)

  // Função helper para formatar protocolo do exercício
  const formatProtocol = (item) => {
    const parts = []

    // Séries e repetições
    if (item.series && item.repeticoes) {
      parts.push(`${item.series} séries × ${item.repeticoes} reps`)
    }

    // Carga
    if (item.carga && item.carga !== '' && item.carga !== 'undefined') {
      const carga = item.carga.toString().includes('kg') ? item.carga : `${item.carga}kg`
      parts.push(carga)
    }

    // Tempo
    if (item.tempoSegundos && item.tempoSegundos !== '' && item.tempoSegundos !== 'undefined' && item.tempoSegundos !== 0) {
      parts.push(`Tempo: ${item.tempoSegundos}s`)
    }

    // Intervalo
    if (item.intervaloSegundos && item.intervaloSegundos !== '' && item.intervaloSegundos !== 'undefined' && item.intervaloSegundos !== 0) {
      parts.push(`Intervalo: ${item.intervaloSegundos}s`)
    }

    // Total
    if (item.tempoTotal && item.tempoTotal !== '' && item.tempoTotal !== 'undefined' && item.tempoTotal !== 0) {
      parts.push(`Total: ${item.tempoTotal}s`)
    }

    return parts.join(' • ')
  }
  
  // Estados para controle de loading
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [loadingTrainingData, setLoadingTrainingData] = useState(isEditMode)
  
  // Estados para feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })
  const [submitting, setSubmitting] = useState(false)
  const [submittingMessage, setSubmittingMessage] = useState('')

  // Watch para mudanças na data e semana para atualizar nome do treino automaticamente
  const watchedValues = watch(['data', 'semana'])
  const watchedSemana = watch('semana')

  useEffect(() => {
    // Evitar execuções durante o carregamento inicial ou quando não há dados
    if (loading || loadingTrainingData) return;
    
    const [data, semana] = watchedValues
    if (data && semana && semanasOptions.length > 0) {
      const newName = generateTrainingName(semana, data)
      console.log('🔄 Nome do treino atualizado automaticamente:', newName)
    }
  }, [watchedValues, semanasOptions, loading, loadingTrainingData])

  // Estados para compartilhamento
  const [shareLink, setShareLink] = useState('')
  const [linkToken, setLinkToken] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  // Função para gerar nome do treino baseado na semana e data
  const generateTrainingName = (weekId, date) => {
    console.log('🏷️ Gerando nome do treino:', { weekId, date, semanasOptions: semanasOptions.length })

    if (!weekId || !date) {
      console.log('⚠️ Dados insuficientes para gerar nome')
      return 'Treino'
    }

    // Encontrar a semana selecionada
    const selectedWeek = semanasOptions.find(w => w.id === weekId)
    console.log('📅 Semana selecionada:', selectedWeek)

    if (!selectedWeek) {
      console.log('⚠️ Semana não encontrada')
      return 'Treino'
    }

    // Extrair número da semana do label (assumindo formato como "Semana 01 - ...")
    const weekMatch = selectedWeek.label.match(/\d+/)
    const weekNumber = weekMatch ? weekMatch[0].padStart(2, '0') : '01'

    // Converter data para dia da semana (1=domingo, 2=segunda, etc)
    const dayOfWeek = new Date(date).getDay() + 1 // getDay() retorna 0=domingo, queremos 1=domingo
    const dayNumber = dayOfWeek.toString().padStart(2, '0')

    const finalName = `Treino S${weekNumber}-${dayNumber}`
    console.log('✨ Nome do treino gerado:', finalName, { weekNumber, dayNumber, dayOfWeek })

    return finalName
  }

  // Carregar dados dos selects ao montar o componente
  useEffect(() => {
    const loadSelectData = async () => {
      try {
        setLoading(true)
        setLoadError(null)

        // Buscar semanas de treino
        const semanas = await weekService.getAllTrainingWeeks()
        const semanasFormatted = semanas.map(semana => ({
          id: semana.id,
          label: `${semana.name} - ${semana.week_focus?.name || 'Sem foco'}`
        }))

        // Buscar padrões de movimento
        const padroes = await movementPatternService.getAllMovementPatterns()
        const padroesFormatted = padroes.map(padrao => ({
          id: padrao.id,
          label: padrao.name
        }))

        // Buscar exercícios
        const exercicios = await exerciseService.getAllExercises()
        const exerciciosFormatted = exercicios.map(exercicio => ({
          id: exercicio.id,
          label: exercicio.name,
          movement_pattern: exercicio.movement_pattern?.name || 'Sem padrão'
        }))

        setSemanasOptions(semanasFormatted)
        setSemanasCompletas(semanas) // Armazenar semanas completas com datas
        setPadroesMovimentoOptions(padroesFormatted)
        setExerciciosOptions(exerciciosFormatted)

        console.log('✅ Dados dos selects carregados:', {
          semanas: semanasFormatted.length,
          padroes: padroesFormatted.length,
          exercicios: exerciciosFormatted.length
        })

        console.log('🔍 Debug - Opções de semanas:', semanasFormatted)
        console.log('🔍 Debug - Opções de padrões:', padroesFormatted)

      } catch (error) {
        console.error('❌ Erro ao carregar dados dos selects:', error)
        setLoadError(error.message)

        // Fallback para dados básicos em caso de erro
        setSemanasOptions([
          { id: 'erro', label: 'Erro ao carregar semanas' }
        ])
        setPadroesMovimentoOptions([
          { id: 'erro', label: 'Erro ao carregar padrões' }
        ])
        setExerciciosOptions([
          { id: 'erro', label: 'Erro ao carregar exercícios' }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadSelectData()
  }, [])

  // Hook para preencher semana automaticamente via query param
  useEffect(() => {
    const semanaParam = searchParams.get('semana')
    
    if (semanaParam && !isEditMode && semanasOptions.length > 0) {
      // Verificar se a semana existe nas opções
      const semanaValida = semanasOptions.find(s => s.id === semanaParam)
      
      if (semanaValida) {
        console.log('✅ Preenchendo semana automaticamente:', semanaValida.label)
        setValue('semana', semanaParam, { shouldValidate: false, shouldDirty: false })
      } else {
        console.warn('⚠️ Semana não encontrada nas opções:', semanaParam)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semanasOptions.length, isEditMode])

  // Hook para atualizar datas de destaque quando semana é selecionada
  useEffect(() => {
    if (watchedSemana && semanasCompletas.length > 0) {
      const semanaCompleta = semanasCompletas.find(s => s.id === watchedSemana)
      
      if (semanaCompleta && semanaCompleta.start_date && semanaCompleta.end_date) {
        console.log('📅 Destacando dias da semana:', semanaCompleta.start_date, '-', semanaCompleta.end_date)
        setWeekStartDate(semanaCompleta.start_date)
        setWeekEndDate(semanaCompleta.end_date)
      } else {
        console.log('⚠️ Semana sem datas definidas, não destacando dias')
        setWeekStartDate(null)
        setWeekEndDate(null)
      }
    } else {
      setWeekStartDate(null)
      setWeekEndDate(null)
    }
  }, [watchedSemana, semanasCompletas])

  // Hook para carregar dados do treino em modo de edição
  useEffect(() => {
    let isMounted = true;
    
    const loadTrainingData = async () => {
      if (!isEditMode || !editingTrainingId || loading ||
        semanasOptions.length === 0 || padroesMovimentoOptions.length === 0) {
        return
      }

      try {
        setLoadingTrainingData(true)
        console.log('🔄 Carregando dados do treino:', editingTrainingId)

        const trainingData = await trainingService.getTrainingById(editingTrainingId)

        if (!isMounted) return; // Evitar atualização se o componente foi desmontado

        if (!trainingData) {
          throw new Error('Treino não encontrado')
        }

        console.log('✅ Dados do treino carregados:', trainingData)

        // Validar semana contra opções disponíveis
        const validWeekId = semanasOptions.find(week => week.id === trainingData.training_week_id)?.id || ''

        // Extrair o padrão de movimento do nome do treino se não estiver no campo específico
        let selectedPatternId = ''
        if (trainingData.name) {
          const patternMatch = padroesMovimentoOptions.find(pattern =>
            trainingData.name.toLowerCase().includes(pattern.label.toLowerCase())
          )
          selectedPatternId = patternMatch?.id || ''
        }

        // Validar padrão de movimento contra opções disponíveis
        const validPatternId = padroesMovimentoOptions.find(pattern =>
          pattern.id === (trainingData.movement_pattern_id || selectedPatternId)
        )?.id || ''

        // Popular o formulário principal com conversão de data para dayjs
        const formData = {
          nome: trainingData.name || '',
          data: trainingData.scheduled_date ? dayjs(trainingData.scheduled_date) : null,
          semana: validWeekId,
          padrao_movimento: validPatternId,
          observacoes: trainingData.description || '',
          observacoes_internas: trainingData.internal_notes || '',
          link_ativo: trainingData.share_status === 'public',
        }

        console.log('🔍 Dados formatados para o formulário:', formData)
        console.log('📊 Opções válidas - Semanas:', semanasOptions.length, 'Padrões:', padroesMovimentoOptions.length)

        // Carregar dados de compartilhamento se existirem
        if (trainingData.share_token) {
          setLinkToken(trainingData.share_token)
          setShareLink(generateShareLink(trainingData.share_token))
        }

        methods.reset(formData)

        // Popular os blocos do treino
        populateTrainingBlocks(trainingData.training_blocks || [])

      } catch (error) {
        console.error('❌ Erro ao carregar dados do treino:', error)
        if (isMounted) {
          setSnackbar({
            open: true,
            message: 'Erro ao carregar dados do treino',
            severity: 'error'
          })
        }
      } finally {
        if (isMounted) {
          setLoadingTrainingData(false)
        }
      }
    }

    loadTrainingData()
    
    return () => {
      isMounted = false;
    }
  }, [isEditMode, editingTrainingId, loading, semanasOptions.length, padroesMovimentoOptions.length])

  // Função para popular os blocos do treino
  const populateTrainingBlocks = (blocks) => {
    // Limpar todos os blocos
    setMobilidadeItems([])
    setCoreItems([])
    setNeuralItems([])
    setTreinoBloco1([])
    setTreinoBloco2([])
    setCondicionamentoItems([])

    // Popular cada bloco baseado no tipo
    blocks.forEach(block => {
      switch (block.block_type) {
        case 'MOBILIDADE_ARTICULAR':
          // Para mobilidade, preservar ID do exercício
          const mobilityItems = block.exercise_prescriptions?.map(prescription => ({
            nome: prescription.exercise?.name || 'Exercício não encontrado',
            exercicioId: prescription.exercise?.id
          })) || []
          setMobilidadeItems(mobilityItems)
          break
        case 'ATIVACAO_CORE':
          const coreItems = block.exercise_prescriptions?.map(prescription => {
            const series = prescription.sets || 0
            const tempoSegundos = prescription.duration_seconds || 0
            const intervaloSegundos = prescription.rest_seconds || 0
            const tempoTotal = series > 0 ? (tempoSegundos + intervaloSegundos) * series : 0

            return {
              nome: prescription.exercise?.name || 'Exercício não encontrado',
              exercicioId: prescription.exercise?.id,
              series: prescription.sets || '',
              repeticoes: prescription.reps || '',
              carga: prescription.weight_kg || '',
              tempoSegundos: prescription.duration_seconds || '',
              intervaloSegundos: prescription.rest_seconds || '',
              tempoTotal: tempoTotal,
              observacoes: prescription.notes || ''
            }
          }) || []
          setCoreItems(coreItems)
          break
        case 'ATIVACAO_NEURAL':
          const neuralItems = block.exercise_prescriptions?.map(prescription => {
            const series = prescription.sets || 0
            const tempoSegundos = prescription.duration_seconds || 0
            const intervaloSegundos = prescription.rest_seconds || 0
            const tempoTotal = series > 0 ? (tempoSegundos + intervaloSegundos) * series : 0

            return {
              nome: prescription.exercise?.name || 'Exercício não encontrado',
              exercicioId: prescription.exercise?.id,
              series: prescription.sets || '',
              repeticoes: prescription.reps || '',
              carga: prescription.weight_kg || '',
              tempoSegundos: prescription.duration_seconds || '',
              intervaloSegundos: prescription.rest_seconds || '',
              tempoTotal: tempoTotal,
              observacoes: prescription.notes || ''
            }
          }) || []
          setNeuralItems(neuralItems)
          break
        case 'TREINO_PRINCIPAL':
          // Identificar qual bloco principal pelo nome ou ordem
          const principalItems = block.exercise_prescriptions?.map(prescription => {
            const series = prescription.sets || 0
            const tempoSegundos = prescription.duration_seconds || 0
            const intervaloSegundos = prescription.rest_seconds || 0
            const tempoTotal = series > 0 ? (tempoSegundos + intervaloSegundos) * series : 0

            return {
              nome: prescription.exercise?.name || 'Exercício não encontrado',
              exercicioId: prescription.exercise?.id,
              series: prescription.sets || '',
              repeticoes: prescription.reps || '',
              carga: prescription.weight_kg || '',
              tempoSegundos: prescription.duration_seconds || '',
              intervaloSegundos: prescription.rest_seconds || '',
              tempoTotal: tempoTotal,
              observacoes: prescription.notes || ''
            }
          }) || []

          // Verificar pelo nome do bloco ou ordem para saber qual bloco é
          if (block.name === 'Bloco Principal 1' || block.order_index === 4) {
            setTreinoBloco1(principalItems)
            console.log('📦 [DEBUG] Carregando exercícios para Bloco Principal 1:', principalItems.length, 'itens')
          } else if (block.name === 'Bloco Principal 2' || block.order_index === 5) {
            setTreinoBloco2(principalItems)
            console.log('📦 [DEBUG] Carregando exercícios para Bloco Principal 2:', principalItems.length, 'itens')
          } else {
            // Fallback: se não conseguir identificar, dividir pela metade (comportamento antigo)
            const midPoint = Math.ceil(principalItems.length / 2)
            setTreinoBloco1(principalItems.slice(0, midPoint))
            setTreinoBloco2(principalItems.slice(midPoint))
            console.log('📦 [DEBUG] Dividindo exercícios principal (fallback) - Bloco 1:', midPoint, '- Bloco 2:', principalItems.length - midPoint)
          }
          break
        case 'CONDICIONAMENTO_FISICO':
          const condicionamentoItems = block.exercise_prescriptions?.map(prescription => ({
            nome: prescription.exercise?.name || 'Exercício não encontrado',
            exercicioId: prescription.exercise?.id,
            duracao: prescription.duration_seconds ? `${prescription.duration_seconds}s` : '',
            observacoes: prescription.notes || ''
          })) || []
          setCondicionamentoItems(condicionamentoItems)
          break
        default:
          console.warn('Tipo de bloco não reconhecido:', block.block_type)
      }
    })
  }

  // Handlers para abrir dialogs
  const handleOpenDialog = (section, itemOrIndex = null) => {
    setCurrentSection(section)

    // Se itemOrIndex é um número, é um índice (para edição)
    // Se é um objeto ou null, é um item direto ou novo item
    if (typeof itemOrIndex === 'number') {
      // Está editando - encontrar o item pelo índice
      let item = null
      let index = itemOrIndex

      switch (section) {
        case 'mobilidade':
          item = mobilidadeItems[index]
          break
        case 'core':
          item = coreItems[index]
          break
        case 'neural':
          item = neuralItems[index]
          break
        case 'treino1':
          item = treinoBloco1[index]
          break
        case 'treino2':
          item = treinoBloco2[index]
          break
        case 'condicionamento':
          item = condicionamentoItems[index]
          break
      }

      setEditingItem(index)
      setFormData(item || {})
    } else {
      // Novo item ou item direto
      setEditingItem(null)
      setFormData(itemOrIndex || {})
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
    console.log('💾 Salvando item na seção:', currentSection, 'Dados:', formData)

    switch (currentSection) {
      case 'mobilidade':
        if (!formData.nome) {
          console.warn('⚠️ Nome do exercício de mobilidade não definido:', formData)
          setSnackbar({
            open: true,
            message: 'Por favor, selecione um exercício de mobilidade',
            severity: 'warning'
          })
          return
        }

        // Para mobilidade, vamos armazenar um objeto com ID e nome se disponível
        const mobilityItem = formData.exercicioId
          ? { nome: formData.nome, exercicioId: formData.exercicioId }
          : formData.nome

        if (editingItem !== null) {
          const newItems = [...mobilidadeItems]
          newItems[editingItem] = mobilityItem
          setMobilidadeItems(newItems)
          console.log('✏️ Item de mobilidade editado:', mobilityItem)
        } else {
          setMobilidadeItems([...mobilidadeItems, mobilityItem])
          console.log('➕ Item de mobilidade adicionado:', mobilityItem)
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
          console.log('✏️ [DEBUG] Exercício editado no Bloco 2:', formData.exercicio, '- Total itens:', newItems.length)
        } else {
          setTreinoBloco2([...treinoBloco2, formData])
          console.log('➕ [DEBUG] Exercício adicionado ao Bloco 2:', formData.exercicio, '- Total itens:', treinoBloco2.length + 1)
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

  // Calcular tempo total do treino bloco
  const calcularTempoTotal = (items) => {
    const totalSegundos = items.reduce((acc, item) => acc + (item.tempoTotal || 0), 0)
    const minutos = Math.floor(totalSegundos / 60)
    const segundos = totalSegundos % 60
    return `${minutos}min ${segundos}s`
  }

  // Função para criar os blocos do treino no banco
  const createTrainingBlocks = async (trainingId) => {
    const blocksToCreate = [
      {
        name: 'Mobilidade Articular',
        type: 'MOBILIDADE_ARTICULAR',
        items: mobilidadeItems,
        order: 1
      },
      {
        name: 'Ativação de Core',
        type: 'ATIVACAO_CORE',
        items: coreItems,
        order: 2
      },
      {
        name: 'Ativação Neural',
        type: 'ATIVACAO_NEURAL',
        items: neuralItems,
        order: 3
      },
      {
        name: 'Bloco Principal 1',
        type: 'TREINO_PRINCIPAL',
        items: treinoBloco1,
        order: 4
      },
      {
        name: 'Bloco Principal 2',
        type: 'TREINO_PRINCIPAL',
        items: treinoBloco2,
        order: 5
      },
      {
        name: 'Condicionamento Físico',
        type: 'CONDICIONAMENTO_FISICO',
        items: condicionamentoItems,
        order: 6
      }
    ]

    console.log('🔍 [DEBUG] Estados dos blocos antes do filtro:')
    console.log('- Mobilidade:', mobilidadeItems.length, 'itens')
    console.log('- Core:', coreItems.length, 'itens')
    console.log('- Neural:', neuralItems.length, 'itens')
    console.log('- Bloco 1:', treinoBloco1.length, 'itens')
    console.log('- Bloco 2:', treinoBloco2.length, 'itens')
    console.log('- Condicionamento:', condicionamentoItems.length, 'itens')

    // Filtrar apenas blocos que têm itens
    const blocksWithItems = blocksToCreate.filter(block =>
      block.items && block.items.length > 0
    )

    console.log('📊 Criando', blocksWithItems.length, 'blocos com exercícios')
    console.log('🔍 [DEBUG] Blocos que serão criados:', blocksWithItems.map(b => `${b.name}: ${b.items.length} itens`))

    for (const blockConfig of blocksWithItems) {
      try {
        // Criar o bloco
        const blockData = {
          training_id: trainingId,
          name: blockConfig.name,
          block_type: blockConfig.type,
          order_index: blockConfig.order,
          instructions: `Instruções para ${blockConfig.name}`,
          rest_between_exercises_seconds: 60
        }

        console.log('🛠️ Criando bloco:', blockData.name)
        const createdBlock = await trainingService.createTrainingBlock(blockData)

        // Adicionar exercícios ao bloco
        for (let i = 0; i < blockConfig.items.length; i++) {
          const item = blockConfig.items[i]

          // Se o item é uma string (mobilidade), buscar exercício existente
          if (typeof item === 'string') {
            await createExerciseFromString(createdBlock.id, item, i + 1, blockConfig.type)
          } else if (item.nome) {
            // Se o item tem estrutura de exercício
            await createExerciseFromObject(createdBlock.id, item, i + 1)
          }
        }

        console.log('✅ Bloco', blockData.name, 'criado com', blockConfig.items.length, 'exercícios')

      } catch (error) {
        console.error('❌ Erro ao criar bloco', blockConfig.name, ':', error)
      }
    }
  }

  // Função auxiliar para criar exercício a partir de string
  const createExerciseFromString = async (blockId, exerciseName, order, blockType) => {
    try {
      // Buscar exercícios existentes
      const exercises = await exerciseService.getAllExercises()
      let exercise = null

      console.log(`🔍 Buscando exercício '${exerciseName}' para bloco tipo '${blockType}'`)

      // Para mobilidade articular, priorizar exercícios com padrão "mobilidade"
      if (blockType === 'MOBILIDADE_ARTICULAR') {
        // Primeiro buscar por nome exato (caso o nome seja exato)
        exercise = exercises.find(ex => ex.name.toLowerCase() === exerciseName.toLowerCase())

        if (!exercise) {
          // Buscar exercícios de mobilidade por nome similar
          exercise = exercises.find(ex =>
            ex.movement_pattern?.name?.toLowerCase().includes('mobilidade') &&
            ex.name.toLowerCase().includes(exerciseName.toLowerCase())
          )
        }

        if (!exercise) {
          // Buscar qualquer exercício de mobilidade que contenha parte do nome
          exercise = exercises.find(ex =>
            ex.movement_pattern?.name?.toLowerCase().includes('mobilidade') &&
            exerciseName.toLowerCase().includes(ex.name.toLowerCase())
          )
        }

        if (!exercise) {
          // Como último recurso, buscar qualquer exercício de mobilidade
          exercise = exercises.find(ex =>
            ex.movement_pattern?.name?.toLowerCase().includes('mobilidade')
          )
        }

        console.log(`🎯 Exercício de mobilidade ${exercise ? 'encontrado' : 'não encontrado'}:`,
          exercise ? exercise.name : 'N/A')
      } else {
        // Para outros tipos, buscar por nome exato primeiro
        exercise = exercises.find(ex => ex.name.toLowerCase() === exerciseName.toLowerCase())

        // Se não encontrou, buscar por nome similar
        if (!exercise) {
          exercise = exercises.find(ex => ex.name.toLowerCase().includes(exerciseName.toLowerCase()))
        }
      }

      // Se encontrou exercício, criar prescrição
      if (exercise) {
        await trainingService.addExerciseToBlock({
          training_block_id: blockId,
          exercise_id: exercise.id,
          order_index: order,
          sets: blockType === 'MOBILIDADE_ARTICULAR' ? 1 : 2,
          reps: blockType === 'MOBILIDADE_ARTICULAR' ? '30s' : '15',
          rest_seconds: blockType === 'MOBILIDADE_ARTICULAR' ? 30 : 60
        })
        console.log(`✅ Exercício '${exercise.name}' adicionado ao bloco com sucesso`)
      } else {
        console.log(`⚠️ Exercício '${exerciseName}' não encontrado no banco, pulando...`)
      }

    } catch (error) {
      console.error('❌ Erro ao processar exercício', exerciseName, ':', error)
    }
  }

  // Função auxiliar para criar exercício a partir de ID
  const createExerciseFromId = async (blockId, exerciseId, order, blockType, exerciseData = null) => {
    try {
      console.log(`🔍 Adicionando exercício por ID '${exerciseId}' ao bloco tipo '${blockType}'`)
      console.log(`🔍 Dados do exercício recebidos:`, exerciseData)

      // Usar dados específicos se fornecidos, senão usar padrões
      const prescriptionData = {
        training_block_id: blockId,
        exercise_id: exerciseId,
        order_index: order,
        sets: exerciseData?.series || (blockType === 'MOBILIDADE_ARTICULAR' ? 1 : 2),
        rest_seconds: exerciseData?.intervaloSegundos !== undefined && exerciseData?.intervaloSegundos !== '' && exerciseData?.intervaloSegundos !== null ?
          parseInt(exerciseData.intervaloSegundos) :
          (blockType === 'MOBILIDADE_ARTICULAR' ? 30 : 60)
      }

      // Definir repetições ou tempo
      if (exerciseData?.tempoSegundos !== undefined && exerciseData?.tempoSegundos !== '' && exerciseData?.tempoSegundos !== null) {
        prescriptionData.duration_seconds = parseInt(exerciseData.tempoSegundos)
        prescriptionData.reps = null
      } else if (exerciseData?.repeticoes) {
        prescriptionData.reps = exerciseData.repeticoes
        prescriptionData.duration_seconds = null
      } else {
        // Valores padrão
        prescriptionData.reps = blockType === 'MOBILIDADE_ARTICULAR' ? '30s' : '15'
        prescriptionData.duration_seconds = null
      }

      // Adicionar peso se disponível
      if (exerciseData?.carga && exerciseData.carga !== '') {
        const peso = parseFloat(exerciseData.carga.replace('kg', '').trim())
        if (!isNaN(peso)) {
          prescriptionData.weight_kg = peso
        }
      }

      console.log('💾 [DEBUG] Dados da prescrição que serão salvos (createExerciseFromId):', prescriptionData)
      await trainingService.addExerciseToBlock(prescriptionData)

      console.log(`✅ Exercício ID '${exerciseId}' adicionado ao bloco com sucesso`)

    } catch (error) {
      console.error('❌ Erro ao processar exercício por ID', exerciseId, ':', error)
    }
  }

  // Função auxiliar para criar exercício a partir de objeto
  const createExerciseFromObject = async (blockId, exerciseObj, order) => {
    try {
      console.log('🔍 [DEBUG] Dados do exercício recebidos:', exerciseObj)
      console.log('🔍 [DEBUG] Campos relevantes:', {
        nome: exerciseObj.nome,
        series: exerciseObj.series,
        tempoSegundos: exerciseObj.tempoSegundos,
        intervaloSegundos: exerciseObj.intervaloSegundos,
        tempo: exerciseObj.tempo,
        intervalo: exerciseObj.intervalo
      })

      console.log('🔍 [DEBUG] Verificações de valores:')
      console.log('- tempoSegundos !== undefined:', exerciseObj.tempoSegundos !== undefined)
      console.log('- tempoSegundos !== "":', exerciseObj.tempoSegundos !== '')
      console.log('- tempoSegundos !== null:', exerciseObj.tempoSegundos !== null)
      console.log('- valor tempoSegundos:', exerciseObj.tempoSegundos)
      console.log('- tipo tempoSegundos:', typeof exerciseObj.tempoSegundos)

      console.log('- intervaloSegundos !== undefined:', exerciseObj.intervaloSegundos !== undefined)
      console.log('- intervaloSegundos !== "":', exerciseObj.intervaloSegundos !== '')
      console.log('- intervaloSegundos !== null:', exerciseObj.intervaloSegundos !== null)
      console.log('- valor intervaloSegundos:', exerciseObj.intervaloSegundos)
      console.log('- tipo intervaloSegundos:', typeof exerciseObj.intervaloSegundos)

      // Se já tem exercicioId, usar diretamente
      if (exerciseObj.exercicioId) {
        console.log('🔍 Usando exercícioId diretamente:', exerciseObj.exercicioId)

        // Preparar dados de prescrição
        let prescriptionData = {
          training_block_id: blockId,
          exercise_id: exerciseObj.exercicioId,
          order_index: order,
          sets: exerciseObj.series || 1,
          rest_seconds: exerciseObj.intervaloSegundos !== undefined && exerciseObj.intervaloSegundos !== '' && exerciseObj.intervaloSegundos !== null ?
            parseInt(exerciseObj.intervaloSegundos) :
            (exerciseObj.intervalo !== undefined && exerciseObj.intervalo !== '' && exerciseObj.intervalo !== null ?
              parseInt(exerciseObj.intervalo) : 60)
        }

        // Se tem tempo definido, usar duration_seconds
        if (exerciseObj.tempoSegundos !== undefined && exerciseObj.tempoSegundos !== '' && exerciseObj.tempoSegundos !== null) {
          prescriptionData.duration_seconds = parseInt(exerciseObj.tempoSegundos)
          prescriptionData.reps = null
        } else if (exerciseObj.tempo !== undefined && exerciseObj.tempo !== '' && exerciseObj.tempo !== null) {
          prescriptionData.duration_seconds = parseInt(exerciseObj.tempo)
          prescriptionData.reps = null
        } else if (exerciseObj.repeticoes && exerciseObj.repeticoes !== '') {
          // Se não tem tempo, usar repetições
          prescriptionData.reps = exerciseObj.repeticoes
          prescriptionData.duration_seconds = null
        } else {
          prescriptionData.reps = '1'
          prescriptionData.duration_seconds = null
        }

        // Adicionar peso se disponível
        if (exerciseObj.carga && exerciseObj.carga !== '') {
          const peso = parseFloat(exerciseObj.carga.replace('kg', '').trim())
          if (!isNaN(peso)) {
            prescriptionData.weight_kg = peso
          }
        }

        console.log('💾 [DEBUG] Dados da prescrição que serão salvos no banco:', prescriptionData)
        await trainingService.addExerciseToBlock(prescriptionData)
        console.log(`✅ Exercício '${exerciseObj.nome}' adicionado ao bloco com protocolo:`, prescriptionData)
        return
      }

      // Se não tem exercicioId, buscar exercício por nome
      const exercises = await exerciseService.getAllExercises()
      let exercise = exercises.find(ex => ex.name.toLowerCase() === exerciseObj.nome.toLowerCase())

      // Se não encontrou por nome exato, buscar por nome similar
      if (!exercise) {
        exercise = exercises.find(ex => ex.name.toLowerCase().includes(exerciseObj.nome.toLowerCase()))
      }

      // Se encontrou exercício, criar prescrição
      if (exercise) {
        // Preparar dados de prescrição
        let prescriptionData = {
          training_block_id: blockId,
          exercise_id: exercise.id,
          order_index: order,
          sets: exerciseObj.series || 1,
          rest_seconds: exerciseObj.intervaloSegundos !== undefined && exerciseObj.intervaloSegundos !== '' && exerciseObj.intervaloSegundos !== null ?
            parseInt(exerciseObj.intervaloSegundos) :
            (exerciseObj.intervalo !== undefined && exerciseObj.intervalo !== '' && exerciseObj.intervalo !== null ?
              parseInt(exerciseObj.intervalo) : 60)
        }

        // Se tem tempo definido, usar duration_seconds
        if (exerciseObj.tempoSegundos !== undefined && exerciseObj.tempoSegundos !== '' && exerciseObj.tempoSegundos !== null) {
          prescriptionData.duration_seconds = parseInt(exerciseObj.tempoSegundos)
          prescriptionData.reps = null
        } else if (exerciseObj.tempo !== undefined && exerciseObj.tempo !== '' && exerciseObj.tempo !== null) {
          prescriptionData.duration_seconds = parseInt(exerciseObj.tempo)
          prescriptionData.reps = null
        } else if (exerciseObj.repeticoes && exerciseObj.repeticoes !== '') {
          // Se não tem tempo, usar repetições
          prescriptionData.reps = exerciseObj.repeticoes
          prescriptionData.duration_seconds = null
        } else {
          prescriptionData.reps = '1'
          prescriptionData.duration_seconds = null
        }

        // Adicionar peso se disponível
        if (exerciseObj.carga && exerciseObj.carga !== '') {
          const peso = parseFloat(exerciseObj.carga.replace('kg', '').trim())
          if (!isNaN(peso)) {
            prescriptionData.weight_kg = peso
          }
        }

        console.log('💾 [DEBUG] Dados da prescrição que serão salvos no banco:', prescriptionData)
        await trainingService.addExerciseToBlock(prescriptionData)
        console.log(`✅ Exercício '${exercise.name}' adicionado ao bloco com protocolo:`, prescriptionData)
      } else {
        console.log(`⚠️ Exercício '${exerciseObj.nome}' não encontrado, pulando...`)
      }

    } catch (error) {
      console.error('❌ Erro ao processar exercício', exerciseObj.nome, ':', error)
    }
  }

  // Função para atualizar os blocos do treino existente
  const updateTrainingBlocks = async (trainingId) => {
    try {
      console.log('🔄 Iniciando atualização de blocos para treino:', trainingId)

      // Primeiro, carregar os blocos existentes do banco
      const existingTraining = await trainingService.getTrainingById(trainingId)
      const existingBlocks = existingTraining.training_blocks || []

      console.log('📊 Blocos existentes encontrados:', existingBlocks.length)

      // Definir novos blocos baseados no estado atual
      const newBlocks = [
        {
          name: 'Mobilidade Articular',
          type: 'MOBILIDADE_ARTICULAR',
          items: mobilidadeItems,
          order: 1
        },
        {
          name: 'Ativação de Core',
          type: 'ATIVACAO_CORE',
          items: coreItems,
          order: 2
        },
        {
          name: 'Ativação Neural',
          type: 'ATIVACAO_NEURAL',
          items: neuralItems,
          order: 3
        },
        {
          name: 'Bloco Principal 1',
          type: 'TREINO_PRINCIPAL',
          items: treinoBloco1,
          order: 4
        },
        {
          name: 'Bloco Principal 2',
          type: 'TREINO_PRINCIPAL',
          items: treinoBloco2,
          order: 5
        },
        {
          name: 'Condicionamento Físico',
          type: 'CONDICIONAMENTO_FISICO',
          items: condicionamentoItems,
          order: 6
        }
      ]

      // Para simplicidade, vamos remover todos os blocos existentes e criar novos
      // TODO: Implementar lógica mais sofisticada para atualizar apenas os que mudaram
      console.log('🗑️ Removendo blocos existentes...')
      setSubmittingMessage('🗑️ Removendo blocos existentes...')
      try {
        await trainingService.deleteAllTrainingBlocks(trainingId)
        console.log('✅ Todos os blocos existentes foram removidos')
        setSubmittingMessage('✅ Blocos removidos, criando novos...')
      } catch (error) {
        console.warn('⚠️ Erro ao remover blocos existentes:', error)
        setSubmittingMessage('⚠️ Erro ao remover blocos, continuando...')
        // Continue mesmo se houver erro na remoção
      }

      // Agora criar os novos blocos (mesmo processo que createTrainingBlocks)
      const blocksWithItems = newBlocks.filter(block =>
        block.items && block.items.length > 0
      )

      console.log('📊 Criando', blocksWithItems.length, 'blocos atualizados com exercícios')

      for (let blockIndex = 0; blockIndex < blocksWithItems.length; blockIndex++) {
        const blockConfig = blocksWithItems[blockIndex]
        try {
          setSubmittingMessage(`🛠️ Criando bloco ${blockIndex + 1}/${blocksWithItems.length}: ${blockConfig.name}`)

          // Criar o bloco
          const blockData = {
            training_id: trainingId,
            name: blockConfig.name,
            block_type: blockConfig.type,
            order_index: blockConfig.order,
            instructions: `Instruções para ${blockConfig.name}`,
            rest_between_exercises_seconds: 60
          }

          console.log('🛠️ Criando bloco atualizado:', blockData.name)
          const createdBlock = await trainingService.createTrainingBlock(blockData)

          // Adicionar exercícios ao bloco
          for (let i = 0; i < blockConfig.items.length; i++) {
            const item = blockConfig.items[i]

            // Se o item é uma string (mobilidade antiga), buscar exercício existente
            if (typeof item === 'string') {
              await createExerciseFromString(createdBlock.id, item, i + 1, blockConfig.type)
            } else if (item && item.nome && (item.series || item.tempoSegundos || item.intervaloSegundos || item.repeticoes)) {
              // Se o item tem dados completos de protocolo, usar função para objetos completos
              await createExerciseFromObject(createdBlock.id, item, i + 1)
            } else if (item && item.nome && item.exercicioId) {
              // Se o item tem apenas ID e nome (sem protocolo específico), usar ID diretamente
              await createExerciseFromId(createdBlock.id, item.exercicioId, i + 1, blockConfig.type, item)
            } else if (item && item.nome) {
              // Se o item tem apenas nome, buscar por nome
              await createExerciseFromString(createdBlock.id, item.nome, i + 1, blockConfig.type)
            }
          }

          console.log('✅ Bloco', blockData.name, 'atualizado com', blockConfig.items.length, 'exercícios')

        } catch (error) {
          console.error('❌ Erro ao atualizar bloco', blockConfig.name, ':', error)
        }
      }

      console.log('✅ Todos os blocos foram atualizados!')
      setSubmittingMessage('✅ Treino salvo com sucesso!')

      // Pequeno delay para mostrar mensagem de sucesso
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error('❌ Erro geral ao atualizar blocos:', error)
      throw error
    }
  }

  // Funções para gerenciar compartilhamento
  const generateShareLink = (token) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/treino-publico/${token}`
  }

  const handleGenerateLink = async () => {
    try {
      setSubmitting(true)
      setSubmittingMessage('🔗 Gerando link de compartilhamento...')

      // Gerar token único
      const newToken = crypto.randomUUID()
      const newShareLink = generateShareLink(newToken)

      setLinkToken(newToken)
      setShareLink(newShareLink)

      // Atualizar o campo link_ativo no formulário
      methods.setValue('link_ativo', true)

      setSnackbar({
        open: true,
        message: 'Link de compartilhamento gerado com sucesso!',
        severity: 'success'
      })

    } catch (error) {
      console.error('❌ Erro ao gerar link:', error)
      setSnackbar({
        open: true,
        message: 'Erro ao gerar link de compartilhamento',
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
      setSubmittingMessage('')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopySuccess(true)

      setSnackbar({
        open: true,
        message: 'Link copiado para a área de transferência!',
        severity: 'success'
      })

      // Reset do feedback visual após 3 segundos
      setTimeout(() => {
        setCopySuccess(false)
      }, 3000)

    } catch (error) {
      console.error('❌ Erro ao copiar link:', error)
      setSnackbar({
        open: true,
        message: 'Erro ao copiar link',
        severity: 'error'
      })
    }
  }

  const handleRegenerateLink = async () => {
    try {
      const newToken = crypto.randomUUID()
      const newShareLink = generateShareLink(newToken)

      setLinkToken(newToken)
      setShareLink(newShareLink)
      setCopySuccess(false)

      setSnackbar({
        open: true,
        message: 'Novo link de compartilhamento gerado!',
        severity: 'success'
      })

    } catch (error) {
      console.error('❌ Erro ao regenerar link:', error)
      setSnackbar({
        open: true,
        message: 'Erro ao regenerar link',
        severity: 'error'
      })
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      setSubmittingMessage(isEditMode ? '🔄 Atualizando treino...' : '💾 Salvando treino...')
      console.log('📋 Dados do formulário:', data)

      // Preparar dados para o CreateTrainingDTO
      const trainingName = generateTrainingName(data.semana, data.data)
      const trainingData = {
        training_week_id: data.semana,
        name: trainingName,
        scheduled_date: data.data.toISOString().split('T')[0], // Formato YYYY-MM-DD
        description: data.observacoes || undefined,
        estimated_duration_minutes: 90, // valor padrão, pode ser ajustado depois
        movement_pattern_id: data.padrao_movimento || null, // Incluir padrão de movimento
        // Incluir dados de compartilhamento se o link estiver ativo
        ...(data.link_ativo && linkToken && {
          share_token: linkToken,
          share_status: 'public'
        })
      }

      let training

      if (isEditMode) {
        console.log('🔄 Atualizando treino:', editingTrainingId, trainingData)
        training = await trainingService.updateTraining(editingTrainingId, trainingData)
        console.log('✅ Treino atualizado com sucesso:', training)
      } else {
        console.log('🚀 Criando treino com dados:', trainingData)
        training = await trainingService.createTraining(trainingData)
        console.log('✅ Treino criado com sucesso:', training)
      }

      // Criar/atualizar os blocos do treino com todos os exercícios
      console.log('🛠️ Processando blocos do treino...')
      if (isEditMode) {
        console.log('🔄 Atualizando blocos do treino existente...')
        await updateTrainingBlocks(training.id)
      } else {
        await createTrainingBlocks(training.id)
      }
      console.log('✅ Blocos processados com sucesso!')

      // Mostrar feedback de sucesso
      setSnackbar({
        open: true,
        message: isEditMode
          ? 'Treino atualizado com sucesso!'
          : 'Treino criado com sucesso! Agora você pode gerar o link de compartilhamento.',
        severity: 'success'
      })

      // Se for criação, redirecionar para o modo de edição do treino recém-criado
      if (!isEditMode) {
        console.log('🔄 Redirecionando para modo de edição do treino:', training.id)
        setTimeout(() => {
          navigate(`/pages/treinos/${training.id}/editar`)
        }, 1500)
      }

    } catch (error) {
      console.error('❌ Erro ao criar treino:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao criar treino. Tente novamente.',
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
      setSubmittingMessage('')
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Loading indicator for training data */}
      {loadingTrainingData && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              Carregando dados do treino...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Main content - hidden when loading */}
      {!loadingTrainingData && (
        <>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight="700" mb={1}>
                {isEditMode ? 'Editar Treino' : 'Criar Treino'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isEditMode
                  ? 'Modifique os campos abaixo para atualizar o treino.'
                  : 'Preencha os campos abaixo para criar um treino completo.'
                }
              </Typography>
            </Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/pages/treinos')}
              variant="outlined"
            >
              Voltar
            </Button>
          </Stack>

          {/* Formulário */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="column" spacing={4}>
                {/* Card: Informações Básicas */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Informações Básicas
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={4}>
                      {/* Primeira linha: 3 campos lado a lado (responsivo) */}
                      <Grid item xs={12} md={4}>
                        <FormSelect
                          name="padrao_movimento"
                          label="Padrão de Movimento"
                          options={loading ? [{ id: '', label: 'Carregando...' }] : padroesMovimentoOptions}
                          disabled={loading || submitting}
                          required
                        />
                        {loadError && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            Erro ao carregar padrões: {loadError}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <FormSelect
                          name="semana"
                          label="Semana"
                          options={loading ? [{ id: '', label: 'Carregando...' }] : semanasOptions}
                          disabled={loading || submitting}
                          required
                        />
                        {loadError && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            Erro ao carregar semanas: {loadError}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <FormDatePicker
                          name="data"
                          label="Data do Treino"
                          disabled={submitting}
                          required
                          highlightStartDate={weekStartDate}
                          highlightEndDate={weekEndDate}
                        />
                      </Grid>

                      {/* Segunda linha: Observações ocupando toda largura */}
                      <Grid item xs={12}>
                        <FormInput
                          name="observacoes"
                          label="Observações Gerais (visíveis para o aluno)"
                          multiline
                          rows={2}
                          disabled={submitting}
                        />
                      </Grid>

                      {/* Terceira linha: Checkbox ocupando toda largura */}
                      <Grid item xs={12}>
                        <FormCheckbox
                          name="link_ativo"
                          label="Link de compartilhamento ativo"
                          disabled={submitting}
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
                          disabled={submitting}
                        >
                          Aplicar Blocos Padrão
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={handleClearAllBlocks}
                          color="error"
                          disabled={submitting}
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
                          sx={{
                            mb: 1,
                            backgroundColor: 'info.main', // #F4F7FE
                            color: 'primary.main', // #4318FF
                            border: 'none',
                            fontWeight: 700,
                            '&.MuiChip-colorPrimary': {
                              backgroundColor: 'info.main',
                              color: 'primary.main',
                              border: 'none'
                            }
                          }}
                        />
                      </Box>
                    )}
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      {/* Mobilidade Articular */}
                      <Grid item md={6} lg={4} xs={12}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1" fontWeight="600">
                            Mobilidade Articular
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog('mobilidade')}
                            disabled={submitting}
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
                                    disabled={submitting}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                }
                              >
                                <ListItemText
                                  primary={typeof item === 'string' ? item : item.nome}
                                  secondary={typeof item === 'object' && item.exercicioId ? 'Exercício do banco' : undefined}
                                />
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
                            disabled={submitting}
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
                                      disabled={submitting}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      edge="end"
                                      size="small"
                                      onClick={() => handleRemoveItem('core', index)}
                                      disabled={submitting}
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
                            disabled={submitting}
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
                                  secondary={formatProtocol(item)}
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
                                  secondary={formatProtocol(item)}
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

                {/* Card: Compartilhamento */}
                {editingTrainingId && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        🔗 Compartilhamento do Treino
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Gere um link para compartilhar este treino com seus alunos
                      </Typography>
                      <Divider sx={{ mb: 3 }} />

                      {shareLink ? (
                        <Grid container spacing={3}>
                          {/* Status do Link */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircleIcon color="success" />
                              <Typography variant="body2" color="success.main" fontWeight={600}>
                                Link ativo e pronto para compartilhamento
                              </Typography>
                            </Box>
                          </Grid>

                          {/* Campo do Link */}
                          <Grid item xs={12}>
                            <TextField
                              label="Link de Compartilhamento"
                              value={shareLink}
                              InputProps={{
                                readOnly: true,
                                startAdornment: (
                                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                    <LinkIcon color="primary" fontSize="small" />
                                  </Box>
                                ),
                                endAdornment: (
                                  <IconButton
                                    onClick={handleCopyLink}
                                    color={copySuccess ? 'success' : 'primary'}
                                    sx={{ transition: 'all 0.3s ease' }}
                                  >
                                    {copySuccess ? <CheckCircleIcon /> : <CopyIcon />}
                                  </IconButton>
                                ),
                              }}
                              fullWidth
                              helperText={copySuccess ? "Link copiado com sucesso! ✅" : "Clique no ícone para copiar o link"}
                              FormHelperTextProps={{
                                sx: { color: copySuccess ? 'success.main' : 'text.secondary' }
                              }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  backgroundColor: 'action.hover',
                                  '&:hover': {
                                    backgroundColor: 'action.selected'
                                  }
                                }
                              }}
                            />
                          </Grid>

                          <Grid item xs={12}>

                            {/* Instruções */}
                            <Paper sx={{ p: 2, bgcolor: 'info.lighter', border: 1, borderColor: 'info.light' }}>
                              <Typography variant="body2" color="info.dark">
                                <strong>Como usar:</strong>
                              </Typography>
                              <Typography variant="body2" color="info.dark" sx={{ mt: 1 }}>
                                • Copie e cole o link para enviar ao seu aluno<br />
                                • O aluno poderá visualizar o treino sem fazer login<br />
                                • Para desativar, desmarque "Link de compartilhamento ativo" acima
                              </Typography>
                            </Paper>



                            {/* Botão para regenerar */}
                            <Button
                              variant="outlined"
                              startIcon={<ShareIcon />}
                              onClick={handleRegenerateLink}
                              sx={{ alignSelf: 'flex-start' }}
                            >
                              Gerar Novo Link
                            </Button>
                          </Grid>
                        </Grid>
                    ) : (
                    <Stack spacing={2} alignItems="center">
                      <Box sx={{ textAlign: 'center' }}>
                        <ShareIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          Nenhum link de compartilhamento criado
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Clique no botão abaixo para gerar um link único
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<ShareIcon />}
                        onClick={handleGenerateLink}
                        size="large"
                        disabled={submitting}
                      >
                        {submitting ? 'Gerando...' : 'Gerar Link de Compartilhamento'}
                      </Button>
                    </Stack>
                      )}
                  </CardContent>
                  </Card>
                )}

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
                    disabled={submitting}
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
                disabled={submitting || loading || loadingTrainingData}
              >
                {submitting
                  ? (submittingMessage || (isEditMode ? 'Atualizando...' : 'Salvando...'))
                  : (isEditMode ? 'Atualizar Treino' : 'Salvar Treino')
                }
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/pages/treinos')}
                size="large"
                disabled={submitting}
              >
                Cancelar
              </Button>
            </Stack>
          </form>
        </FormProvider>
    </>
  )
}

{/* Dialog para Adicionar/Editar Itens */ }
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
    <Stack spacing={3} sx={{ mt: 4 }}>
      {/* Mobilidade: select de exercícios com padrão mobilidade */}
      {currentSection === 'mobilidade' && (
        <Autocomplete
          options={exerciciosOptions.filter(ex =>
            ex.movement_pattern?.toLowerCase().includes('mobilidade') ||
            ex.label.toLowerCase().includes('mobilidade') ||
            ex.label.toLowerCase().includes('alongamento')
          )}
          value={exerciciosOptions.find(opt => opt.label === formData.nome) || null}
          onChange={(_, newValue) => {
            console.log('🔄 Autocomplete onChange mobilidade:', newValue)
            console.log('📝 formData antes:', formData)

            const newFormData = {
              ...formData,
              exercicioId: newValue?.id || '',
              nome: newValue?.label || ''
            }

            console.log('📝 formData depois:', newFormData)
            setFormData(newFormData)
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Exercício de Mobilidade"
              fullWidth
              helperText="Selecione um exercício de mobilidade do banco de dados"
            />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="Nenhum exercício de mobilidade encontrado"
          loading={loading}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            return (
              <li key={key} {...otherProps}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {option.label}
                  </Typography>
                  {option.movement_pattern && (
                    <Typography variant="caption" color="text.secondary">
                      {option.movement_pattern}
                    </Typography>
                  )}
                </Box>
              </li>
            );
          }}
        />
      )}

      {/* Core: nome, séries, tempo, intervalo */}
      {currentSection === 'core' && (
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12}>
            <Autocomplete
              options={exerciciosOptions}
              value={exerciciosOptions.find(opt => opt.id === formData.exercicioId) || null}
              onChange={(_, newValue) => setFormData({
                ...formData,
                exercicioId: newValue?.id || '',
                nome: newValue?.label || ''
              })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nome do Exercício"
                  fullWidth
                  helperText="Selecione um exercício do banco de dados"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="Nenhum exercício encontrado"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Séries"
              type="number"
              value={formData.series || ''}
              onChange={(e) => setFormData({ ...formData, series: parseInt(e.target.value) })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>                <TextField
            label="Tempo (segundos)"
            type="number"
            value={formData.tempo || ''}
            onChange={(e) => setFormData({ ...formData, tempo: parseInt(e.target.value) })}
            fullWidth
          />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Intervalo (segundos)"
              type="number"
              value={formData.intervalo || ''}
              onChange={(e) => setFormData({ ...formData, intervalo: parseInt(e.target.value) })}
              fullWidth
            />
          </Grid>
        </Grid>
      )}

      {/* Neural: nome, séries, tempo */}
      {currentSection === 'neural' && (
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={exerciciosOptions}
              value={exerciciosOptions.find(opt => opt.id === formData.exercicioId) || null}
              onChange={(_, newValue) => setFormData({
                ...formData,
                exercicioId: newValue?.id || '',
                nome: newValue?.label || ''
              })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nome do Exercício"
                  fullWidth
                  helperText="Selecione um exercício do banco de dados"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="Nenhum exercício encontrado"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Séries"
              type="number"
              value={formData.series || ''}
              onChange={(e) => setFormData({ ...formData, series: parseInt(e.target.value) })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Tempo (segundos)"
              type="number"
              value={formData.tempo || ''}
              onChange={(e) => setFormData({ ...formData, tempo: parseInt(e.target.value) })}
              fullWidth
            />
          </Grid>
        </Grid>
      )}

      {/* Treino 1 e 2: nome, séries, repetições, carga, tempo, intervalo */}
      {(currentSection === 'treino1' || currentSection === 'treino2') && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Autocomplete
              options={exerciciosOptions}
              value={exerciciosOptions.find(opt => opt.id === formData.exercicioId) || null}
              onChange={(_, newValue) => setFormData({
                ...formData,
                exercicioId: newValue?.id || '',
                nome: newValue?.label || ''
              })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nome do Exercício"
                  fullWidth
                  helperText="Selecione um exercício do banco de dados"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="Nenhum exercício encontrado"
              loading={loading}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <TextField
              label="Séries"
              type="number"
              value={formData.series || ''}
              onChange={(e) => {
                const series = parseInt(e.target.value) || 0
                const tempo = formData.tempoSegundos || 0
                const intervalo = formData.intervaloSegundos || 0
                const tempoTotal = series > 0 ? (tempo + intervalo) * series : 0

                setFormData({
                  ...formData,
                  series: series,
                  tempoTotal: tempoTotal
                })
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              label="Repetições"
              value={formData.repeticoes || ''}
              onChange={(e) => setFormData({ ...formData, repeticoes: e.target.value })}
              placeholder="Ex: 8-10"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              label="Carga"
              value={formData.carga || ''}
              onChange={(e) => setFormData({ ...formData, carga: e.target.value })}
              placeholder="Ex: 80kg ou Corporal"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              label="Tempo (seg)"
              type="number"
              value={formData.tempoSegundos || ''}
              onChange={(e) => {
                const tempo = parseInt(e.target.value) || 0
                const intervalo = formData.intervaloSegundos || 0
                const series = formData.series || 0
                const tempoTotal = series > 0 ? (tempo + intervalo) * series : 0

                setFormData({
                  ...formData,
                  tempoSegundos: tempo,
                  tempoTotal: tempoTotal
                })
              }}
              fullWidth
              helperText="Duração de cada série em segundos"
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              label="Intervalo (seg)"
              type="number"
              value={formData.intervaloSegundos || ''}
              onChange={(e) => {
                const intervalo = parseInt(e.target.value) || 0
                const tempo = formData.tempoSegundos || 0
                const series = formData.series || 0
                const tempoTotal = series > 0 ? (tempo + intervalo) * series : 0

                setFormData({
                  ...formData,
                  intervaloSegundos: intervalo,
                  tempoTotal: tempoTotal
                })
              }}
              fullWidth
              helperText="Descanso entre séries em segundos"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Tempo Total"
              value={formData.tempoTotal || 0}
              fullWidth
              disabled
              helperText="Calculado automaticamente: (Tempo + Intervalo) × Séries"
              InputProps={{
                endAdornment: <span style={{ color: '#666', fontSize: '0.875rem' }}>segundos</span>
              }}
            />
          </Grid>
        </Grid>
      )}

      {/* Condicionamento: nome, séries, tempo, intervalo */}
      {currentSection === 'condicionamento' && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Autocomplete
              options={exerciciosOptions}
              value={exerciciosOptions.find(opt => opt.id === formData.exercicioId) || null}
              onChange={(_, newValue) => setFormData({
                ...formData,
                exercicioId: newValue?.id || '',
                nome: newValue?.label || ''
              })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nome do Exercício"
                  fullWidth
                  helperText="Selecione um exercício do banco de dados"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="Nenhum exercício encontrado"
              loading={loading}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="Séries"
              type="number"
              value={formData.series || ''}
              onChange={(e) => {
                const series = parseInt(e.target.value) || 0
                const tempo = formData.tempoSegundos || 0
                const intervalo = formData.intervaloSegundos || 0
                const tempoTotal = series > 0 ? (tempo + intervalo) * series : 0

                setFormData({
                  ...formData,
                  series: series,
                  tempoTotal: tempoTotal
                })
              }}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="Repetições"
              value={formData.repeticoes || ''}
              onChange={(e) => setFormData({ ...formData, repeticoes: e.target.value })}
              placeholder="Ex: 8-10"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="Tempo (seg)"
              type="number"
              value={formData.tempoSegundos || ''}
              onChange={(e) => {
                const tempo = parseInt(e.target.value) || 0
                const intervalo = formData.intervaloSegundos || 0
                const series = formData.series || 0
                const tempoTotal = series > 0 ? (tempo + intervalo) * series : 0

                setFormData({
                  ...formData,
                  tempoSegundos: tempo,
                  tempoTotal: tempoTotal
                })
              }}
              fullWidth
              helperText="Duração de cada série em segundos"
            />
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="Intervalo (seg)"
              type="number"
              value={formData.intervaloSegundos || ''}
              onChange={(e) => {
                const intervalo = parseInt(e.target.value) || 0
                const tempo = formData.tempoSegundos || 0
                const series = formData.series || 0
                const tempoTotal = series > 0 ? (tempo + intervalo) * series : 0

                setFormData({
                  ...formData,
                  intervaloSegundos: intervalo,
                  tempoTotal: tempoTotal
                })
              }}
              fullWidth
              helperText="Descanso entre séries em segundos"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Tempo Total"
              value={formData.tempoTotal || 0}
              fullWidth
              disabled
              helperText="Calculado automaticamente: (Tempo + Intervalo) × Séries"
              InputProps={{
                endAdornment: <span style={{ color: '#666', fontSize: '0.875rem' }}>segundos</span>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Observações"
              value={formData.observacoes || ''}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Ex: HIIT, Tabata, Circuito..."
              fullWidth
              helperText="Informações adicionais sobre o protocolo"
            />
          </Grid>
        </Grid>
      )}
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialog}>Cancelar</Button>
    <Button
      variant="contained"
      onClick={() => {
        console.log('🔘 Botão salvar clicado - formData atual:', formData)
        console.log('🔘 formData.nome:', formData.nome)
        console.log('🔘 Botão desabilitado?', !formData.nome)
        handleSaveItem()
      }}
      disabled={!formData.nome}
    >
      Salvar
    </Button>
  </DialogActions>
</Dialog>

{/* Snackbar para feedback */ }
<Snackbar
  open={snackbar.open}
  autoHideDuration={6000}
  onClose={() => setSnackbar({ ...snackbar, open: false })}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
>
  <Alert
    onClose={() => setSnackbar({ ...snackbar, open: false })}
    severity={snackbar.severity}
    variant="filled"
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
    </Container >
  )
}

export default TreinoForm;


