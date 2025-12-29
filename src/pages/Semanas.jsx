// // Página de listagem de semanas
// import { useEffect, useState } from 'react'
// import { semanasService } from '../services/semanas'
// import { useAuth } from '../contexts/AuthContext'
// import { Link } from 'react-router-dom'
// import Breadcrumb from '../components/Breadcrumb'
// import './Semanas.css'
//
// const Semanas = () => {
//   const [semanas, setSemanas] = useState([])
//   const [loading, setLoading] = useState(true)
//   const { canEdit } = useAuth()
//
//   useEffect(() => {
//     loadSemanas()
//   }, [])
//
//   const loadSemanas = async () => {
//     try {
//       const { data, error } = await semanasService.getAll()
//
//       if (error) throw error
//       setSemanas(data || [])
//     } catch (error) {
//       console.error('Erro ao carregar semanas:', error)
//     } finally {
//       setLoading(false)
//     }
//   }
//
//   const handleDelete = async (id) => {
//     if (!confirm('Tem certeza que deseja excluir esta semana?')) return
//
//     try {
//       const { error } = await semanasService.delete(id)
//       if (error) throw error
//       loadSemanas()
//     } catch (error) {
//       alert('Erro ao excluir semana: ' + error.message)
//     }
//   }
//
//   if (loading) {
//     return <div className="loading">Carregando semanas...</div>
//   }
//
//   return (
//     <div className="semanas-container">
//       <Breadcrumb items={[{ label: 'Semanas', to: '/' }]} />
//
//       <div className="page-header">
//         <h1>Semanas de Treino</h1>
//         {canEdit && (
//           <Link to="/semanas/nova" className="btn-primary">
//             + Nova Semana
//           </Link>
//         )}
//       </div>
//
//       {semanas.length === 0 ? (
//         <div className="empty-state">
//           <p>Nenhuma semana cadastrada ainda.</p>
//           {canEdit && (
//             <Link to="/semanas/nova" className="btn-primary">
//               Criar primeira semana
//             </Link>
//           )}
//         </div>
//       ) : (
//         <div className="semanas-grid">
//           {semanas.map((semana) => (
//             <div key={semana.id} className="semana-card">
//               <div className="semana-header">
//                 <h3>
//                   {new Date(semana.data_inicio).toLocaleDateString('pt-BR')} -{' '}
//                   {new Date(semana.data_fim).toLocaleDateString('pt-BR')}
//                 </h3>
//                 {semana.tipos_treino && (
//                   <span className="tipo-badge">{semana.tipos_treino.nome}</span>
//                 )}
//               </div>
//
//               {canEdit && (
//                 <div className="card-actions">
//                   <Link
//                     to={`/semanas/${semana.id}/editar`}
//                     className="btn-edit"
//                   >
//                     Editar
//                   </Link>
//                   <button
//                     onClick={() => handleDelete(semana.id)}
//                     className="btn-delete"
//                   >
//                     Excluir
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }
//
// export default Semanas

import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function TreinoCell({ treino }) {
  const navigate = useNavigate()

  if (!treino) {
    return <Typography align="center">-</Typography>
  }

  return (
    <Stack spacing={0.5} alignItems="left">
      <strong>{treino.nome}</strong>
    </Stack>
  )
}

// const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
// const diasLabel = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

// function renderCell(treino, campo) {
//   return treino ? treino[campo] || '-' : '-'
// }

// 🔹 Dias da semana (colunas)
const diasSemana = [
  { key: 'segunda', label: 'Segunda' },
  { key: 'terca', label: 'Terça' },
  { key: 'quarta', label: 'Quarta' },
  { key: 'quinta', label: 'Quinta' },
  { key: 'sexta', label: 'Sexta' },
]

// 🔹 Focos da semana mockados
const focosSemanaMock = [
  { id: 1, nome: 'Hipertrofia', intensidade: 65, descricao: 'Foco em hipertrofia muscular' },
  { id: 2, nome: 'Resistência', intensidade: 50, descricao: 'Foco em resistência muscular' },
  { id: 3, nome: 'Força Máxima', intensidade: 85, descricao: 'Foco em força máxima' },
  { id: 4, nome: 'Potência', intensidade: 70, descricao: 'Foco em potência muscular' },
  { id: 5, nome: 'Funcional', intensidade: 60, descricao: 'Treino funcional' },
]

// 🔹 Padrões de movimento mockados
const padroesMock = [
  'Agachar',
  'Empurrar Horizontal',
  'Empurrar Vertical', 
  'Puxar Horizontal',
  'Puxar Vertical',
  'Dobrar',
  'Rotação',
  'Locomoção'
]

// 🔹 Definição das linhas da tabela
const linhasTabela = [
  { key: 'nome', label: 'Treino' },
  { key: 'diaSemana', label: 'Dia' },
  { key: 'padroes_movimento', label: 'Padrões Mov.' },
  { key: 'mobilidade', label: 'Mob. Artic.' },
  { key: 'core', label: 'Ativ. Core' },
  { key: 'neural', label: 'Ativ. Neural' },
  { key: 'treino_bloco1', label: 'Tr. Bl 01' },
  { key: 'treino_bloco2', label: 'Tr. Bl 02' },
  { key: 'condicionamento', label: 'Cond. Físico' },
  { key: 'acoes', label: 'Detalhes' },
]

const semanasMock = [
  {
    semestre: '2025.1',
    numeroSemana: 1,
    focoSemana: { nome: 'Hipertrofia', intensidade: 65, descricao: 'Foco em hipertrofia muscular' },
    treinos: {
      segunda: {
        nome: 'Treino 01',
        padroes_movimento: ['Dobrar', 'Puxar Vertical'],
        mobilidade: ['Ombro, Tronco, Quadril, Tornozelo'],
        core: {
          protocolo: '2 x 30"x15"',
          exercicios: ['Prancha', 'OHS'],
        },
        neural: 'Burpee',
        treino_bloco1: {
          protocolo: '8 x 30"x15"',
          exercicios: ['Lev. Terra', 'Cad. Flexora'],
        },
        treino_bloco2: '-',
        condicionamento: 'Burpee Tabata',
      },
      terca: {
        nome: 'Treino 02',
        padroes_movimento: ['Agachar', 'Empurrar Vertical'],
        mobilidade: ['Quadril, Joelho, Tornozelo'],
        core: {
          protocolo: '3 x 40"x20"',
          exercicios: ['Dead Bug', 'Prancha Lat.'],
        },
        neural: 'Saltos no Caixote',
        treino_bloco1: {
          protocolo: '10 x 30"x20',
          exercicios: ['Agachamento', 'Afundo'],
        },
        treino_bloco2: {
          protocolo: 'EMOM 12',
          exercicios: ['Push Press', 'Wall Ball'],
        },
        condicionamento: 'Bike 10 min',
      },
      quarta: {
        nome: 'Treino 04',
        padroes_movimento: ['Agachar'],
        mobilidade: ['Quadril, Tornozelo'],
        core: {
          protocolo: '3 x 20',
          exercicios: ['Plank Reach'],
        },
        neural: 'Jump Squat',
        treino_bloco1: {
          protocolo: '5 x 5',
          exercicios: ['Front Squat'],
        },
        treino_bloco2: '-',
        condicionamento: 'Sled Push',
      },
      quinta: {
        nome: 'Treino 03',
        padroes_movimento: ['Puxar Vertical'],
        mobilidade: ['Escápula, Ombro'],
        core: {
          protocolo: '2 x 45',
          exercicios: ['Hollow Hold'],
        },
        neural: 'Barra Explosiva',
        treino_bloco1:
        {
          protocolo: '2 x 45',
          exercicios: ['AMRAP 10', 'Barra Fixa', 'Remada'],
        },
        treino_bloco2: '-',
        condicionamento: 'Corrida 1km',
      },
    },
  },
  {
    semestre: '2025.1',
    numeroSemana: 2,
    focoSemana: { nome: 'Resistência', intensidade: 50, descricao: 'Foco em resistência muscular' },
    treinos: {
      segunda: {
        nome: 'Treino 01',
        padroes_movimento: ['Puxar Vertical'],
        mobilidade: ['Escápula, Ombro'],
        core: {
          protocolo: '2 x 45',
          exercicios: ['Hollow Hold'],
        },
        neural: 'Barra Explosiva',
        treino_bloco1:
        {
          protocolo: '2 x 45',
          exercicios: ['AMRAP 10', 'Barra Fixa', 'Remada'],
        },
        treino_bloco2: '-',
        condicionamento: 'Corrida 1km',
      },
      quarta: {
        nome: 'Treino 03',
        padroes_movimento: ['Agachar'],
        mobilidade: ['Quadril, Tornozelo'],
        core: {
          protocolo: '3 x 20',
          exercicios: ['Plank Reach'],
        },
        neural: 'Jump Squat',
        treino_bloco1: {
          protocolo: '5 x 5',
          exercicios: ['Front Squat'],
        },
        treino_bloco2: '-',
        condicionamento: 'Sled Push',
      },
    },
  },
]

function renderCell(treino, key) {
  const navigate = useNavigate()
  if (!treino) return '-'

  switch (key) {
    case 'nome':
      return <TreinoCell treino={treino} />

    case 'padroes_movimento':
      return treino.padroes_movimento ? (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {treino.padroes_movimento.map((padrao, index) => (
            <Chip key={index} label={padrao} size="small" variant="outlined" />
          ))}
        </Stack>
      ) : '-'

    case 'mobilidade':
      return treino.mobilidade?.join(', ')

    case 'core':
      return (
        <>
          <Typography variant="body2">{treino.core?.protocolo}</Typography>
          <Typography variant="caption" color="text.secondary">
            {treino.core?.exercicios?.join(', ')}
          </Typography>
        </>
      )

    case 'treino_bloco1':
      return (
        <>
          <Typography variant="body2">
            {treino.treino_bloco1?.protocolo}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {treino.treino_bloco1?.exercicios?.join(', ')}
          </Typography>
        </>
      )


    case 'treino_bloco2':
      return (
        <>
          <Typography variant="body2">
            {treino.treino_bloco2?.protocolo}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {treino.treino_bloco2?.exercicios?.join(', ')}
          </Typography>
        </>
      )

    case 'acoes':
      return treino ? (
        <Button
          size="small"
          variant="contained"
          onClick={() => navigate(`/treinos/form-demo`)}//${treino.id}`
          sx={{
            '@media print': {
              display: 'none',
            },
          }}
        >
          Ver
        </Button>
      ) : '-'

    default:
      return treino[key] || '-'
  }
}

// 🔹 Componente do formulário de nova semana
function NovaSemanaDialog({ open, onClose, onSave }) {
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    semestre: 1,
    numeroSemana: 1,
    focoSemanaId: '',
  })

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSave = () => {
    // Validação básica
    if (!formData.focoSemanaId) {
      alert('Por favor, selecione um foco da semana')
      return
    }

    // Encontra o foco da semana selecionado
    const focoSemana = focosSemanaMock.find(foco => foco.id === formData.focoSemanaId)
    
    // Cria a nova semana
    const novaSemana = {
      semestre: `${formData.ano}.${formData.semestre}`,
      numeroSemana: formData.numeroSemana,
      focoSemana: focoSemana,
      treinos: {} // Inicialmente vazia, será preenchida posteriormente
    }

    onSave(novaSemana)
    
    // Reset do formulário
    setFormData({
      ano: new Date().getFullYear(),
      semestre: 1,
      numeroSemana: 1,
      focoSemanaId: '',
    })
    
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova Semana de Treino</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Ano"
            type="number"
            value={formData.ano}
            onChange={handleChange('ano')}
            inputProps={{ min: 2020, max: 2030 }}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Semestre</InputLabel>
            <Select
              value={formData.semestre}
              onChange={handleChange('semestre')}
              label="Semestre"
            >
              <MenuItem value={1}>1º Semestre</MenuItem>
              <MenuItem value={2}>2º Semestre</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Número da Semana"
            type="number"
            value={formData.numeroSemana}
            onChange={handleChange('numeroSemana')}
            inputProps={{ min: 1, max: 52 }}
            helperText="Ordem de aparição da semana (1, 2, 3...)"
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Foco da Semana</InputLabel>
            <Select
              value={formData.focoSemanaId}
              onChange={handleChange('focoSemanaId')}
              label="Foco da Semana"
            >
              {focosSemanaMock.map((foco) => (
                <MenuItem key={foco.id} value={foco.id}>
                  {foco.nome} {foco.intensidade && `(${foco.intensidade}%)`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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


function SemanaTable({ semana }) {
  return (
    <Box mb={6}>
      <Stack direction="row" alignItems="left" spacing={2} mb={2}>
        <Typography variant="h6" fontWeight="700">
          Semana {String(semana.numeroSemana).padStart(2, '0')} — {semana.focoSemana?.nome}
          {semana.focoSemana?.intensidade && ` (${semana.focoSemana.intensidade}%)`}
        </Typography>
        <Chip label={semana.semestre} size="small" />
        {semana.focoSemana && (
          <Chip 
            label={`Foco: ${semana.focoSemana.nome}`}
            color="primary" 
            variant="outlined" 
            size="small" 
          />
        )}
      </Stack>

      <TableContainer component={Paper} sx={{ mb: 4, maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {diasSemana.map((dia) => (
                <TableCell key={dia.key} align="left">
                  {dia.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {linhasTabela.map((linha) => (
              <TableRow key={linha.key}>
                {/* Coluna fixa da esquerda */}
                <TableCell sx={{ fontWeight: 600, position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper' }}>
                  {linha.label}
                </TableCell>

                {/* Colunas dos dias */}
                {diasSemana.map((dia) => {
                  const treino = semana.treinos[dia.key]

                  return (
                    <TableCell key={dia.key} align="left">
                      {renderCell(treino, linha.key)}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

function Semanas() {
  const [semanas, setSemanas] = useState(semanasMock)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleNovaSemana = (novaSemana) => {
    setSemanas(prev => [...prev, novaSemana])
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="700">
          Semanas de Treino
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setDialogOpen(true)}
          sx={{ minWidth: 150 }}
        >
          + Nova Semana
        </Button>
      </Stack>

      {semanas.map((semana) => (
        <SemanaTable
          key={`${semana.semestre}-${semana.numeroSemana}`}
          semana={semana}
        />
      ))}

      <NovaSemanaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleNovaSemana}
      />
    </Container>
  )
}

export default Semanas
