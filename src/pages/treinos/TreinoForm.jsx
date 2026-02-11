// Formulário de Treino - Criar/Editar
import { yupResolver } from '@hookform/resolvers/yup'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import * as yup from 'yup'

// Imports dos componentes
import { AddExerciseModal } from '../../components/treinos/AddExerciseModal'
import { TrainingBlockSection } from '../../components/treinos/TrainingBlockSection'

// Imports dos serviços
import logoImage from '../../assets/images/logo-main.png'
import { exerciseService } from '../../services/exerciseService'
import { movementPatternService } from '../../services/movementPatternService'
import { trainingService } from '../../services/trainingService'
import { videoService } from '../../services/videoService'
import { weekService } from '../../services/weekService'
import { formatISODateOnlyLocal } from '../../utils/date'
import { generateTreinoPDF } from '../../utils/pdf/generateTreinoPDF'
import { imageToBase64 } from '../../utils/pdf/pdfUtils'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  PictureAsPdf as PdfIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Timer as TimerIcon,
  VideoLibrary as VideoIcon
} from '@mui/icons-material'

import {
  FormCheckbox,
  FormDatePicker,
  FormInput,
  FormSelect,
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
  const { id: editingTrainingId } = useParams()
  const searchParams = new URLSearchParams(location.search)
  const isEditMode = !!editingTrainingId

  const isDev =
    !!import.meta.env?.DEV &&
    import.meta.env?.MODE !== 'test' &&
    // Vitest sets import.meta.env.VITEST; keep test output clean.
    !import.meta.env?.VITEST
  const devLog = (...args) => {
    if (isDev) console.log(...args)
  }

  // Estados para cada seção do treino
  const [mobilidadeItems, setMobilidadeItems] = useState([])
  const [coreItems, setCoreItems] = useState([])
  const [neuralItems, setNeuralItems] = useState([])
  const [treinoBloco1, setTreinoBloco1] = useState([])
  const [treinoBloco2, setTreinoBloco2] = useState([])
  const [condicionamentoItems, setCondicionamentoItems] = useState([])

  // Estados para o novo modal de exercício
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false)
  const [addExerciseModalSection, setAddExerciseModalSection] = useState('')
  const [trainingBlocks, setTrainingBlocks] = useState([])
  const [editingModalIndex, setEditingModalIndex] = useState(null)
  const [editingModalData, setEditingModalData] = useState(null)
  const [exerciseModalEditMode, setExerciseModalEditMode] = useState(false)
  const editModalFetchIdRef = useRef(0)
  const exercisesLiteCacheRef = useRef(null)

  // Confirmação ao sair para criação de semana
  const [confirmLeaveSemanasOpen, setConfirmLeaveSemanasOpen] = useState(false)
  const handleOpenConfirmSemanas = () => setConfirmLeaveSemanasOpen(true)
  const handleCloseConfirmSemanas = () => setConfirmLeaveSemanasOpen(false)
  const handleConfirmNavigateToSemanas = () => {
    setConfirmLeaveSemanasOpen(false)
    navigate('/pages/semanas')
  }

  // Confirmação para excluir exercício do bloco
  const [confirmDeleteExerciseOpen, setConfirmDeleteExerciseOpen] = useState(false)
  const [pendingDeleteExercise, setPendingDeleteExercise] = useState(null)

  const sectionRegistry = {
    mobilidade: {
      label: 'Mobilidade Articular',
      items: mobilidadeItems,
      setItems: setMobilidadeItems
    },
    core: {
      label: 'Ativação de Core',
      items: coreItems,
      setItems: setCoreItems
    },
    neural: {
      label: 'Ativação Neural',
      items: neuralItems,
      setItems: setNeuralItems
    },
    treino1: {
      label: 'Treino Bloco 01',
      items: treinoBloco1,
      setItems: setTreinoBloco1
    },
    treino2: {
      label: 'Treino Bloco 02',
      items: treinoBloco2,
      setItems: setTreinoBloco2
    },
    condicionamento: {
      label: 'Condicionamento Físico',
      items: condicionamentoItems,
      setItems: setCondicionamentoItems
    }
  }

  const updateSectionItems = (section, updater) => {
    const entry = sectionRegistry[section]
    if (!entry) return
    entry.setItems((prev) => updater(prev))
  }

  const getSectionLabel = (section) => {
    return sectionRegistry[section]?.label || 'Bloco'
  }

  const getExerciseDisplayName = (item) => {
    if (!item) return ''
    if (typeof item === 'string') return item
    if (typeof item === 'object') return item.nome || item.name || item.videoName || ''
    return ''
  }

  const handleCloseConfirmDeleteExercise = () => {
    setConfirmDeleteExerciseOpen(false)
    setPendingDeleteExercise(null)
  }

  // Configuração do React Hook Form
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      data: null,
      semana: '',
      padrao_movimento: '',
      observacoes: '',
      observacoes_internas: '',
      link_ativo: true,
    },
  })

  const { handleSubmit, formState: { errors }, watch, setValue } = methods

  // Estados para dados dos selects
  const [semanasOptions, setSemanasOptions] = useState([])
  const [semanasCompletas, setSemanasCompletas] = useState([]) // Semanas com todas as informações
  const [padroesMovimentoOptions, setPadroesMovimentoOptions] = useState([])

  // Estados para destacar dias da semana no date picker
  const [weekStartDate, setWeekStartDate] = useState(null)

  // Responsividade tratada via props responsivas (sx/breakpoints)
  const [weekEndDate, setWeekEndDate] = useState(null)

  const [modalOpen, setModalOpen] = useState(false);

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
      devLog('🔄 Nome do treino atualizado automaticamente:', newName)
    }
  }, [watchedValues, semanasOptions, loading, loadingTrainingData])

  // Estados para compartilhamento
  const [shareLink, setShareLink] = useState('')
  const [linkToken, setLinkToken] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  // Estado para nome do treino (usado no breadcrumb)
  const [trainingName, setTrainingName] = useState('')

  // Função para gerar nome do treino baseado na semana e data
  const generateTrainingName = (weekId, date) => {
    if (!weekId || !date) {
      return 'Treino'
    }

    // Encontrar a semana selecionada
    const selectedWeek = semanasOptions.find(w => w.id === weekId)
    if (!selectedWeek) {
      return 'Treino'
    }

    // Extrair número da semana do label (assumindo formato como "Semana 01 - ...")
    const weekMatch = selectedWeek.label.match(/\d+/)
    const weekNumber = weekMatch ? weekMatch[0].padStart(2, '0') : '01'

    // Converter data para dia da semana (1=domingo, 2=segunda, etc)
    const dayOfWeek = new Date(date).getDay() + 1 // getDay() retorna 0=domingo, queremos 1=domingo
    const dayNumber = dayOfWeek.toString().padStart(2, '0')

    const finalName = `Treino S${weekNumber}-${dayNumber}`

    // Atualizar estado
    setTrainingName(finalName)

    // Salvar nome no sessionStorage para o breadcrumb (se estiver editando)
    if (editingTrainingId) {
      sessionStorage.setItem(`breadcrumb_${editingTrainingId}`, finalName)
    }

    return finalName
  }

  // Carregar dados dos selects ao montar o componente
  useEffect(() => {
    const loadSelectData = async () => {
      try {
        setLoading(true)
        setLoadError(null)

        // Buscar semanas de treino
        const semanas = await weekService.getAllTrainingWeeksLite()
        const semanasFormatted = semanas.map(semana => ({
          id: semana.id,
          label: `${semana.name} - ${semana.week_focus?.name || 'Sem foco'}`
        }))

        // Buscar padrões de movimento
        const padroes = await movementPatternService.getAllMovementPatternsLite()
        const padroesFormatted = padroes.map(padrao => ({
          id: padrao.id,
          label: padrao.name
        }))

        setSemanasOptions(semanasFormatted)
        setSemanasCompletas(semanas) // Armazenar semanas completas com datas
        setPadroesMovimentoOptions(padroesFormatted)

        // Criar opções de training blocks baseadas nas seções disponíveis
        const blocks = [
          { id: 'mobilidade', label: 'Mobilidade Articular', type: 'MOBILIDADE_ARTICULAR' },
          { id: 'core', label: 'Ativação de Core', type: 'ATIVACAO_CORE' },
          { id: 'neural', label: 'Ativação Neural', type: 'ATIVACAO_NEURAL' },
          { id: 'treino1', label: 'Bloco Principal 1', type: 'TREINO_PRINCIPAL' },
          { id: 'treino2', label: 'Bloco Principal 2', type: 'TREINO_PRINCIPAL' },
          { id: 'condicionamento', label: 'Condicionamento Físico', type: 'CONDICIONAMENTO_FISICO' }
        ]
        setTrainingBlocks(blocks)

        devLog('🔍 Debug - Opções de semanas:', semanasFormatted)
        devLog('🔍 Debug - Opções de padrões:', padroesFormatted)

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
        devLog('✅ Preenchendo semana automaticamente:', semanaValida.label)
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
        devLog('📅 Destacando dias da semana:', semanaCompleta.start_date, '-', semanaCompleta.end_date)
        setWeekStartDate(semanaCompleta.start_date)
        setWeekEndDate(semanaCompleta.end_date)
      } else {
        devLog('⚠️ Semana sem datas definidas, não destacando dias')
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
        devLog('🔄 Carregando dados do treino:', editingTrainingId)

        const trainingData = await trainingService.getTrainingById(editingTrainingId)

        if (!isMounted) return; // Evitar atualização se o componente foi desmontado

        if (!trainingData) {
          throw new Error('Treino não encontrado')
        }

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

        // Salvar nome do treino no sessionStorage para o breadcrumb (genérico)
        const currentName = trainingData.name || 'Treino'
        setTrainingName(currentName)
        sessionStorage.setItem(`breadcrumb_${editingTrainingId}`, currentName)

        devLog('🔍 Dados formatados para o formulário:', formData)
        devLog('📊 Opções válidas - Semanas:', semanasOptions.length, 'Padrões:', padroesMovimentoOptions.length)

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
          // Para mobilidade, preservar todos os campos como nas outras seções
          const mobilityItems = block.exercise_prescriptions?.map(prescription => {
            const series = prescription.sets || 0
            const tempoSegundos = prescription.duration_seconds || 0
            const intervaloSegundos = prescription.rest_seconds || 0
            const tempoTotal = series > 0 ? (tempoSegundos + intervaloSegundos) * series : 0

            return {
              nome: prescription.exercise?.name || 'Exercício não encontrado',
              exercicioId: prescription.exercise?.id,
              videoId: prescription.video_id || null,
              videoName: prescription.video?.title || null,
              series: prescription.sets || '',
              repeticoes: prescription.reps || '',
              carga: prescription.weight_kg || '',
              tempoSegundos: prescription.duration_seconds || '',
              intervaloSegundos: prescription.rest_seconds || '',
              tempoTotal: tempoTotal,
              observacoes: prescription.notes || ''
            }
          }) || []
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
            devLog('📦 [DEBUG] Carregando exercícios para Bloco Principal 1:', principalItems.length, 'itens')
          } else if (block.name === 'Bloco Principal 2' || block.order_index === 5) {
            setTreinoBloco2(principalItems)
            devLog('📦 [DEBUG] Carregando exercícios para Bloco Principal 2:', principalItems.length, 'itens')
          } else {
            // Fallback: se não conseguir identificar, dividir pela metade (comportamento antigo)
            const midPoint = Math.ceil(principalItems.length / 2)
            setTreinoBloco1(principalItems.slice(0, midPoint))
            setTreinoBloco2(principalItems.slice(midPoint))
            devLog('📦 [DEBUG] Dividindo exercícios principal (fallback) - Bloco 1:', midPoint, '- Bloco 2:', principalItems.length - midPoint)
          }
          break
        case 'CONDICIONAMENTO_FISICO':
          const condicionamentoItems = block.exercise_prescriptions?.map(prescription => ({
            nome: prescription.exercise?.name || 'Exercício não encontrado',
            exercicioId: prescription.exercise?.id,
            series: prescription.sets || '',
            repeticoes: prescription.reps || '',
            tempoSegundos: prescription.duration_seconds || '',
            intervaloSegundos: prescription.rest_seconds || '',
            observacoes: prescription.notes || ''
          })) || []
          setCondicionamentoItems(condicionamentoItems)
          break
        default:
          console.warn('Tipo de bloco não reconhecido:', block.block_type)
      }
    })
  }

  // Handler para abrir modal de edição
  const handleOpenEditExerciseModal = async (section, index, item) => {
    const fetchId = ++editModalFetchIdRef.current

    setEditingModalIndex(index)
    setAddExerciseModalSection(section)

    const configData = {
      series: item?.series || 3,
      repetitions: item?.repeticoes || '12',
      weight_kg: item?.carga ? item.carga.toString().replace('kg', '').trim() : '',
      duration_seconds: item?.tempoSegundos || null,
      rest_seconds: item?.intervaloSegundos || 60,
      notes: item?.observacoes || ''
    }

    const fallbackExercise = item?.exercicioId
      ? { id: item.exercicioId, name: item?.nome || 'Exercício' }
      : null

    const fallbackVideo = item?.videoId
      ? { id: item.videoId, title: item?.videoName || '' }
      : null

    // Se não temos exercicioId, abrir no fluxo de seleção (mais resiliente)
    setExerciseModalEditMode(!!item?.exercicioId)

    // Abrir imediatamente com dados mínimos; enriquecer em background.
    setEditingModalData({
      exercise: fallbackExercise,
      video: fallbackVideo,
      config: configData,
    })
    setAddExerciseModalOpen(true)

    const results = await Promise.allSettled([
      item?.exercicioId ? exerciseService.getExerciseById(item.exercicioId) : Promise.resolve(null),
      item?.videoId ? videoService.getVideoById(item.videoId) : Promise.resolve(null),
    ])

    if (editModalFetchIdRef.current !== fetchId) return

    const exerciseResult = results[0]
    const videoResult = results[1]

    const exerciseData = exerciseResult.status === 'fulfilled' ? exerciseResult.value : null
    const videoData = videoResult.status === 'fulfilled' ? videoResult.value : null

    const failedExercise = !!item?.exercicioId && (!exerciseData || exerciseResult.status === 'rejected')
    const failedVideo = !!item?.videoId && (!videoData || videoResult.status === 'rejected')

    if (failedExercise || failedVideo) {
      console.error('❌ Erro ao carregar detalhes para edição:', {
        failedExercise,
        failedVideo,
        exerciseError: exerciseResult.status === 'rejected' ? exerciseResult.reason : null,
        videoError: videoResult.status === 'rejected' ? videoResult.reason : null,
      })

      setSnackbar({
        open: true,
        message: 'Não foi possível carregar detalhes do exercício/vídeo. Você ainda pode editar.',
        severity: 'warning'
      })
    }

    setEditingModalData((prev) => ({
      ...(prev || {}),
      exercise: exerciseData || prev?.exercise || null,
      video: videoData || prev?.video || null,
      config: prev?.config || configData,
    }))
  }

  const removeItemFromSection = (section, index) => {
    updateSectionItems(section, (items) => items.filter((_, i) => i !== index))
  }

  // Handlers para remover itens (com confirmação)
  const handleRemoveItem = (section, index, item) => {
    if (submitting) return

    setPendingDeleteExercise({
      section,
      index,
      itemName: getExerciseDisplayName(item)
    })
    setConfirmDeleteExerciseOpen(true)
  }

  const handleConfirmDeleteExercise = () => {
    if (!pendingDeleteExercise) return

    removeItemFromSection(pendingDeleteExercise.section, pendingDeleteExercise.index)
    handleCloseConfirmDeleteExercise()
  }

  // Handlers para o novo modal de exercício com vídeo
  const handleOpenAddExerciseModal = (section) => {
    editModalFetchIdRef.current++
    setExerciseModalEditMode(false)
    setEditingModalIndex(null)
    setEditingModalData(null)
    setAddExerciseModalSection(section)
    setAddExerciseModalOpen(true)
  }

  const handleCloseAddExerciseModal = () => {
    editModalFetchIdRef.current++
    setAddExerciseModalOpen(false)
    setAddExerciseModalSection('')
    setEditingModalIndex(null)
    setEditingModalData(null)
    setExerciseModalEditMode(false)
  }

  const handleSaveExerciseWithVideo = (data) => {
    devLog('💾 Salvando exercício com vídeo:', data)

    const { exercise, video, config } = data

    // Criar objeto do exercício com todos os dados
    const exerciseItem = {
      exercicioId: exercise.id,
      nome: exercise.name,
      videoId: video?.id || null,
      videoName: video?.name || null,
      series: config.series || 3,
      repeticoes: config.repetitions || '12',
      carga: config.weight_kg || '',
      tempoSegundos: config.duration_seconds || null,
      intervaloSegundos: config.rest_seconds || 60,
      observacoes: config.notes || ''
    }

    const activeSection = addExerciseModalSection
    const isEditing = editingModalIndex !== null

    updateSectionItems(activeSection, (items) => {
      if (!isEditing) return [...items, exerciseItem]
      const next = [...items]
      next[editingModalIndex] = exerciseItem
      return next
    })

    devLog(
      isEditing
        ? `✏️ Exercício atualizado em "${getSectionLabel(activeSection)}"`
        : `➕ Exercício adicionado em "${getSectionLabel(activeSection)}"`
    )

    setSnackbar({
      open: true,
      message: isEditing
        ? `Exercício "${exercise.name}" atualizado com sucesso!`
        : `Exercício "${exercise.name}" adicionado com sucesso!`,
      severity: 'success'
    })

    handleCloseAddExerciseModal()
  }

  // Calcular tempo total do treino bloco
  const calcularTempoTotal = (items) => {
    const totalSegundos = items.reduce((acc, item) => acc + (item.tempoTotal || 0), 0)
    const minutos = Math.floor(totalSegundos / 60)
    const segundos = totalSegundos % 60
    return `${minutos}min ${segundos}s`
  }

  const getTrainingBlockDrafts = () => [
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

  const trainingBlockItemHasProtocol = (item) => {
    return !!(
      item?.series ||
      item?.tempoSegundos ||
      item?.intervaloSegundos ||
      item?.repeticoes ||
      item?.duracao ||
      item?.observacoes
    )
  }

  const persistTrainingBlockItem = async ({ mode, blockId, blockType, item, orderIndex }) => {
    if (typeof item === 'string') {
      await createExerciseFromString(blockId, item, orderIndex, blockType)
      return
    }

    if (!item) return

    if (mode === 'create') {
      if (item?.nome) {
        await createExerciseFromObject(blockId, item, orderIndex)
      }
      return
    }

    // mode === 'update' (preserva a lógica atual mais defensiva)
    if (item?.nome && trainingBlockItemHasProtocol(item)) {
      await createExerciseFromObject(blockId, item, orderIndex)
    } else if (item?.nome && item?.exercicioId) {
      await createExerciseFromId(blockId, item.exercicioId, orderIndex, blockType, item)
    } else if (item?.nome) {
      await createExerciseFromString(blockId, item.nome, orderIndex, blockType)
    }
  }

  const persistTrainingBlocks = async ({
    trainingId,
    blockDrafts,
    mode,
    onProgressMessage
  }) => {
    const blocksWithItems = blockDrafts.filter((block) => block.items && block.items.length > 0)

    devLog('📊 Criando', blocksWithItems.length, 'blocos com exercícios')

    for (let blockIndex = 0; blockIndex < blocksWithItems.length; blockIndex++) {
      const blockConfig = blocksWithItems[blockIndex]
      try {
        if (onProgressMessage) {
          onProgressMessage(
            `🛠️ Criando bloco ${blockIndex + 1}/${blocksWithItems.length}: ${blockConfig.name}`
          )
        }

        const blockData = {
          training_id: trainingId,
          name: blockConfig.name,
          block_type: blockConfig.type,
          order_index: blockConfig.order,
          rest_between_exercises_seconds: 60
        }

        devLog('🛠️ Criando bloco:', blockData.name)
        const createdBlock = await trainingService.createTrainingBlock(blockData)

        for (let i = 0; i < blockConfig.items.length; i++) {
          await persistTrainingBlockItem({
            mode,
            blockId: createdBlock.id,
            blockType: blockConfig.type,
            item: blockConfig.items[i],
            orderIndex: i + 1
          })
        }

        devLog('✅ Bloco', blockData.name, 'criado com', blockConfig.items.length, 'exercícios')
      } catch (error) {
        console.error('❌ Erro ao criar bloco', blockConfig.name, ':', error)
        throw error
      }
    }
  }

  // Função para criar os blocos do treino no banco
  const createTrainingBlocks = async (trainingId) => {
    const blockDrafts = getTrainingBlockDrafts()

    devLog('🔍 [DEBUG] Estados dos blocos antes do filtro:')
    devLog('- Mobilidade:', mobilidadeItems.length, 'itens')
    devLog('- Core:', coreItems.length, 'itens')
    devLog('- Neural:', neuralItems.length, 'itens')
    devLog('- Bloco 1:', treinoBloco1.length, 'itens')
    devLog('- Bloco 2:', treinoBloco2.length, 'itens')
    devLog('- Condicionamento:', condicionamentoItems.length, 'itens')

    await persistTrainingBlocks({
      trainingId,
      blockDrafts,
      mode: 'create',
      onProgressMessage: setSubmittingMessage
    })
  }

  // Função auxiliar para criar exercício a partir de string
  const createExerciseFromString = async (blockId, exerciseName, order, blockType) => {
    try {
      // Buscar exercícios existentes (cache local para evitar várias requisições no mesmo salvamento)
      if (!exercisesLiteCacheRef.current) {
        exercisesLiteCacheRef.current = await exerciseService.getExercisesLiteForMatching()
      }
      const exercises = exercisesLiteCacheRef.current
      let exercise = null

      devLog(`🔍 Buscando exercício '${exerciseName}' para bloco tipo '${blockType}'`)

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

        devLog(`🎯 Exercício de mobilidade ${exercise ? 'encontrado' : 'não encontrado'}:`,
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
        devLog(`✅ Exercício '${exercise.name}' adicionado ao bloco com sucesso`)
      } else {
        devLog(`⚠️ Exercício '${exerciseName}' não encontrado no banco, pulando...`)
      }

    } catch (error) {
      console.error('❌ Erro ao processar exercício', exerciseName, ':', error)
      throw error
    }
  }

  // Função auxiliar para criar exercício a partir de ID
  const createExerciseFromId = async (blockId, exerciseId, order, blockType, exerciseData = null) => {
    try {
      devLog(`🔍 Adicionando exercício por ID '${exerciseId}' ao bloco tipo '${blockType}'`)
      devLog(`🔍 Dados do exercício recebidos:`, exerciseData)

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

      await trainingService.addExerciseToBlock(prescriptionData)

      devLog(`✅ Exercício ID '${exerciseId}' adicionado ao bloco com sucesso`)

    } catch (error) {
      console.error('❌ Erro ao processar exercício por ID', exerciseId, ':', error)
      throw error
    }
  }

  // Função auxiliar para criar exercício a partir de objeto
  const createExerciseFromObject = async (blockId, exerciseObj, order) => {
    try {
      devLog('🔍 [createExerciseFromObject] Exercício recebido:', exerciseObj)

      // Se já tem exercicioId, usar diretamente
      if (exerciseObj.exercicioId) {
        devLog('🔍 Usando exercícioId diretamente:', exerciseObj.exercicioId)

        // Preparar dados de prescrição
        let prescriptionData = {
          training_block_id: blockId,
          exercise_id: exerciseObj.exercicioId,
          order_index: order,
          sets: exerciseObj.series || 1,
          rest_seconds: exerciseObj.intervaloSegundos !== undefined && exerciseObj.intervaloSegundos !== '' && exerciseObj.intervaloSegundos !== null ?
            parseInt(exerciseObj.intervaloSegundos) :
            (exerciseObj.intervalo !== undefined && exerciseObj.intervalo !== '' && exerciseObj.intervalo !== null ?
              parseInt(exerciseObj.intervalo) :
              (exerciseObj.rest_seconds !== undefined && exerciseObj.rest_seconds !== '' && exerciseObj.rest_seconds !== null ?
                parseInt(exerciseObj.rest_seconds) : 60))
        }

        // Adicionar video_id se disponível
        if (exerciseObj.videoId) {
          prescriptionData.video_id = exerciseObj.videoId
          devLog('🎥 Adicionando vídeo ao exercício:', exerciseObj.videoName || exerciseObj.videoId)
        }

        // Se tem tempo definido, usar duration_seconds
        if (exerciseObj.tempoSegundos !== undefined && exerciseObj.tempoSegundos !== '' && exerciseObj.tempoSegundos !== null) {
          prescriptionData.duration_seconds = parseInt(exerciseObj.tempoSegundos)
          prescriptionData.reps = null
        } else if (exerciseObj.tempo !== undefined && exerciseObj.tempo !== '' && exerciseObj.tempo !== null) {
          prescriptionData.duration_seconds = parseInt(exerciseObj.tempo)
          prescriptionData.reps = null
        } else if (exerciseObj.duracao && exerciseObj.duracao !== '') {
          // Para condicionamento: duracao vem como string "30s"
          const duracaoNum = parseInt(exerciseObj.duracao.replace('s', ''))
          if (!isNaN(duracaoNum)) {
            prescriptionData.duration_seconds = duracaoNum
            prescriptionData.reps = null
          } else {
            prescriptionData.reps = '1'
            prescriptionData.duration_seconds = null
          }
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

        // Adicionar observações/notes se disponível
        if (exerciseObj.observacoes && exerciseObj.observacoes !== '') {
          prescriptionData.notes = exerciseObj.observacoes
        }

        await trainingService.addExerciseToBlock(prescriptionData)
        devLog(`✅ Exercício '${exerciseObj.nome}' adicionado ao bloco com protocolo`)
        return
      }

      // Se não tem exercicioId, buscar exercício por nome
      const exercises = await exerciseService.getExercisesLiteForMatching()
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
              parseInt(exerciseObj.intervalo) :
              (exerciseObj.rest_seconds !== undefined && exerciseObj.rest_seconds !== '' && exerciseObj.rest_seconds !== null ?
                parseInt(exerciseObj.rest_seconds) : 60))
        }

        // Se tem tempo definido, usar duration_seconds
        if (exerciseObj.tempoSegundos !== undefined && exerciseObj.tempoSegundos !== '' && exerciseObj.tempoSegundos !== null) {
          prescriptionData.duration_seconds = parseInt(exerciseObj.tempoSegundos)
          prescriptionData.reps = null
        } else if (exerciseObj.tempo !== undefined && exerciseObj.tempo !== '' && exerciseObj.tempo !== null) {
          prescriptionData.duration_seconds = parseInt(exerciseObj.tempo)
          prescriptionData.reps = null
        } else if (exerciseObj.duracao && exerciseObj.duracao !== '') {
          // Para condicionamento: duracao vem como string "30s"
          const duracaoNum = parseInt(exerciseObj.duracao.replace('s', ''))
          if (!isNaN(duracaoNum)) {
            prescriptionData.duration_seconds = duracaoNum
            prescriptionData.reps = null
          } else {
            prescriptionData.reps = '1'
            prescriptionData.duration_seconds = null
          }
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

        // Adicionar observações/notes se disponível
        if (exerciseObj.observacoes && exerciseObj.observacoes !== '') {
          prescriptionData.notes = exerciseObj.observacoes
        }

        await trainingService.addExerciseToBlock(prescriptionData)
        devLog(`✅ Exercício '${exercise.name}' adicionado ao bloco com protocolo`)
      } else {
        devLog(`⚠️ Exercício '${exerciseObj.nome}' não encontrado, pulando...`)
      }

    } catch (error) {
      console.error('❌ Erro ao processar exercício', exerciseObj.nome, ':', error)
      throw error
    }
  }

  // Função para atualizar os blocos do treino existente
  const updateTrainingBlocks = async (trainingId) => {
    try {

      // Primeiro, carregar os blocos existentes do banco
      const existingTraining = await trainingService.getTrainingById(trainingId)
      const existingBlocks = existingTraining.training_blocks || []


      const blockDrafts = getTrainingBlockDrafts()

      // Para simplicidade, vamos remover todos os blocos existentes e criar novos
      // TODO: Implementar lógica mais sofisticada para atualizar apenas os que mudaram
      devLog('🗑️ Removendo blocos existentes...')
      setSubmittingMessage('🗑️ Removendo blocos existentes...')
      try {
        await trainingService.deleteAllTrainingBlocks(trainingId)
        devLog('✅ Todos os blocos existentes foram removidos')
        setSubmittingMessage('✅ Blocos removidos, criando novos...')
      } catch (error) {
        console.warn('⚠️ Erro ao remover blocos existentes:', error)
        setSubmittingMessage('⚠️ Erro ao remover blocos, continuando...')
        // Continue mesmo se houver erro na remoção
      }

      await persistTrainingBlocks({
        trainingId,
        blockDrafts,
        mode: 'update',
        onProgressMessage: setSubmittingMessage
      })

      devLog('✅ Todos os blocos foram atualizados!')
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

    // Use Vite's BASE_URL so it works for both:
    // - Cloudflare Pages: BASE_URL = '/'
    // - GitHub Pages: BASE_URL = '/training-platform/'
    const viteBaseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    const basePath = viteBaseUrl === '/' ? '' : viteBaseUrl

    return `${baseUrl}${basePath}/#/treino-publico/${token}`
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

  const handleExportPDF = async () => {
    if (!isEditMode || !editingTrainingId) {
      setSnackbar({
        open: true,
        message: 'Salve o treino antes de exportar em PDF',
        severity: 'warning'
      })
      return
    }

    try {
      const treino = await trainingService.getTrainingById(editingTrainingId)
      const logoBase64 = await imageToBase64(logoImage)
      await generateTreinoPDF(treino, logoBase64)

      setSnackbar({
        open: true,
        message: 'PDF gerado com sucesso!',
        severity: 'success'
      })
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error)
      setSnackbar({
        open: true,
        message: 'Erro ao gerar PDF: ' + error.message,
        severity: 'error'
      })
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      setSubmittingMessage(isEditMode ? '🔄 Atualizando treino...' : '💾 Salvando treino...')

      const scheduledDate = data?.data?.toDate ? data.data.toDate() : data.data

      // Preparar dados para o CreateTrainingDTO
      const trainingName = generateTrainingName(data.semana, data.data)
      const trainingData = {
        training_week_id: data.semana,
        name: trainingName,
        scheduled_date: formatISODateOnlyLocal(scheduledDate), // Formato YYYY-MM-DD (local)
        description: data.observacoes || undefined,
        internal_notes: data.observacoes_internas || undefined,
        estimated_duration_minutes: 90, // valor padrão, pode ser ajustado depois
        movement_pattern_id: data.padrao_movimento || null, // Incluir padrão de movimento
        // Sempre definir share_status baseado no checkbox link_ativo
        share_status: data.link_ativo ? 'public' : 'private'
      }

      // Se já tem token, incluir no payload
      if (linkToken) {
        trainingData.share_token = linkToken
      }

      let training

      if (isEditMode) {
        training = await trainingService.updateTraining(editingTrainingId, trainingData)
        devLog('✅ Treino atualizado com sucesso')
      } else {
        devLog('🚀 Criando treino com dados:', trainingData)
        training = await trainingService.createTraining(trainingData)
        devLog('✅ Treino criado com sucesso')

        // Após criar, se tem share_token retornado pelo banco, atualizar estado local
        if (training.share_token) {
          setLinkToken(training.share_token)
          setShareLink(generateShareLink(training.share_token))
        }
      }

      // Criar/atualizar os blocos do treino com todos os exercícios
      devLog('🛠️ Processando blocos do treino...')
      if (isEditMode) {
        devLog('🔄 Atualizando blocos do treino existente...')
        await updateTrainingBlocks(training.id)
      } else {
        await createTrainingBlocks(training.id)
      }
      devLog('✅ Blocos processados com sucesso!')

      // Mostrar feedback de sucesso
      const linkStatusMessage = data.link_ativo && training.share_token
        ? ' Link de compartilhamento público gerado!'
        : (linkToken ? ' Link de compartilhamento desativado.' : '')

      setSnackbar({
        open: true,
        message: isEditMode
          ? `Treino atualizado com sucesso!${linkStatusMessage}`
          : `Treino criado com sucesso!${linkStatusMessage}`,
        severity: 'success'
      })

      // Se for criação, redirecionar para o modo de edição do treino recém-criado
      if (!isEditMode) {
        devLog('🔄 Redirecionando para modo de edição do treino:', training.id)
        setTimeout(() => {
          navigate(`/pages/treinos/${training.id}/editar`)
        }, 1500)
      }

    } catch (error) {
      console.error('❌ Erro ao salvar treino:', error)

      const isAbort = error?.name === 'AbortError'
      const message = isAbort
        ? 'Tempo esgotado ao salvar/atualizar o treino. Verifique sua conexão e tente novamente.'
        : (error?.message || 'Erro ao salvar treino. Tente novamente.')

      setSnackbar({
        open: true,
        message,
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
      setSubmittingMessage('')
    }
  }

  const trainingBlockSections = [
    {
      key: 'mobilidade',
      props: {
        title: 'Mobilidade Articular',
        items: mobilidadeItems,
        dense: true,
        emptyPrimary: 'Nenhum item adicionado',
        emptySecondary: 'Clique em Adicionar para incluir',
        addAriaLabel: 'Adicionar exercício - Mobilidade Articular',
        onAdd: () => handleOpenAddExerciseModal('mobilidade'),
        onEdit: (index, item) => handleOpenEditExerciseModal('mobilidade', index, item),
        onDelete: (index, item) => handleRemoveItem('mobilidade', index, item),
        disableAdd: submitting,
        disableItemActions: submitting,
        renderLeading: (item) =>
          typeof item === 'object' && item?.videoId ? (
            <VideoIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          ) : null,
        renderPrimary: (item) => (typeof item === 'string' ? item : item?.nome),
        renderSecondary: (item) =>
          typeof item === 'object' ? formatProtocol(item) : undefined,
      },
    },
    {
      key: 'core',
      props: {
        title: 'Ativação de Core',
        items: coreItems,
        dense: true,
        emptyPrimary: 'Nenhum exercício adicionado',
        emptySecondary: 'Clique em Adicionar para incluir',
        addAriaLabel: 'Adicionar exercício - Ativação de Core',
        onAdd: () => handleOpenAddExerciseModal('core'),
        onEdit: (index, item) => handleOpenEditExerciseModal('core', index, item),
        onDelete: (index, item) => handleRemoveItem('core', index, item),
        disableAdd: submitting,
        disableItemActions: submitting,
        renderPrimary: (item) => item?.nome,
        renderSecondary: (item) => formatProtocol(item),
      },
    },
    {
      key: 'neural',
      props: {
        title: 'Ativação Neural',
        items: neuralItems,
        dense: true,
        emptyPrimary: 'Nenhum exercício adicionado',
        emptySecondary: 'Clique em Adicionar para incluir',
        addAriaLabel: 'Adicionar exercício - Ativação Neural',
        onAdd: () => handleOpenAddExerciseModal('neural'),
        onEdit: (index, item) => handleOpenEditExerciseModal('neural', index, item),
        onDelete: (index, item) => handleRemoveItem('neural', index, item),
        disableAdd: submitting,
        renderPrimary: (item) => item?.nome,
        renderSecondary: (item) => formatProtocol(item),
      },
    },
    {
      key: 'treino1',
      props: {
        headerLeft: (
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
        ),
        items: treinoBloco1,
        emptyPrimary: 'Nenhum exercício adicionado',
        emptySecondary: 'Clique em Adicionar para incluir exercícios',
        addAriaLabel: 'Adicionar exercício - Treino Bloco 01',
        onAdd: () => handleOpenAddExerciseModal('treino1'),
        onEdit: (index, item) => handleOpenEditExerciseModal('treino1', index, item),
        onDelete: (index, item) => handleRemoveItem('treino1', index, item),
        renderPrimary: (item, index) => `${index + 1}. ${item?.nome}`,
        renderSecondary: (item) => formatProtocol(item),
      },
    },
    {
      key: 'treino2',
      props: {
        headerLeft: (
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
        ),
        items: treinoBloco2,
        emptyPrimary: 'Bloco opcional vazio',
        emptySecondary: 'Adicione exercícios se necessário',
        addAriaLabel: 'Adicionar exercício - Treino Bloco 02',
        onAdd: () => handleOpenAddExerciseModal('treino2'),
        onEdit: (index, item) => handleOpenEditExerciseModal('treino2', index, item),
        onDelete: (index, item) => handleRemoveItem('treino2', index, item),
        renderPrimary: (item, index) => `${index + 1}. ${item?.nome}`,
        renderSecondary: (item) => formatProtocol(item),
      },
    },
    {
      key: 'condicionamento',
      props: {
        title: (
          <Typography variant="subtitle1" fontWeight="600">
            Condicionamento Físico <Chip label="Opcional" size="small" />
          </Typography>
        ),
        items: condicionamentoItems,
        dense: true,
        emptyPrimary: 'Nenhum exercício adicionado',
        emptySecondary: 'Clique em Adicionar para incluir',
        addAriaLabel: 'Adicionar exercício - Condicionamento Físico',
        onAdd: () => handleOpenAddExerciseModal('condicionamento'),
        onEdit: (index, item) => handleOpenEditExerciseModal('condicionamento', index, item),
        onDelete: (index, item) => handleRemoveItem('condicionamento', index, item),
        renderPrimary: (item) => item?.nome,
        renderSecondary: (item) => formatProtocol(item),
      },
    },
  ]

  return (
    <Container maxWidth="xl" sx={{ pb: 4, px: 0 }}>
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
          {/* Mobile: back icon above title */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, mb: 1 }}>
            <Tooltip title="Voltar" arrow>
              <IconButton
                onClick={() => navigate('/pages/treinos')}
                color="primary"
                size="small"
                aria-label="Voltar"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </Box>
          {/* Desktop: title left, back button at far right */}
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Box sx={{ flex: 1 }}>
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
            <Box sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/pages/treinos')}
                variant="outlined"
                size="small"
              >
                Voltar
              </Button>
            </Box>
          </Stack>


          <Stack direction="row" spacing={1.5} sx={{ width: '100%', justifyContent: 'flex-end', mb: 2 }}>
            {isEditMode && (
              <>
                <Box sx={{ display: { sm: 'inline-flex' } }}>
                  <Tooltip title="Exportar PDF" arrow>
                    <Button
                      startIcon={<PdfIcon />}
                      onClick={handleExportPDF}
                      variant="contained"
                      color="secondary"
                      size="small"
                    >
                      PDF
                    </Button>
                  </Tooltip>
                </Box>
              </>
            )}
          </Stack>

          {/* Formulário */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="column" spacing={5}>
                {/* Card: Informações Básicas */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Informações Básicas
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={4.5}>
                      {/* Padrão de movimento */}
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
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
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
                          </Box>

                          {/* Criar Semana */}
                          <Tooltip title="Criar Semana" arrow>
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              onClick={handleOpenConfirmSemanas}
                              disabled={submitting}
                              sx={{
                                width: { xs: 44, sm: 48 },
                                height: { xs: 44, sm: 48 },
                                minWidth: { xs: 44, sm: 48 },
                                p: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                        </Box>
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
                    </Grid>
                  </CardContent>
                </Card>

                {/* Card: Estrutura do Treino */}
                <Card>
                  <CardContent>
                    <Box mb={2}>
                      <Typography variant="h6" fontWeight="600">
                        🏋️ Estrutura do Treino
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      {trainingBlockSections.map((section) => (
                        <Grid item md={6} xs={12} key={section.key}>
                          <TrainingBlockSection {...section.props} />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>

                {/* Card: Compartilhamento */}
                {editingTrainingId && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        Compartilhamento do Treino
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Gere um link para compartilhar este treino com seus alunos
                      </Typography>
                      <Divider sx={{ mb: 1 }} />

                      {shareLink ? (
                        <Grid container spacing={5}>

                          {/* Checkbox ativar compartilhamento */}
                          <Grid item xs={12}>
                            <FormCheckbox
                              name="link_ativo"
                              label="Link de compartilhamento ativo"
                              disabled={submitting}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block', mt: 0.5 }}>
                              Desmarque para desativar o acesso ao link sem excluí-lo
                            </Typography>
                          </Grid>

                          {/* Status do Link */}
                          {/* <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircleIcon color="success" />
                              <Typography variant="body2" color="success.main" fontWeight={600}>
                                Link ativo e pronto para compartilhamento
                              </Typography>
                            </Box>
                          </Grid> */}

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

                          <Grid item xs={12} md={8} sx={{ p: 0 }}>
                            {/* Instruções */}
                            <Paper sx={{ p: 0, bgcolor: 'info.lighter', border: 1, borderColor: 'info.light' }}>
                              <Typography variant="body2">
                                <strong>Como usar:</strong>
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1, p: 0 }}>
                                • Copie e cole o link para enviar ao seu aluno<br />
                                • O aluno poderá visualizar o treino sem fazer login<br />
                                • Para desativar, desmarque "Link de compartilhamento ativo" acima
                              </Typography>
                            </Paper>
                          </Grid>

                          <Grid item xs={12} md={4} display="flex" alignItems="center">
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
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mt: 4 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  size="large"
                  disabled={submitting || loading || loadingTrainingData}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
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
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Cancelar
                </Button>
              </Stack>
            </form>
          </FormProvider>
        </>
      )
      }

      {/* Modal para adicionar exercícios com vídeo */}
      <AddExerciseModal
        open={addExerciseModalOpen}
        onClose={handleCloseAddExerciseModal}
        onSave={handleSaveExerciseWithVideo}
        initialStep={exerciseModalEditMode ? 'config' : undefined}
        editMode={exerciseModalEditMode}
        initialExercise={editingModalData?.exercise || null}
        initialVideo={editingModalData?.video || null}
        initialConfig={editingModalData?.config || null}
        section={addExerciseModalSection}
      />

      {/* Confirmação para excluir exercício */}
      <Dialog
        open={confirmDeleteExerciseOpen}
        onClose={handleCloseConfirmDeleteExercise}
        aria-labelledby="confirm-delete-exercise-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="confirm-delete-exercise-title">Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {pendingDeleteExercise?.itemName
              ? `Deseja excluir o exercício "${pendingDeleteExercise.itemName}" do bloco "${getSectionLabel(pendingDeleteExercise.section)}"?`
              : `Deseja excluir este exercício do bloco "${getSectionLabel(pendingDeleteExercise?.section)}"?`
            }
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            alignItems: { xs: 'stretch', sm: 'center' },
            '& > .MuiButton-root': {
              width: { xs: '100%', sm: 'auto' }
            }
          }}
        >
          <Button onClick={handleCloseConfirmDeleteExercise} variant="outlined" color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDeleteExercise} variant="contained" color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmação para navegar para Semanas */}
      <Dialog
        open={confirmLeaveSemanasOpen}
        onClose={handleCloseConfirmSemanas}
        aria-labelledby="confirm-leave-semanas-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="confirm-leave-semanas-title">
          Sair do formulário de treino?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Ao seguir para "Criar Semana", você sairá do fluxo do treino. Alterações não salvas podem ser perdidas.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Deseja continuar para a criação de semana?
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            alignItems: { xs: 'stretch', sm: 'center' },
            '& > .MuiButton-root': {
              width: { xs: '100%', sm: 'auto' }
            }
          }}
        >
          <Button onClick={handleCloseConfirmSemanas} variant="outlined" color="error">
            Cancelar
          </Button>
          <Button onClick={handleConfirmNavigateToSemanas} variant="contained" color="secondary">
            Ir para Semanas
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
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
