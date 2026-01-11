import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { pdfConfig, blockTableStyles } from './pdfStyles'
import { addPDFHeader, addPDFFooter, formatDate, formatProtocol, checkPageBreak } from './pdfUtils'

/**
 * Gera PDF de um treino individual (1 treino por página)
 */
export const generateTreinoPDF = async (treino, logoBase64 = null) => {
  const doc = new jsPDF({
    orientation: pdfConfig.orientation,
    unit: 'mm',
    format: pdfConfig.format
  })

  // Header
  const title = `Treino: ${treino.name || 'Sem nome'}`
  const subtitle = 'Prescrição de treino'
  let yPos = addPDFHeader(doc, logoBase64, title, subtitle)

  // Informações do treino (compact)
  yPos += 3
  doc.setFontSize(pdfConfig.fonts.small)
  doc.setTextColor(pdfConfig.colors.text)
  doc.setFont(undefined, 'normal')

  const infoLines = []
  
  if (treino.scheduled_date) {
    infoLines.push(`Data: ${formatDate(treino.scheduled_date)}`)
  }
  
  if (treino.training_week?.name) {
    let weekInfo = `Semana: ${treino.training_week.name}`
    if (treino.training_week.week_focus?.name) {
      weekInfo += ` | Foco: ${treino.training_week.week_focus.name}`
    }
    infoLines.push(weekInfo)
  }
  
  if (treino.movement_pattern?.name) {
    infoLines.push(`Padrao de Movimento: ${treino.movement_pattern.name}`)
  }
  
  if (treino.intensity_level) {
    infoLines.push(`Intensidade: ${treino.intensity_level}/10`)
  }

  infoLines.forEach(line => {
    doc.text(line, pdfConfig.margins.left, yPos)
    yPos += 4
  })

  // Observações gerais (compact)
  if (treino.description) {
    yPos += 2
    doc.setFont(undefined, 'bold')
    doc.text('Obs:', pdfConfig.margins.left, yPos)
    yPos += 4
    doc.setFont(undefined, 'normal')
    doc.setFontSize(pdfConfig.fonts.small)
    const descLines = doc.splitTextToSize(treino.description, 180)
    const maxDescLines = 2 // Limit description lines
    descLines.slice(0, maxDescLines).forEach(line => {
      doc.text(line, pdfConfig.margins.left + 5, yPos)
      yPos += 4
    })
    doc.setFontSize(pdfConfig.fonts.body)
  }

  // Blocos de treino
  if (treino.training_blocks && treino.training_blocks.length > 0) {
    yPos += 5
    treino.training_blocks.forEach((block, blockIndex) => {
      // Pular blocos sem exercícios
      if (!block.exercise_prescriptions || block.exercise_prescriptions.length === 0) {
        return
      }
      
      // Nome do bloco
      doc.setFontSize(pdfConfig.fonts.heading)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(pdfConfig.colors.primary)
      doc.text(`${block.name}`, pdfConfig.margins.left, yPos)
      yPos += 5

      // Block instructions (apenas se existir)
      if (block.instructions) {
        doc.setFontSize(pdfConfig.fonts.small)
        doc.setFont(undefined, 'italic')
        doc.setTextColor(pdfConfig.colors.textLight)
        doc.text(`Obs: ${block.instructions}`, pdfConfig.margins.left, yPos)
        yPos += 4
      }

      // Exercícios do bloco
      const exerciseData = block.exercise_prescriptions.map((prescription, idx) => {
        const exerciseName = prescription.exercise?.name || 'Exercicio sem nome'
        const protocol = formatProtocol(prescription)
        // Campo notes contém as instruções/observações de todos os tipos de exercícios
        const instructions = prescription.notes || '-'
        
        return [
          exerciseName,
          protocol,
          instructions
        ]
      })

      autoTable(doc, {
        startY: yPos,
        head: [['Exercicio', 'Protocolo', 'Instrucoes']],
        body: exerciseData,
        ...blockTableStyles,
        margin: { left: pdfConfig.margins.left, right: pdfConfig.margins.right },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 35 },
          2: { cellWidth: 'auto', fontSize: 7 }
        }
      })

      yPos = doc.lastAutoTable.finalY + 5
    })
  } else {
    yPos += 5
    doc.setFontSize(pdfConfig.fonts.body)
    doc.setFont(undefined, 'italic')
    doc.setTextColor(pdfConfig.colors.textLight)
    doc.text('Treino criado - blocos e exercicios serao definidos posteriormente', pdfConfig.margins.left, yPos)
  }

  // Footer
  addPDFFooter(doc)

  // Salvar PDF
  const fileName = `Treino_${treino.name?.replace(/[^a-z0-9]/gi, '_') || 'sem_nome'}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)

  return doc
}
