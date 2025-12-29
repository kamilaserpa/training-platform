// Página de Configurações → Semana & Movimento
import { useState } from 'react'
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'

// 🔹 Dados mockados - Focos da Semana
const focosSemanaMockData = [
  { id: 1, nome: 'Hipertrofia', intensidade: 65, descricao: 'Foco em hipertrofia muscular' },
  { id: 2, nome: 'Resistência', intensidade: 50, descricao: 'Foco em resistência muscular' },
  { id: 3, nome: 'Força Máxima', intensidade: 85, descricao: 'Foco em força máxima' },
  { id: 4, nome: 'Potência', intensidade: 70, descricao: 'Foco em potência muscular' },
  { id: 5, nome: 'Funcional', intensidade: 60, descricao: 'Treino funcional' },
  { id: 6, nome: 'Deload', intensidade: 40, descricao: 'Semana de recuperação ativa' },
]

// 🔹 Dados mockados - Padrões de Movimento
const padroesMockData = [
  { id: 1, nome: 'Agachar' },
  { id: 2, nome: 'Empurrar Horizontal' },
  { id: 3, nome: 'Empurrar Vertical' },
  { id: 4, nome: 'Puxar Horizontal' },
  { id: 5, nome: 'Puxar Vertical' },
  { id: 6, nome: 'Dobrar' },
  { id: 7, nome: 'Rotação' },
  { id: 8, nome: 'Locomoção' },
  { id: 9, nome: 'Unilateral' },
  { id: 10, nome: 'Isométrico' },
]

// 🔹 Componente do formulário de Foco da Semana
function FocoSemanaDialog({ open, onClose, onSave, editingData }) {
  const [formData, setFormData] = useState({
    nome: editingData?.nome || '',
    intensidade: editingData?.intensidade || '',
    descricao: editingData?.descricao || '',
  })

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSave = () => {
    if (!formData.nome.trim()) {
      alert('Por favor, informe o nome do foco')
      return
    }

    const novoFoco = {
      id: editingData?.id || Date.now(),
      nome: formData.nome.trim(),
      intensidade: formData.intensidade ? parseInt(formData.intensidade) : null,
      descricao: formData.descricao.trim() || null,
    }

    onSave(novoFoco)
    setFormData({ nome: '', intensidade: '', descricao: '' })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingData ? 'Editar Foco da Semana' : 'Novo Foco da Semana'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Nome *"
            value={formData.nome}
            onChange={handleChange('nome')}
            placeholder="ex: Hipertrofia, Força Máxima"
            fullWidth
          />

          <TextField
            label="Intensidade (%)"
            type="number"
            value={formData.intensidade}
            onChange={handleChange('intensidade')}
            inputProps={{ min: 1, max: 100 }}
            placeholder="ex: 65"
            fullWidth
          />

          <TextField
            label="Descrição"
            value={formData.descricao}
            onChange={handleChange('descricao')}
            placeholder="Descrição opcional do foco"
            multiline
            rows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// 🔹 Componente do formulário de Padrão de Movimento
function PadraoMovimentoDialog({ open, onClose, onSave, editingData }) {
  const [formData, setFormData] = useState({
    nome: editingData?.nome || '',
  })

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSave = () => {
    if (!formData.nome.trim()) {
      alert('Por favor, informe o nome do padrão de movimento')
      return
    }

    const novoPadrao = {
      id: editingData?.id || Date.now(),
      nome: formData.nome.trim(),
    }

    onSave(novoPadrao)
    setFormData({ nome: '' })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingData ? 'Editar Padrão de Movimento' : 'Novo Padrão de Movimento'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Nome *"
            value={formData.nome}
            onChange={handleChange('nome')}
            placeholder="ex: Agachar, Puxar Vertical"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function Configuracoes() {
  const [focosSemana, setFocosSemana] = useState(focosSemanaMockData)
  const [padroes, setPadroes] = useState(padroesMockData)
  
  // Estados dos dialogs
  const [focoDialogOpen, setFocoDialogOpen] = useState(false)
  const [padraoDialogOpen, setPadraoDialogOpen] = useState(false)
  
  // Estados de edição
  const [editingFoco, setEditingFoco] = useState(null)
  const [editingPadrao, setEditingPadrao] = useState(null)

  // 🔹 Handlers para Focos da Semana
  const handleSaveFoco = (foco) => {
    if (editingFoco) {
      setFocosSemana(prev => prev.map(f => f.id === foco.id ? foco : f))
    } else {
      setFocosSemana(prev => [...prev, foco])
    }
    setEditingFoco(null)
  }

  const handleEditFoco = (foco) => {
    setEditingFoco(foco)
    setFocoDialogOpen(true)
  }

  const handleDeleteFoco = (id) => {
    if (confirm('Tem certeza que deseja excluir este foco da semana?')) {
      setFocosSemana(prev => prev.filter(f => f.id !== id))
    }
  }

  // 🔹 Handlers para Padrões de Movimento
  const handleSavePadrao = (padrao) => {
    if (editingPadrao) {
      setPadroes(prev => prev.map(p => p.id === padrao.id ? padrao : p))
    } else {
      setPadroes(prev => [...prev, padrao])
    }
    setEditingPadrao(null)
  }

  const handleEditPadrao = (padrao) => {
    setEditingPadrao(padrao)
    setPadraoDialogOpen(true)
  }

  const handleDeletePadrao = (id) => {
    if (confirm('Tem certeza que deseja excluir este padrão de movimento?')) {
      setPadroes(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="700" mb={4}>
        Configurações → Semana & Movimento
      </Typography>

      {/* 🟦 Seção 1: Focos da Semana */}
      <Card sx={{ mb: 6 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="600" color="primary.main">
              🟦 Focos da Semana
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFocoDialogOpen(true)}
            >
              + Novo Foco da Semana
            </Button>
          </Stack>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">Nome</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">Intensidade</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">Descrição</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    <Typography variant="subtitle2" fontWeight="600">Ações</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {focosSemana.map((foco) => (
                  <TableRow key={foco.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {foco.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {foco.intensidade ? `${foco.intensidade}%` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {foco.descricao || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditFoco(foco)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteFoco(foco.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 🟩 Seção 2: Padrões de Movimento */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="600" color="success.main">
              🟩 Padrões de Movimento
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setPadraoDialogOpen(true)}
            >
              + Novo Padrão de Movimento
            </Button>
          </Stack>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">Nome</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    <Typography variant="subtitle2" fontWeight="600">Ações</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {padroes.map((padrao) => (
                  <TableRow key={padrao.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {padrao.nome}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPadrao(padrao)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePadrao(padrao.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 🔹 Dialogs */}
      <FocoSemanaDialog
        open={focoDialogOpen}
        onClose={() => {
          setFocoDialogOpen(false)
          setEditingFoco(null)
        }}
        onSave={handleSaveFoco}
        editingData={editingFoco}
      />

      <PadraoMovimentoDialog
        open={padraoDialogOpen}
        onClose={() => {
          setPadraoDialogOpen(false)
          setEditingPadrao(null)
        }}
        onSave={handleSavePadrao}
        editingData={editingPadrao}
      />
    </Container>
  )
}

export default Configuracoes