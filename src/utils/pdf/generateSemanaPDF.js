import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { pdfConfig, tableStyles } from './pdfStyles'
import { addPDFHeader, addPDFFooter, formatDate } from './pdfUtils'

/**
 * Gera PDF de uma semana (múltiplos treinos por página - formato compacto)
 */
export const generateSemanaPDF = async (semana, treinos, logoBase64 = null) => {
  const doc = new jsPDF({
    orientation: pdfConfig.orientation,
    unit: 'mm',
    format: pdfConfig.format
  })

  // Header
  const title = `Semana: ${semana.name || 'Sem nome'}`
  const subtitle = semana.week_focus?.name ? `Foco: ${semana.week_focus.name}` : 'Programação de treinos'
  let yPos = addPDFHeader(doc, logoBase64, title, subtitle)

  // Informações da semana
  yPos += 5
  doc.setFontSize(pdfConfig.fonts.body)
  doc.setTextColor(pdfConfig.colors.text)
  doc.setFont(undefined, 'normal')

  const infoLines = []
  
  if (semana.start_date) {
    infoLines.push(`Inicio: ${formatDate(semana.start_date)}`)
  }
  
  if (semana.end_date) {
    infoLines.push(`Termino: ${formatDate(semana.end_date)}`)
  }

  infoLines.forEach(line => {
    doc.text(line, pdfConfig.margins.left, yPos)
    yPos += 6
  })

  // Observações da semana
  if (semana.description) {
    yPos += 3
    doc.setFont(undefined, 'bold')
    doc.text('Observacoes:', pdfConfig.margins.left, yPos)
    yPos += 6
    doc.setFont(undefined, 'normal')
    doc.setFontSize(pdfConfig.fonts.small)
    const descLines = doc.splitTextToSize(semana.description, 180)
    descLines.forEach(line => {
      doc.text(line, pdfConfig.margins.left + 5, yPos)
      yPos += 5
    })
    doc.setFontSize(pdfConfig.fonts.body)
  }

  // Tabela de treinos
  yPos += 10
  
  if (!treinos || treinos.length === 0) {
    doc.setFont(undefined, 'italic')
    doc.setTextColor(pdfConfig.colors.textLight)
    doc.text('Nenhum treino definido para esta semana', pdfConfig.margins.left, yPos)
  } else {
    doc.setFontSize(pdfConfig.fonts.subtitle)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(pdfConfig.colors.primary)
    doc.text('Treinos da Semana', pdfConfig.margins.left, yPos)
    yPos += 8

    // Preparar dados da tabela
    const tableData = treinos.map((treino, idx) => {
      // Data do treino
      const dataFormatada = treino.scheduled_date 
        ? formatDate(treino.scheduled_date).split(',')[0] // Só o dia da semana
        : '-'

      // Exercícios (primeiros 3, compactado)
      let exercicios = '-'
      if (treino.training_blocks && treino.training_blocks.length > 0) {
        const allExercises = []
        treino.training_blocks.forEach(block => {
          if (block.exercise_prescriptions && block.exercise_prescriptions.length > 0) {
            block.exercise_prescriptions.forEach(prescription => {
              if (prescription.exercise?.name) {
                allExercises.push(prescription.exercise.name)
              }
            })
          }
        })
        if (allExercises.length > 0) {
          exercicios = allExercises.slice(0, 3).join(', ')
          if (allExercises.length > 3) {
            exercicios += ` (+${allExercises.length - 3})`
          }
        }
      }

      // Número de blocos
      const blocos = treino.training_blocks?.length || 0

      // Condicionamento físico (se houver)
      const condFisico = treino.training_blocks?.some(
        block => block.block_type === 'CONDITIONING'
      ) ? 'Sim' : '-'

      // Observações (resumidas)
      let obs = '-'
      if (treino.description) {
        obs = treino.description.substring(0, 40)
        if (treino.description.length > 40) {
          obs += '...'
        }
      }

      return [
        treino.name || `Treino ${idx + 1}`,
        dataFormatada,
        exercicios,
        blocos.toString(),
        condFisico,
        obs
      ]
    })

    autoTable(doc, {
      startY: yPos,
      head: [['Treino', 'Dia', 'Exercícios', 'Blocos', 'Cond.', 'Observações']],
      body: tableData,
      ...tableStyles,
      margin: { left: pdfConfig.margins.left, right: pdfConfig.margins.right },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 55 },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 'auto' }
      },
      didDrawPage: (data) => {
        // Adicionar footer em cada página
        addPDFFooter(doc)
      }
    })

    yPos = doc.lastAutoTable.finalY + 10

    // Resumo estatístico
    doc.setFontSize(pdfConfig.fonts.body)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(pdfConfig.colors.primary)
    
    const totalTreinos = treinos.length
    const totalBlocos = treinos.reduce((sum, t) => sum + (t.training_blocks?.length || 0), 0)
    const totalExercicios = treinos.reduce((sum, t) => {
      return sum + (t.training_blocks?.reduce((blockSum, block) => {
        return blockSum + (block.exercise_prescriptions?.length || 0)
      }, 0) || 0)
    }, 0)

    doc.text('Resumo:', pdfConfig.margins.left, yPos)
    yPos += 7
    doc.setFont(undefined, 'normal')
    doc.setTextColor(pdfConfig.colors.text)
    doc.text(`- Total de treinos: ${totalTreinos}`, pdfConfig.margins.left + 5, yPos)
    yPos += 6
    doc.text(`- Total de blocos: ${totalBlocos}`, pdfConfig.margins.left + 5, yPos)
    yPos += 6
    doc.text(`- Total de exercicios: ${totalExercicios}`, pdfConfig.margins.left + 5, yPos)
  }

  // Footer final
  addPDFFooter(doc)

  // Salvar PDF
  const fileName = `Semana_${semana.name?.replace(/[^a-z0-9]/gi, '_') || 'sem_nome'}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)

  return doc
}
