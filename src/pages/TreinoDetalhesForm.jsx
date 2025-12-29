// Página TreinoDetalhes com React Hook Form - Versão Completa
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
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
} from '../components/form'

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

 // Estados para cada seção do treino
 const [mobilidadeItems, setMobilidadeItems] = useState(['Ombro', 'Tronco', 'Quadril', 'Tornozelo'])
 const [coreItems, setCoreItems] = useState([
   { nome: 'Prancha', series: 3, tempo: 30, intervalo: 10 },
   { nome: 'OHS', series: 3, tempo: 45, intervalo: 15 },
 ])
 const [neuralItems, setNeuralItems] = useState([
   { nome: 'Burpee', series: 3, tempo: 20 },
   { nome: 'OHS', series: 3, tempo: 30 },
 ])
 const [treinoBloco1, setTreinoBloco1] = useState([
   { nome: 'Levantamento Terra', series: 4, repeticoes: '8-10', carga: '80kg', tempo: 90 },
   { nome: 'Cadeira Flexora', series: 3, repeticoes: '12-15', carga: '50kg', tempo: 60 },
 ])
 const [treinoBloco2, setTreinoBloco2] = useState([])
 const [condicionamentoItems, setCondicionamentoItems] = useState([
   { nome: 'Burpee - Tabata', duracao: '4 min' },
 ])

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
   { id: 'dobrar_puxar', label: 'DOBRAR E PUXAR H' },
   { id: 'empurrar', label: 'EMPURRAR H' },
   { id: 'agachar', label: 'AGACHAR' },
   { id: 'articular', label: 'ARTICULAR' },
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
   <Container maxWidth="lg" sx={{ py: 4 }}>
     {/* Header */}
     <Box mb={4}>
       <Button
         startIcon={<ArrowBackIcon />}
         onClick={() => navigate('/treinos')}
         sx={{ mb: 2 }}
       >
         Voltar
       </Button>

       <Box display="flex" alignItems="center" gap={2} mb={2}>
         <FitnessCenterIcon sx={{ fontSize: 40, color: 'primary.main' }} />
         <Typography variant="h4" fontWeight="700">
           Criar Treino
         </Typography>
       </Box>

       <Typography variant="body1" color="text.secondary">
         Preencha os campos abaixo para criar um treino completo
       </Typography>
     </Box>

     {/* Botão Submit no topo */}
     <Button
       variant="contained"
       size="large"
       startIcon={<SaveIcon />}
       onClick={handleSubmit(onSubmit)}
       sx={{
         mb: 3,
         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
       }}
     >
       SALVAR TREINO
     </Button>

     {/* Formulário */}
     <FormProvider {...methods}>
       <form>
         <Stack spacing={3}>
           {/* Card: Informações Básicas */}
           <Card>
             <CardContent>
               <Typography variant="h6" fontWeight="600" gutterBottom>
                 📋 Informações Básicas
               </Typography>
               <Divider sx={{ mb: 3 }} />

               <Grid container spacing={2}>
                 <Grid item xs={12} sm={6}>
                   <FormSelect
                     name="padrao_movimento"
                     label="Padrão de Movimento"
                     options={padroesMovimentoOptions}
                     required
                   />
                 </Grid>

                 <Grid item xs={12} sm={6}>
                   <FormSelect
                     name="semana"
                     label="Semana"
                     options={semanasOptions}
                     required
                   />
                 </Grid>

                 <Grid item xs={12} sm={6}>
                   <FormDatePicker
                     name="data"
                     label="Data do Treino"
                     required
                   />
                 </Grid>

                 <Grid item xs={12} sm={6}>
                   <FormCheckbox
                     name="link_ativo"
                     label="Link de compartilhamento ativo"
                   />
                 </Grid>

                 <Grid item xs={12}>
                   <FormInput
                     name="observacoes"
                     label="Observações Gerais (visíveis para o aluno)"
                     multiline
                     rows={3}
                   />
                 </Grid>
               </Grid>
             </CardContent>
           </Card>

           {/* Card: Estrutura do Treino */}
           <Card>
             <CardContent>
               <Typography variant="h6" fontWeight="600" gutterBottom>
                 🏋️ Estrutura do Treino
               </Typography>
               <Divider sx={{ mb: 3 }} />

               <Grid container spacing={3}>
                 {/* Mobilidade Articular */}
                 <Grid item xs={12} md={6}>
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
                 <Grid item xs={12} md={6}>
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
                 <Grid item xs={12} md={6}>
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
                 <Grid item xs={12}>
                   <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                     <Box display="flex" alignItems="center" gap={1}>
                       <Typography variant="subtitle1" fontWeight="600">
                         💪 Treino Bloco 01
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
                     Adicionar Exercício
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
                                  <Grid item xs={12}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="subtitle1" fontWeight="600">
                                          💪 Treino Bloco 02 <Chip label="Opcional" size="small" />
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
                                        Adicionar Exercício
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

                                  {/* Condicionamento Físico */}
                                  <Grid item xs={12} md={6}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                      <Typography variant="subtitle1" fontWeight="600">
                                        Condicionamento Físico
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
                              sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              }}
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

                 export default TreinoDetalhesForm


