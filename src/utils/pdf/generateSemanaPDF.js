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

  // Período em linha única com data curta + dia abreviado
  const formatPeriodo = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const dd = String(day).padStart(2, '0')
    const mm = String(month).padStart(2, '0')
    const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
    const w = weekdays[date.getDay()]
    return `${dd}/${mm}/${year} (${w})`
  }

  const inicio = semana.start_date ? formatPeriodo(semana.start_date) : ''
  const termino = semana.end_date ? formatPeriodo(semana.end_date) : ''
  if (inicio && termino) {
    doc.text(`Período: ${inicio} - ${termino}`, pdfConfig.margins.left, yPos)
    yPos += 6
  } else if (inicio || termino) {
    const single = inicio || termino
    doc.text(`Período: ${single}`, pdfConfig.margins.left, yPos)
    yPos += 6
  }

  // Observações da semana
  if (semana.description) {
    // Observações em linha seguinte, sem espaço extra além da altura da linha
    const label = 'Observações:'
    // desenhar rótulo com mesma fonte/tamanho usado para medir largura
    doc.setFont(undefined, 'bold')
    doc.setFontSize(pdfConfig.fonts.body)
    doc.text(label, pdfConfig.margins.left, yPos)
    const labelWidth = doc.getTextWidth(label)
    // valor das observações na mesma linha, com quebra e mesma fonte do período
    doc.setFont(undefined, 'normal')
    doc.setFontSize(pdfConfig.fonts.body)
    const x = pdfConfig.margins.left + labelWidth + 2
    const maxWidth = 180 - (labelWidth + 2)
    const descLines = doc.splitTextToSize(semana.description, Math.max(60, maxWidth))
    doc.text(descLines, x, yPos)
    yPos += Math.max(6, descLines.length * 6)
  }

  // Conteúdo de treinos por seção com tabela de blocos
  yPos += 4
  
  if (!treinos || treinos.length === 0) {
    doc.setFont(undefined, 'italic')
    doc.setTextColor(pdfConfig.colors.textLight)
    doc.text('Nenhum treino definido para esta semana', pdfConfig.margins.left, yPos)
  } else {
    treinos.forEach((treino, idx) => {
      // Cabeçalho do treino
      doc.setFontSize(pdfConfig.fonts.body)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(pdfConfig.colors.text)
      const nomeTreino = treino.name || `Treino ${idx + 1}`
      const diaStr = treino.scheduled_date ? formatDate(treino.scheduled_date) : '-'
      const headerLine = `Treino: ${nomeTreino} | Dia: ${diaStr}`
      doc.text(headerLine, pdfConfig.margins.left, yPos)
      yPos += 6

      // Observações do treino
      doc.setFont(undefined, 'normal')
      if (treino.description) {
        const obsLabel = 'Obs.:'
        doc.text(obsLabel, pdfConfig.margins.left, yPos)
        const obsTextX = pdfConfig.margins.left + doc.getTextWidth(obsLabel) + 2
        const obsLines = doc.splitTextToSize(treino.description, 180)
        doc.text(obsLines, obsTextX, yPos)
        yPos += Math.max(5, obsLines.length * 4)
      }

      yPos += 2
      // Montar tabela de blocos
      const bodyRows = (treino.training_blocks || []).map((block) => {
        const blocoNome = block.name || '-'
        // Exercícios (nomes)
        let exercicios = '-'
        let protocolos = '-'
        if (block.exercise_prescriptions && block.exercise_prescriptions.length > 0) {
          const names = []
          const protos = []
          block.exercise_prescriptions.forEach((p) => {
            if (p.exercise?.name) names.push(p.exercise.name)
            // Montar protocolo: sets x (duration|reps) x rest
            let proto = ''
            if (p.sets) proto += `${p.sets}x`
            if (p.duration_seconds && p.duration_seconds > 0) {
              proto += ` ${p.duration_seconds}\"`
            } else if (p.reps) {
              proto += ` ${p.reps}`
            }
            if (p.rest_seconds && p.rest_seconds > 0) {
              proto += ` x${p.rest_seconds}\"`
            }
            if (proto) protos.push(proto)
          })
          exercicios = (names.join('\n') || '-')
          protocolos = (protos.join('\n') || '-')
        }
        const observacoes = block.notes || block.description || '-'
        return [blocoNome, exercicios, protocolos, observacoes]
      })

      autoTable(doc, {
        startY: yPos,
        head: [['Blocos', 'Exercícios', 'Protocolos', 'Observações']],
        body: bodyRows,
        ...tableStyles,
        margin: { left: pdfConfig.margins.left, right: pdfConfig.margins.right },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 65 },
          2: { cellWidth: 35 },
          3: { cellWidth: 'auto' }
        },
        didDrawPage: () => {
          addPDFFooter(doc)
        }
      })

      yPos = doc.lastAutoTable.finalY + 8
      // Espaço entre treinos; se ultrapassar página, autoTable gerencia startY automaticamente
      if (yPos > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage()
        yPos = pdfConfig.margins.top
      }
    })
  }

  // Footer final
  addPDFFooter(doc)

  // Salvar PDF
  const fileName = `Semana_${semana.name?.replace(/[^a-z0-9]/gi, '_') || 'sem_nome'}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)

  return doc
}
