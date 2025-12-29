// Página de gerenciamento de exercícios (apenas Owner)
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Alert,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'

// Dados mockados de exercícios
const exerciciosMock = [
  {
    id: 1,
    nome: 'Agachamento Livre',
    padrao_movimento: 'Agachar',
    observacoes: 'Manter o core ativo e descer até 90 graus no joelho'
  },
  {
    id: 2,
    nome: 'Supino Reto',
    padrao_movimento: 'Empurrar Horizontal',
    observacoes: 'Controlar a descida e explodir na subida'
  },
  {
    id: 3,
    nome: 'Barra Fixa',
    padrao_movimento: 'Puxar Vertical',
    observacoes: 'Pegada pronada, descer até extensão completa dos braços'
  },
  {
    id: 4,
    nome: 'Levantamento Terra',
    padrao_movimento: 'Dobrar',
    observacoes: 'Manter coluna neutra durante todo movimento, iniciar movimento pelo quadril'
  },
  {
    id: 5,
    nome: 'Desenvolvimento Militar',
    padrao_movimento: 'Empurrar Vertical',
    observacoes: 'Pressionar a barra acima da cabeça mantendo core estável'
  },
  {
    id: 6,
    nome: 'Remada Curvada',
    padrao_movimento: 'Puxar Horizontal',
    observacoes: 'Inclinar tronco a 45 graus, puxar barra em direção ao abdome'
  },
  {
    id: 7,
    nome: 'Prancha',
    padrao_movimento: '',
    observacoes: 'Exercício isométrico para fortalecimento do core'
  },
  {
    id: 8,
    nome: 'Burpee',
    padrao_movimento: '',
    observacoes: 'Movimento completo: agachamento, prancha, flexão, salto'
  }
]

const Exercicios = () => {
  const [exercicios, setExercicios] = useState(exerciciosMock)
  const [filteredExercicios, setFilteredExercicios] = useState(exerciciosMock)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPadrao, setSelectedPadrao] = useState('Todos')
  const { canEdit } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nome: '',
    padrao_movimento: '',
    observacoes: '',
  })

  // Obter padrões únicos para o filtro
  const padroesUnicos = [...new Set(exercicios.map(ex => ex.padrao_movimento).filter(Boolean))].sort()

  useEffect(() => {
    if (!canEdit) {
      navigate('/')
      return
    }
  }, [canEdit, navigate])

  // Filtrar exercícios baseado na busca e padrão selecionado
  useEffect(() => {
    let filtered = exercicios

    // Filtro por nome
    if (searchTerm) {
      filtered = filtered.filter(exercicio =>
        exercicio.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por padrão de movimento
    if (selectedPadrao !== 'Todos') {
      filtered = filtered.filter(exercicio => exercicio.padrao_movimento === selectedPadrao)
    }

    setFilteredExercicios(filtered)
  }, [exercicios, searchTerm, selectedPadrao])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        // Atualizar exercício existente
        const updatedExercicios = exercicios.map(ex =>
          ex.id === editingId ? { ...ex, ...formData } : ex
        )
        setExercicios(updatedExercicios)
      } else {
        // Criar novo exercício
        const novoExercicio = {
          id: Math.max(...exercicios.map(ex => ex.id)) + 1,
          ...formData
        }
        setExercicios([...exercicios, novoExercicio])
      }
      resetForm()
      alert('Exercício salvo com sucesso!')
    } catch (error) {
      alert('Erro ao salvar exercício: ' + error.message)
    }
  }

  const handleEdit = (exercicio) => {
    setFormData({
      nome: exercicio.nome,
      padrao_movimento: exercicio.padrao_movimento || '',
      observacoes: exercicio.observacoes || '',
    })
    setEditingId(exercicio.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return

    try {
      const updatedExercicios = exercicios.filter(ex => ex.id !== id)
      setExercicios(updatedExercicios)
      alert('Exercício excluído com sucesso!')
    } catch (error) {
      alert('Erro ao excluir exercício: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({ nome: '', padrao_movimento: '', observacoes: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const truncateText = (text, maxLength = 40) => {
    if (!text) return '-'
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Carregando exercícios...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="700">
          Exercícios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(!showForm)}
          sx={{ minWidth: 180 }}
        >
          {showForm ? 'Cancelar' : '+ Novo Exercício'}
        </Button>
      </Stack>

      {/* Formulário */}
      {showForm && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" mb={3}>
              {editingId ? 'Editar' : 'Novo'} Exercício
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Nome *"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                  fullWidth
                />

                <TextField
                  label="Padrão de Movimento"
                  value={formData.padrao_movimento}
                  onChange={(e) =>
                    setFormData({ ...formData, padrao_movimento: e.target.value })
                  }
                  fullWidth
                />

                <TextField
                  label="Observações"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  multiline
                  rows={3}
                  fullWidth
                />

                <Stack direction="row" spacing={2}>
                  <Button type="submit" variant="contained">
                    {editingId ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button type="button" onClick={resetForm} variant="outlined">
                    Cancelar
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <TextField
              label="Buscar por nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 300 }}
            />
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Padrão de Movimento</InputLabel>
              <Select
                value={selectedPadrao}
                onChange={(e) => setSelectedPadrao(e.target.value)}
                label="Padrão de Movimento"
              >
                <MenuItem value="Todos">Todos</MenuItem>
                {padroesUnicos.map((padrao) => (
                  <MenuItem key={padrao} value={padrao}>
                    {padrao}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Estados vazios */}
      {exercicios.length === 0 ? (
        <Alert severity="info">
          Nenhum exercício cadastrado
        </Alert>
      ) : filteredExercicios.length === 0 ? (
        <Alert severity="info">
          Nenhum exercício encontrado
        </Alert>
      ) : (
        /* Tabela de Exercícios */
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Nome
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Padrão de Movimento
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Observações
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ width: 120 }}>
                  <Typography variant="subtitle2" fontWeight="600">
                    Ações
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExercicios.map((exercicio) => (
                <TableRow key={exercicio.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {exercicio.nome}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {exercicio.padrao_movimento || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {exercicio.observacoes ? (
                      <Tooltip title={exercicio.observacoes} arrow>
                        <Typography variant="body2" sx={{ cursor: 'pointer' }}>
                          {truncateText(exercicio.observacoes)}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(exercicio)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(exercicio.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  )
}

export default Exercicios
