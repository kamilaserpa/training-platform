// Página de listagem de treinos - Material UI
// import { useEffect, useState } from 'react'
// import { treinosService } from '../services/treinos'
// import { useAuth } from '../contexts/AuthContext'
// import { useNavigate } from 'react-router-dom'
// import {
//   Container,
//   Grid,
//   Card,
//   CardContent,
//   CardActions,
//   Typography,
//   Button,
//   Box,
//   Chip,
//   IconButton,
//   Fab,
//   Stack,
//   CircularProgress,
// } from '@mui/material'
// import {
//   Add as AddIcon,
//   Visibility as ViewIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   FitnessCenter as FitnessCenterIcon,
// } from '@mui/icons-material'
//
// const Treinos = () => {
//   const [treinos, setTreinos] = useState([])
//   const [loading, setLoading] = useState(true)
//   const { canEdit } = useAuth()
//   const navigate = useNavigate()
//
//   useEffect(() => {
//     loadTreinos()
//   }, [])
//
//   const loadTreinos = async () => {
//     try {
//       const { data, error } = await treinosService.getAll()
//       if (error) throw error
//       setTreinos(data || [])
//     } catch (error) {
//       console.error('Erro ao carregar treinos:', error)
//     } finally {
//       setLoading(false)
//     }
//   }
//
//   const handleDelete = async (id) => {
//     if (!confirm('Tem certeza que deseja excluir este treino?')) return
//
//     try {
//       const { error } = await treinosService.delete(id)
//       if (error) throw error
//       loadTreinos()
//     } catch (error) {
//       alert('Erro ao excluir treino: ' + error.message)
//     }
//   }
//
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('pt-BR', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//   }
//
//   const getDateDisplay = (dateString) => {
//     const date = new Date(dateString)
//     return {
//       day: date.toLocaleDateString('pt-BR', { day: '2-digit' }),
//       month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()
//     }
//   }
//
//   if (loading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="60vh"
//       >
//         <CircularProgress />
//       </Box>
//     )
//   }
//
//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       {/* Header */}
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={4}
//       >
//         <Box display="flex" alignItems="center" gap={2}>
//           <FitnessCenterIcon sx={{ fontSize: 40, color: 'primary.main' }} />
//           <Typography variant="h4" component="h1" fontWeight="700">
//             Treinos
//           </Typography>
//         </Box>
//
//         {canEdit && (
//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={() => navigate('/treinos/novo')}
//             size="large"
//             sx={{
//               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//             }}
//           >
//             Novo Treino
//           </Button>
//         )}
//       </Box>
//
//       {/* Lista de Treinos */}
//       {treinos.length === 0 ? (
//         <Card sx={{ textAlign: 'center', py: 8 }}>
//           <CardContent>
//             <FitnessCenterIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
//             <Typography variant="h6" color="text.secondary" gutterBottom>
//               Nenhum treino cadastrado ainda.
//             </Typography>
//             {canEdit && (
//               <Button
//                 variant="contained"
//                 startIcon={<AddIcon />}
//                 onClick={() => navigate('/treinos/novo')}
//                 sx={{ mt: 2 }}
//               >
//                 Criar primeiro treino
//               </Button>
//             )}
//           </CardContent>
//         </Card>
//       ) : (
//         <Grid container spacing={3}>
//           {treinos.map((treino) => {
//             const dateDisplay = getDateDisplay(treino.data)
//
//             return (
//               <Grid item xs={12} sm={6} md={4} key={treino.id}>
//                 <Card
//                   sx={{
//                     height: '100%',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     transition: 'all 0.3s',
//                     '&:hover': {
//                       transform: 'translateY(-4px)',
//                       boxShadow: 4,
//                     },
//                   }}
//                 >
//                   <CardContent sx={{ flexGrow: 1 }}>
//                     {/* Data destacada */}
//                     <Box display="flex" gap={2} mb={2}>
//                       <Box
//                         sx={{
//                           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                           borderRadius: 2,
//                           p: 1.5,
//                           minWidth: 64,
//                           textAlign: 'center',
//                           color: 'white',
//                         }}
//                       >
//                         <Typography variant="h4" fontWeight="700" lineHeight={1}>
//                           {dateDisplay.day}
//                         </Typography>
//                         <Typography variant="caption" fontSize="0.75rem">
//                           {dateDisplay.month}
//                         </Typography>
//                       </Box>
//
//                       <Box flex={1}>
//                         <Typography
//                           variant="h6"
//                           component="h3"
//                           gutterBottom
//                           sx={{
//                             fontSize: '1rem',
//                             fontWeight: 600,
//                             textTransform: 'capitalize',
//                             lineHeight: 1.3,
//                           }}
//                         >
//                           {formatDate(treino.data)}
//                         </Typography>
//
//                         {treino.semanas?.tipos_treino && (
//                           <Chip
//                             label={treino.semanas.tipos_treino.nome}
//                             size="small"
//                             color="primary"
//                             variant="outlined"
//                           />
//                         )}
//                       </Box>
//                     </Box>
//
//                     {/* Observações */}
//                     {treino.observacoes && (
//                       <Typography
//                         variant="body2"
//                         color="text.secondary"
//                         sx={{
//                           mt: 2,
//                           pl: 1.5,
//                           borderLeft: 3,
//                           borderColor: 'primary.light',
//                         }}
//                       >
//                         {treino.observacoes}
//                       </Typography>
//                     )}
//                   </CardContent>
//
//                   {/* Actions */}
//                   <CardActions sx={{ px: 2, pb: 2 }}>
//                     <Stack direction="row" spacing={1} width="100%">
//                       <Button
//                         variant="contained"
//                         startIcon={<ViewIcon />}
//                         onClick={() => navigate(`/treinos/${treino.id}`)}
//                         fullWidth
//                         sx={{
//                           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                         }}
//                       >
//                         Ver
//                       </Button>
//
//                       {canEdit && (
//                         <>
//                           <IconButton
//                             color="primary"
//                             onClick={() => navigate(`/treinos/${treino.id}/editar`)}
//                             size="small"
//                           >
//                             <EditIcon />
//                           </IconButton>
//                           <IconButton
//                             color="error"
//                             onClick={() => handleDelete(treino.id)}
//                             size="small"
//                           >
//                             <DeleteIcon />
//                           </IconButton>
//                         </>
//                       )}
//                     </Stack>
//                   </CardActions>
//                 </Card>
//               </Grid>
//             )
//           })}
//         </Grid>
//       )}
//
//       {/* FAB para mobile */}
//       {canEdit && treinos.length > 0 && (
//         <Fab
//           color="primary"
//           aria-label="add"
//           onClick={() => navigate('/treinos/novo')}
//           sx={{
//             position: 'fixed',
//             bottom: 24,
//             right: 24,
//             display: { xs: 'flex', sm: 'none' }, // Apenas mobile
//             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           }}
//         >
//           <AddIcon />
//         </Fab>
//       )}
//     </Container>
//   )
// }
//
// export default Treinos

import { useNavigate } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Stack,
  Grid,
  Chip,
  Box,
} from '@mui/material'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import AddIcon from '@mui/icons-material/Add'

// 🔹 DADOS MOCKADOS
const treinosMock = [
  {
    id: 1,
    data: '12/08/2025',
    semana: '01',
    diaSemana: 'Segunda-feira',
    padrao_movimento: 'DOBRAR E PUXAR V',
    mobilidade: ['Ombro', 'Tronco', 'Quadril', 'Tornozelo'],
    core: {
      protocolo: '2 x 30"x15"',
      exercicios: ['Prancha', 'OHS'],
    },
    neural: ['Burpee'],
    treino_bloco1: {
      protocolo: '8 x 30"x15"',
      exercicios: ['Levantamento Terra', 'Cadeira Flexora'],
    },
    condicionamento: ['Burpee Tabata'],
  },
  {
    id: 2,
    data: '14/08/2025',
    semana: '01',
    diaSemana: 'Terça-feira',
    padrao_movimento: 'AGACHAR E EMPURRAR V',
    mobilidade: ['Quadril', 'Joelho', 'Tornozelo'],
    core: {
      protocolo: '3 x 40"x20"',
      exercicios: ['Dead Bug', 'Prancha Lateral'],
    },
    neural: ['Saltos no Caixote'],
    treino_bloco1: {
      protocolo: '10 x 30"x20"',
      exercicios: ['Agachamento Livre', 'Afundo'],
    },
    condicionamento: ['Bike 10 min'],
  },
  {
    id: 3,
    data: '16/08/2025',
    semana: '01',
    diaSemana: 'Quarta-feira',
    padrao_movimento: 'ROTACIONAR E EMPURRAR H',
    mobilidade: ['Coluna Torácica', 'Ombro'],
    core: {
      protocolo: '3 x 30"',
      exercicios: ['Russian Twist'],
    },
    neural: ['Medicine Ball Throw'],
    treino_bloco1: {
      protocolo: 'EMOM 12’',
      exercicios: ['Push Press', 'Wall Ball'],
    },
    condicionamento: ['Corda 5 min'],
  },
  {
    id: 4,
    data: '18/08/2025',
    semana: '01',
    diaSemana: 'Quinta-feira',
    padrao_movimento: 'PUXAR VERTICAL',
    mobilidade: ['Escápula', 'Ombro'],
    core: {
      protocolo: '2 x 45"',
      exercicios: ['Hollow Hold'],
    },
    neural: ['Barra Explosiva'],
    treino_bloco1: {
      protocolo: 'AMRAP 10’',
      exercicios: ['Barra Fixa', 'Remada Curvada'],
    },
    condicionamento: ['Corrida 1km'],
  },
  {
    id: 5,
    data: '20/08/2025',
    semana: '01',
    diaSemana: 'Sexta-feira',
    padrao_movimento: 'AGACHAR',
    mobilidade: ['Quadril', 'Tornozelo'],
    core: {
      protocolo: '3 x 20"',
      exercicios: ['Plank Reach'],
    },
    neural: ['Jump Squat'],
    treino_bloco1: {
      protocolo: '5 x 5',
      exercicios: ['Front Squat'],
    },
    condicionamento: ['Sled Push'],
  },
]

function Treinos() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <FitnessCenterIcon color="primary" fontSize="large" />
          <Typography variant="h4" fontWeight="700">
            Treinos
          </Typography>
        </Stack>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/treinos/novo')}
          sx={{ minWidth: 150 }}
        >
          + Novo Treino
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {treinosMock.map((treino) => (
          <Grid
            item
            key={treino.id}
            xs={12}
            sm={6}
            md={4}
            lg={2.4}
          >
            <Card key={treino.id} variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}>
              <CardContent>
                {/* Cabeçalho do treino */}
                <Stack spacing={0.5} mb={2}>
                  <Typography variant="subtitle1" fontWeight="700">
                    Treino
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {`Semana ${treino.semana} - ${treino.diaSemana}`}
                  </Typography>
                  <Chip
                    label={treino.padrao_movimento}
                    size="small"
                    color="primary"
                    sx={{ width: 'fit-content', mt: 1 }}
                  />
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <List dense disablePadding>
                  {/* Mobilidade */}
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Mobilidade Articular"
                      secondary={treino.mobilidade.join(', ')}
                    />
                  </ListItem>

                  {/* Core */}
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Ativação de Core"
                      secondary={
                        <>
                          <Typography variant="body2">
                            {treino.core.protocolo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {treino.core.exercicios.join(', ')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>

                  {/* Neural */}
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Ativação Neural"
                      secondary={treino.neural.join(', ')}
                    />
                  </ListItem>

                  {/* Bloco 01 */}
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Treino Bloco 01"
                      secondary={
                        <>
                          <Typography variant="body2">
                            {treino.treino_bloco1.protocolo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {treino.treino_bloco1.exercicios.join(', ')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>

                  {/* Condicionamento */}
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Condicionamento Físico"
                      secondary={treino.condicionamento.join(', ')}
                    />
                  </ListItem>
                </List>

                <Box mt="auto">
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate(`/treinos/form-demo`)} ///${treino.id}
                  >
                    Ver detalhes do treino
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default Treinos
