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
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

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

// 🔹 Definição das linhas da tabela
const linhasTabela = [
  { key: 'nome', label: 'Treino' },
  { key: 'diaSemana', label: 'Dia' },
  { key: 'padrao_movimento', label: 'Padr. Mov.' },
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
    treinos: {
      segunda: {
        nome: 'Treino 01',
        padrao_movimento: 'DOBRAR E PUXAR V',
        mobilidade: ['Ombro, Tronco, Quadril, Tornozelo'],
       core: {
         protocolo: '2 x 30"x15"',
         exercicios: ['Prancha', 'OHS'],
       },
        neural: 'Burpee',
        treino_bloco1:        {
               protocolo: '8 x 30"x15"',
               exercicios: ['Lev. Terra', 'Cad. Flexora'],
             },
        treino_bloco2: '-',
        condicionamento: 'Burpee Tabata',
      },
      terca: {
        nome: 'Treino 02',
        padrao_movimento: 'AGACHAR E EMPURRAR V',
        mobilidade: ['Quadril, Joelho, Tornozelo'],
        core: {
          protocolo: '3 x 40"x20"',
          exercicios: ['Dead Bug', 'Prancha Lat.'],
        },
        neural: 'Saltos no Caixote',
    treino_bloco1:         {
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
              padrao_movimento: 'AGACHAR',
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
                    padrao_movimento: 'PUXAR VERTICAL',
                    mobilidade: ['Escápula, Ombro'],
                     core: {
                              protocolo: '2 x 45',
                              exercicios: ['Hollow Hold'],
                            },
                    neural: 'Barra Explosiva',
                    treino_bloco1:
                    {
                      protocolo: '2 x 45',
                      exercicios: ['AMRAP 10','Barra Fixa', 'Remada'],
                    },
                    treino_bloco2: '-',
                    condicionamento: 'Corrida 1km',
                  },
    },
  },
  {
    semestre: '2025.1',
    numeroSemana: 2,
    treinos: {
      segunda: {
        nome: 'Treino 01',
        padrao_movimento: 'PUXAR VERTICAL',
        mobilidade: ['Escápula, Ombro'],
         core: {
                  protocolo: '2 x 45',
                  exercicios: ['Hollow Hold'],
                },
        neural: 'Barra Explosiva',
        treino_bloco1:
        {
          protocolo: '2 x 45',
          exercicios: ['AMRAP 10','Barra Fixa', 'Remada'],
        },
        treino_bloco2: '-',
        condicionamento: 'Corrida 1km',
      },
      quarta: {
        nome: 'Treino 03',
        padrao_movimento: 'AGACHAR',
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
  if (!treino) return '-'

  switch (key) {
    case 'nome':
      return <TreinoCell treino={treino} />

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
          variant="outlined"
          onClick={() => navigate(`/treinos/${treino.id}`)}
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


function SemanaTable({ semana }) {
  return (
    <Box mb={6}>
      <Stack direction="row" alignItems="left" spacing={2} mb={2}>
        <Typography variant="h6" fontWeight="700">
          Semana {String(semana.numeroSemana).padStart(2, '0')}
        </Typography>
        <Chip label={semana.semestre} size="small" />
      </Stack>

       <TableContainer component={Paper} sx={{ mb: 4, maxWidth: '100%', overflowX: 'auto'}}>
            <Typography variant="h6" fontWeight="700" sx={{ p: 2 }}>
              Semana {semana.numero}
            </Typography>

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
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="700" mb={4}>
        Semanas de Treino
      </Typography>

      {semanasMock.map((semana) => (
        <SemanaTable
          key={`${semana.semestre}-${semana.numeroSemana}`}
          semana={semana}
        />
      ))}
    </Container>
  )
}

export default Semanas
