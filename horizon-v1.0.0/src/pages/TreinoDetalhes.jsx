// Página de detalhes de um treino - Material UI
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { treinosService } from '../services/treinos'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  Fab,
  Grid,
  Paper,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ArrowBack as ArrowBackIcon,
  FitnessCenter as FitnessCenterIcon,
} from '@mui/icons-material'

const TreinoDetalhes = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [treino, setTreino] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [linkExpiresAt, setLinkExpiresAt] = useState('')
  const [linkActive, setLinkActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)
  
  // Estados para edição
  const [editingBloco, setEditingBloco] = useState(null)
  const [editingExercicio, setEditingExercicio] = useState(null)
  const [blocoForm, setBlocoForm] = useState({
    tipo_bloco: '',
    prescricao: '',
    ordem: 1
  })
  const [exercicioForm, setExercicioForm] = useState({
    nome: '',
    series: '',
    repeticoes: '',
    carga: '',
    observacoes: ''
  })
  
  const { canEdit, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return
    loadTreino()
  }, [id, isAuthenticated])

  const loadTreino = async () => {
    try {
      const { data, error } = await treinosService.getById(id)
      if (error) throw error
      setTreino(data)
      
      // Configurar link de compartilhamento
      if (canEdit && data.token_compartilhamento) {
        const baseUrl = window.location.origin
        setShareLink(`${baseUrl}/treino-publico/${data.token_compartilhamento}`)
        
        if (data.link_expires_at) {
          const expiresDate = new Date(data.link_expires_at)
          const year = expiresDate.getFullYear()
          const month = String(expiresDate.getMonth() + 1).padStart(2, '0')
          const day = String(expiresDate.getDate()).padStart(2, '0')
          const hours = String(expiresDate.getHours()).padStart(2, '0')
          const minutes = String(expiresDate.getMinutes()).padStart(2, '0')
          setLinkExpiresAt(`${year}-${month}-${day}T${hours}:${minutes}`)
        } else {
          setLinkExpiresAt('')
        }
        setLinkActive(data.link_active !== false)
      }
    } catch (error) {
      console.error('Erro ao carregar treino:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateShareLink = async () => {
    if (!treino.token_compartilhamento) {
      const newToken = crypto.randomUUID()
      try {
        const { error } = await supabase.from('treinos')
          .update({ 
            token_compartilhamento: newToken,
            link_active: true,
            link_expires_at: null
          })
          .eq('id', id)
        
        if (error) throw error
        
        await loadTreino()
        const baseUrl = window.location.origin
        const link = `${baseUrl}/treino-publico/${newToken}`
        await navigator.clipboard.writeText(link)
        alert('Link copiado para a área de transferência!')
      } catch (error) {
        alert('Erro ao gerar link: ' + error.message)
      }
    } else {
      await navigator.clipboard.writeText(shareLink)
      alert('Link copiado para a área de transferência!')
    }
  }

  const updateShareSettings = async () => {
    setSaving(true)
    try {
      const updates = {
        link_active: linkActive,
        link_expires_at: linkExpiresAt || null
      }
      
      const { error } = await supabase.from('treinos')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      
      alert('Configurações de compartilhamento atualizadas!')
      await loadTreino()
    } catch (error) {
      alert('Erro ao atualizar configurações: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Handlers de edição de blocos
  const handleEditBloco = (bloco) => {
    setEditingBloco(bloco)
    setBlocoForm({
      tipo_bloco: bloco.tipo_bloco,
      prescricao: bloco.prescricao,
      ordem: bloco.ordem
    })
  }

  const handleAddBloco = (tipoBloco) => {
    const maxOrdem = Math.max(...treino.blocos_treino.map(b => b.ordem), 0)
    setBlocoForm({
      tipo_bloco: tipoBloco,
      prescricao: '',
      ordem: maxOrdem + 1
    })
    setEditingBloco({ id: 'new' })
  }

  const handleDeleteBloco = (blocoId) => {
    if (!confirm('Remover este bloco?')) return
    
    setTreino(prev => ({
      ...prev,
      blocos_treino: prev.blocos_treino.filter(b => b.id !== blocoId)
    }))
  }

  const saveBloco = () => {
    if (editingBloco.id === 'new') {
      const newBloco = {
        id: `temp-${Date.now()}`,
        ...blocoForm,
        bloco_exercicios: [],
        bloco_padrao_movimento: []
      }
      setTreino(prev => ({
        ...prev,
        blocos_treino: [...prev.blocos_treino, newBloco]
      }))
    } else {
      setTreino(prev => ({
        ...prev,
        blocos_treino: prev.blocos_treino.map(b =>
          b.id === editingBloco.id ? { ...b, ...blocoForm } : b
        )
      }))
    }
    setEditingBloco(null)
  }

  // Handlers de exercícios
  const handleAddExercicio = (blocoId) => {
    const bloco = treino.blocos_treino.find(b => b.id === blocoId)
    const maxOrdem = Math.max(...(bloco.bloco_exercicios || []).map(e => e.ordem), 0)
    
    setExercicioForm({
      nome: '',
      series: '',
      repeticoes: '',
      carga: '',
      observacoes: ''
    })
    setEditingExercicio({ blocoId, id: 'new', ordem: maxOrdem + 1 })
  }

  const handleEditExercicio = (blocoId, exercicio) => {
    setEditingExercicio({ blocoId, ...exercicio })
    setExercicioForm({
      nome: exercicio.exercicios.nome,
      series: exercicio.series,
      repeticoes: exercicio.repeticoes,
      carga: exercicio.carga,
      observacoes: exercicio.exercicios.observacoes
    })
  }

  const handleDeleteExercicio = (blocoId, exercicioId) => {
    if (!confirm('Remover este exercício?')) return
    
    setTreino(prev => ({
      ...prev,
      blocos_treino: prev.blocos_treino.map(b =>
        b.id === blocoId
          ? { ...b, bloco_exercicios: b.bloco_exercicios.filter(e => e.id !== exercicioId) }
          : b
      )
    }))
  }

  const saveExercicio = () => {
    const { blocoId, id: exercicioId } = editingExercicio
    
    if (exercicioId === 'new') {
      const newExercicio = {
        id: `temp-${Date.now()}`,
        ordem: editingExercicio.ordem,
        series: exercicioForm.series,
        repeticoes: exercicioForm.repeticoes,
        carga: exercicioForm.carga,
        exercicios: {
          id: `temp-ex-${Date.now()}`,
          nome: exercicioForm.nome,
          observacoes: exercicioForm.observacoes,
          grupo_muscular: ''
        }
      }
      
      setTreino(prev => ({
        ...prev,
        blocos_treino: prev.blocos_treino.map(b =>
          b.id === blocoId
            ? { ...b, bloco_exercicios: [...(b.bloco_exercicios || []), newExercicio] }
            : b
        )
      }))
    } else {
      setTreino(prev => ({
        ...prev,
        blocos_treino: prev.blocos_treino.map(b =>
          b.id === blocoId
            ? {
                ...b,
                bloco_exercicios: b.bloco_exercicios.map(e =>
                  e.id === exercicioId
                    ? {
                        ...e,
                        series: exercicioForm.series,
                        repeticoes: exercicioForm.repeticoes,
                        carga: exercicioForm.carga,
                        exercicios: {
                          ...e.exercicios,
                          nome: exercicioForm.nome,
                          observacoes: exercicioForm.observacoes
                        }
                      }
                    : e
                )
              }
            : b
        )
      }))
    }
    setEditingExercicio(null)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!treino) {
    return (
      <Container>
        <Alert severity="error">Treino não encontrado</Alert>
      </Container>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const tiposBloco = {
    'MOBILIDADE_ARTICULAR': 'Mobilidade Articular',
    'ATIVACAO_CORE': 'Ativação de Core',
    'ATIVACAO_NEURAL': 'Ativação Neural',
    'TREINO': 'Treino Principal',
    'CONDICIONAMENTO_FISICO': 'Condicionamento Físico',
    'PADRAO_MOVIMENTO': 'Padrão de Movimento'
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/treinos')}
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>

        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
              {formatDate(treino.data)}
            </Typography>
            {treino.semanas?.tipos_treino && (
              <Chip
                label={treino.semanas.tipos_treino.nome}
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          {canEdit && (
            <Stack direction="row" spacing={1}>
              <Button
                variant={editMode ? 'outlined' : 'contained'}
                startIcon={editMode ? <VisibilityIcon /> : <EditIcon />}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Visualizar' : 'Editar'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => setShowSharePanel(true)}
              >
                Compartilhar
              </Button>
            </Stack>
          )}
        </Box>

        {treino.observacoes && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {treino.observacoes}
          </Alert>
        )}
      </Box>

      {/* Blocos de Treino */}
      {treino.blocos_treino && treino.blocos_treino.length > 0 ? (
        <Stack spacing={2}>
          {treino.blocos_treino
            .sort((a, b) => a.ordem - b.ordem)
            .map((bloco, index) => (
              <MuiAccordion 
                key={bloco.id}
                defaultExpanded={!editMode}
                sx={{ '&:before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Chip
                      label={`${index + 1}`}
                      color="primary"
                      size="small"
                    />
                    <Typography variant="h6" fontWeight="600">
                      {tiposBloco[bloco.tipo_bloco] || bloco.tipo_bloco}
                    </Typography>
                    {editMode && (
                      <Box ml="auto" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditBloco(bloco)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteBloco(bloco.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  {bloco.prescricao && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {bloco.prescricao}
                    </Alert>
                  )}

                  {/* Padrões de Movimento */}
                  {bloco.bloco_padrao_movimento && bloco.bloco_padrao_movimento.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Padrões de Movimento:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {bloco.bloco_padrao_movimento.map((pm) => (
                          <Chip
                            key={pm.padrao_movimento_id}
                            label={pm.padroes_movimento.nome}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Exercícios */}
                  {bloco.bloco_exercicios && bloco.bloco_exercicios.length > 0 ? (
                    <List>
                      {bloco.bloco_exercicios
                        .sort((a, b) => a.ordem - b.ordem)
                        .map((ex) => (
                          <ListItem
                            key={ex.id}
                            sx={{
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 2,
                              mb: 1,
                            }}
                            secondaryAction={
                              editMode && (
                                <Box>
                                  <IconButton
                                    edge="end"
                                    onClick={() => handleEditExercicio(bloco.id, ex)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    edge="end"
                                    color="error"
                                    onClick={() => handleDeleteExercicio(bloco.id, ex.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              )
                            }
                          >
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight="600">
                                  {ex.exercicios.nome}
                                </Typography>
                              }
                              secondary={
                                <Box component="span">
                                  <Typography variant="body2" component="span">
                                    {ex.series} séries × {ex.repeticoes} reps
                                    {ex.carga && ` • ${ex.carga}`}
                                  </Typography>
                                  {ex.exercicios.observacoes && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      {ex.exercicios.observacoes}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                      Nenhum exercício neste bloco
                    </Typography>
                  )}

                  {editMode && (
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => handleAddExercicio(bloco.id)}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Adicionar Exercício
                    </Button>
                  )}
                </AccordionDetails>
              </MuiAccordion>
            ))}
        </Stack>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <FitnessCenterIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhum bloco de treino ainda
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Botões de Adicionar Blocos (modo edição) */}
      {editMode && canEdit && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Adicionar Bloco
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(tiposBloco).map(([key, label]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddBloco(key)}
                  fullWidth
                >
                  {label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Dialog de Edição de Bloco */}
      <Dialog open={Boolean(editingBloco)} onClose={() => setEditingBloco(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBloco?.id === 'new' ? 'Adicionar Bloco' : 'Editar Bloco'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Tipo de Bloco"
              value={blocoForm.tipo_bloco}
              onChange={(e) => setBlocoForm({ ...blocoForm, tipo_bloco: e.target.value })}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="">Selecione...</option>
              {Object.entries(tiposBloco).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </TextField>
            
            <TextField
              label="Prescrição"
              value={blocoForm.prescricao}
              onChange={(e) => setBlocoForm({ ...blocoForm, prescricao: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingBloco(null)}>Cancelar</Button>
          <Button variant="contained" onClick={saveBloco}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Edição de Exercício */}
      <Dialog open={Boolean(editingExercicio)} onClose={() => setEditingExercicio(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingExercicio?.id === 'new' ? 'Adicionar Exercício' : 'Editar Exercício'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome do Exercício"
              value={exercicioForm.nome}
              onChange={(e) => setExercicioForm({ ...exercicioForm, nome: e.target.value })}
              fullWidth
            />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Séries"
                  value={exercicioForm.series}
                  onChange={(e) => setExercicioForm({ ...exercicioForm, series: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Repetições"
                  value={exercicioForm.repeticoes}
                  onChange={(e) => setExercicioForm({ ...exercicioForm, repeticoes: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Carga"
                  value={exercicioForm.carga}
                  onChange={(e) => setExercicioForm({ ...exercicioForm, carga: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Observações"
              value={exercicioForm.observacoes}
              onChange={(e) => setExercicioForm({ ...exercicioForm, observacoes: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingExercicio(null)}>Cancelar</Button>
          <Button variant="contained" onClick={saveExercicio}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Compartilhamento */}
      <Dialog open={showSharePanel} onClose={() => setShowSharePanel(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Compartilhar Treino</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {shareLink ? (
              <>
                <TextField
                  label="Link de Compartilhamento"
                  value={shareLink}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton onClick={generateShareLink}>
                        <CopyIcon />
                      </IconButton>
                    )
                  }}
                  fullWidth
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={linkActive}
                      onChange={(e) => setLinkActive(e.target.checked)}
                    />
                  }
                  label="Link Ativo"
                />
                
                <TextField
                  label="Expiração do Link (opcional)"
                  type="datetime-local"
                  value={linkExpiresAt}
                  onChange={(e) => setLinkExpiresAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </>
            ) : (
              <Button
                variant="contained"
                onClick={generateShareLink}
                fullWidth
              >
                Gerar Link de Compartilhamento
              </Button>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSharePanel(false)}>Fechar</Button>
          {shareLink && (
            <Button variant="contained" onClick={updateShareSettings} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default TreinoDetalhes

