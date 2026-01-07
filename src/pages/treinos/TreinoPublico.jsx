import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material'
import { 
  FitnessCenter as FitnessCenterIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import { trainingService } from '../../services/trainingService'

const TreinoPublico = () => {
  const { token } = useParams()
  const [treino, setTreino] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPublicTraining = async () => {
      try {
        setLoading(true)
        
        // Carregar treino público usando o service
        const trainingData = await trainingService.getPublicTraining(token)
        
        if (!trainingData) {
          setError('Treino não encontrado ou link expirado.')
          return
        }

        // Verificar se o link está ativo
        if (trainingData.link_active === false) {
          setError('Este link de compartilhamento foi desativado.')
          return
        }
        
        setTreino(trainingData)
      } catch (err) {
        console.error('Erro ao carregar treino público:', err)
        setError('Não foi possível carregar o treino. Verifique se o link está correto.')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadPublicTraining()
    }
  }, [token])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getBlockTitle = (blockType) => {
    const titles = {
      'MOBILIDADE_ARTICULAR': '🤸‍♀️ Mobilidade Articular',
      'ATIVACAO_CORE': '💪 Ativação de Core',  
      'ATIVACAO_NEURAL': '⚡ Ativação Neural',
      'TREINO_PRINCIPAL_BLOCO_1': '🏋️‍♂️ Treino Principal - Bloco 1',
      'TREINO_PRINCIPAL_BLOCO_2': '🏋️‍♂️ Treino Principal - Bloco 2',
      'CONDICIONAMENTO_FISICO': '🏃‍♀️ Condicionamento Físico'
    }
    return titles[blockType] || blockType
  }

  const formatExerciseDetails = (prescription) => {
    const details = []
    
    if (prescription.sets) {
      details.push(`${prescription.sets} séries`)
    }
    
    if (prescription.reps) {
      details.push(`${prescription.reps} repetições`)
    }
    
    if (prescription.weight_kg) {
      details.push(`${prescription.weight_kg}kg`)
    }
    
    if (prescription.duration_seconds) {
      details.push(`${prescription.duration_seconds}s`)
    }
    
    if (prescription.rest_seconds) {
      details.push(`${prescription.rest_seconds}s descanso`)
    }
    
    return details.join(' • ')
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              Carregando treino...
            </Typography>
          </Stack>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!treino) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          Treino não encontrado ou link expirado.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <VisibilityIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="700">
            {treino.name}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={3} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarIcon />
            <Typography variant="body1">
              {formatDate(treino.scheduled_date)}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            <Typography variant="body1">
              Visualização Pública
            </Typography>
          </Box>
        </Stack>
        
        {treino.description && (
          <Alert severity="info" sx={{ mt: 3, bgcolor: 'rgba(255,255,255,0.1)', border: 'none' }}>
            <Typography variant="body1" sx={{ color: 'inherit' }}>
              {treino.description}
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Blocos de Treino */}
      <Stack spacing={3}>
        {treino.training_blocks?.map((block, blockIndex) => (
          <Card key={blockIndex} elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FitnessCenterIcon color="primary" />
                <Typography variant="h6" fontWeight="600" color="primary">
                  {getBlockTitle(block.block_type)}
                </Typography>
                {block.exercise_prescriptions?.length > 0 && (
                  <Chip 
                    icon={<TimerIcon />}
                    label={`${block.exercise_prescriptions.length} exercícios`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                {block.exercise_prescriptions?.length > 0 ? (
                  block.exercise_prescriptions.map((prescription, exerciseIndex) => (
                    <ListItem key={exerciseIndex} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="600">
                            {exerciseIndex + 1}. {prescription.exercise?.name}
                          </Typography>
                        }
                        secondary={formatExerciseDetails(prescription) || 'Sem especificações'}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          Nenhum exercício definido para este bloco
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Footer */}
      <Paper elevation={1} sx={{ mt: 6, p: 3, bgcolor: 'grey.50', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          💪 Este treino foi compartilhado com você pelo seu personal trainer
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Para dúvidas sobre os exercícios, entre em contato com seu profissional
        </Typography>
      </Paper>
    </Container>
  )
}

export default TreinoPublico