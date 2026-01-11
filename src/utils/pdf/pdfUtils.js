import { jsPDF } from 'jspdf'
import { pdfConfig } from './pdfStyles'

/**
 * Converte imagem para base64
 */
export const imageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = url
  })
}

/**
 * Adiciona header padrão ao PDF
 */
export const addPDFHeader = (doc, logoBase64, title, subtitle) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = pdfConfig.margins.top
  
  // Logo (small, top-right corner)
  if (logoBase64) {
    try {
      const logoSize = 15
      const logoX = pageWidth - pdfConfig.margins.right - logoSize
      doc.addImage(logoBase64, 'PNG', logoX, yPos, logoSize, logoSize)
    } catch (error) {
      console.warn('Erro ao adicionar logo:', error)
    }
  }
  
  // Title (left side)
  doc.setFontSize(pdfConfig.fonts.title)
  doc.setTextColor(pdfConfig.colors.primary)
  doc.setFont(undefined, 'bold')
  doc.text(title, pdfConfig.margins.left, yPos + 8)
  
  // Subtitle
  if (subtitle) {
    doc.setFontSize(pdfConfig.fonts.subtitle)
    doc.setTextColor(pdfConfig.colors.text)
    doc.setFont(undefined, 'normal')
    doc.text(subtitle, pdfConfig.margins.left, yPos + 16)
  }
  
  // Linha separadora
  yPos += 22
  doc.setDrawColor(pdfConfig.colors.border)
  doc.setLineWidth(0.5)
  doc.line(pdfConfig.margins.left, yPos, pageWidth - pdfConfig.margins.right, yPos)
  
  return yPos + 5
}

/**
 * Adiciona footer padrão ao PDF
 */
export const addPDFFooter = (doc) => {
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageNum = doc.internal.getCurrentPageInfo().pageNumber
  
  doc.setFontSize(pdfConfig.fonts.small)
  doc.setTextColor(pdfConfig.colors.textLight)
  doc.text(
    `Training Platform - Página ${pageNum}`,
    pageWidth / 2,
    pageHeight - pdfConfig.margins.bottom + 5,
    { align: 'center' }
  )
}

/**
 * Formata data para exibição
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formata protocolo de exercício
 */
export const formatProtocol = (prescription) => {
  if (!prescription) return ''
  
  const parts = []
  
  if (prescription.sets) {
    parts.push(`${prescription.sets}x`)
  }
  
  if (prescription.reps) {
    parts.push(prescription.reps)
  }
  
  if (prescription.duration_seconds) {
    parts.push(`${prescription.duration_seconds}"`)
  }
  
  if (prescription.rest_seconds) {
    parts.push(`x${prescription.rest_seconds}"`)
  }
  
  return parts.join(' ')
}

/**
 * Quebra texto longo em linhas
 */
export const splitText = (doc, text, maxWidth) => {
  return doc.splitTextToSize(text, maxWidth)
}

/**
 * Verifica se precisa adicionar nova página
 */
export const checkPageBreak = (doc, yPosition, minSpaceNeeded = 40) => {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (yPosition + minSpaceNeeded > pageHeight - pdfConfig.margins.bottom) {
    doc.addPage()
    addPDFFooter(doc)
    return pdfConfig.margins.top + 15
  }
  return yPosition
}
