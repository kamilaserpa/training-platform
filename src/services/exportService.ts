import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TrainingWeek, Training, TrainingBlock } from '../types/database.types';
import dayjs from 'dayjs';

interface ExportData {
  weeks: TrainingWeek[];
}

interface CSVRow {
  Semana: string;
  Foco: string;
  Período: string;
  Treino: string;
  Dia: string;
  Bloco: string;
  Exercício: string;
  Protocolo: string;
  Observações: string;
}

/**
 * Formata protocolo de exercício (séries x reps, carga, etc)
 */
function formatProtocol(prescription: any): string {
  const parts: string[] = [];

  if (prescription.sets) {
    parts.push(`${prescription.sets}×`);
  }

  if (prescription.reps) {
    parts.push(`${prescription.reps} reps`);
  }

  if (prescription.duration_seconds) {
    const mins = Math.floor(prescription.duration_seconds / 60);
    const secs = prescription.duration_seconds % 60;
    if (mins > 0) {
      parts.push(`${mins}min${secs > 0 ? ` ${secs}s` : ''}`);
    } else {
      parts.push(`${secs}s`);
    }
  }

  if (prescription.load_percentage) {
    parts.push(`@${prescription.load_percentage}%`);
  }

  if (prescription.rest_seconds) {
    const restMins = Math.floor(prescription.rest_seconds / 60);
    const restSecs = prescription.rest_seconds % 60;
    const restStr = restMins > 0 ? `${restMins}min${restSecs > 0 ? ` ${restSecs}s` : ''}` : `${restSecs}s`;
    parts.push(`(descanso: ${restStr})`);
  }

  return parts.join(' ') || '-';
}

/**
 * Converte dados de treinos para linhas CSV
 */
function convertToCSVRows(weeks: TrainingWeek[]): CSVRow[] {
  const rows: CSVRow[] = [];

  weeks.forEach((week) => {
    const weekName = week.name || 'Sem nome';
    const weekFocus = week.week_focus?.name || 'Sem foco';
    const startDate = dayjs(week.start_date).format('DD/MM/YYYY');
    const endDate = dayjs(week.end_date).format('DD/MM/YYYY');
    const period = `${startDate} → ${endDate}`;

    const trainings = week.trainings || [];

    trainings.forEach((training) => {
      const trainingName = training.name || 'Sem nome';
      const trainingDay = dayjs(training.scheduled_date).format('DD/MM/YYYY');
      const blocks = training.training_blocks || [];

      if (blocks.length === 0) {
        // Treino sem blocos
        rows.push({
          Semana: weekName,
          Foco: weekFocus,
          Período: period,
          Treino: trainingName,
          Dia: trainingDay,
          Bloco: '-',
          Exercício: '-',
          Protocolo: '-',
          Observações: training.description || '-',
        });
        return;
      }

      blocks.forEach((block) => {
        const blockName = block.name || block.block_type || 'Sem nome';
        const blockNotes = block.instructions || '';
        const exercises = block.exercise_prescriptions || [];

        if (exercises.length === 0) {
          // Bloco sem exercícios
          rows.push({
            Semana: weekName,
            Foco: weekFocus,
            Período: period,
            Treino: trainingName,
            Dia: trainingDay,
            Bloco: blockName,
            Exercício: '-',
            Protocolo: '-',
            Observações: blockNotes,
          });
          return;
        }

        exercises.forEach((prescription) => {
          const exerciseName = prescription.exercise?.name || 'Exercício desconhecido';
          const protocol = formatProtocol(prescription);
          const notes = prescription.notes || blockNotes;

          rows.push({
            Semana: weekName,
            Foco: weekFocus,
            Período: period,
            Treino: trainingName,
            Dia: trainingDay,
            Bloco: blockName,
            Exercício: exerciseName,
            Protocolo: protocol,
            Observações: notes || '-',
          });
        });
      });
    });
  });

  return rows;
}

/**
 * Exporta dados para CSV
 */
export function exportToCSV(weeks: TrainingWeek[]): void {
  const rows = convertToCSVRows(weeks);
  const csv = Papa.unparse(rows, {
    quotes: true,
    delimiter: ',',
    header: true,
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM para UTF-8
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `treinos-prescritos-${dayjs().format('YYYY-MM-DD')}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta dados para PDF
 */
export function exportToPDF(weeks: TrainingWeek[]): void {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const marginBottom = 20;

  // Título do documento
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Treinos Prescritos', 14, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, yPosition);
  yPosition += 15;

  weeks.forEach((week, weekIndex) => {
    // Verifica se precisa de nova página
    if (yPosition > pageHeight - marginBottom - 30) {
      doc.addPage();
      yPosition = 20;
    }

    // Nome da semana
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${week.name || 'Semana sem nome'}`, 14, yPosition);
    yPosition += 7;

    // Foco e período
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const weekFocus = week.week_focus?.name || 'Sem foco definido';
    const startDate = dayjs(week.start_date).format('DD/MM/YYYY');
    const endDate = dayjs(week.end_date).format('DD/MM/YYYY');
    doc.text(`Foco: ${weekFocus}`, 14, yPosition);
    yPosition += 5;
    doc.text(`Período: ${startDate} → ${endDate}`, 14, yPosition);
    yPosition += 10;

    const trainings = week.trainings || [];

    trainings.forEach((training, trainingIndex) => {
      // Verifica se precisa de nova página
      if (yPosition > pageHeight - marginBottom - 20) {
        doc.addPage();
        yPosition = 20;
      }

      // Nome do treino
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const trainingDay = dayjs(training.scheduled_date).format('DD/MM/YYYY');
      doc.text(`  ${training.name || 'Treino'} - ${trainingDay}`, 14, yPosition);
      yPosition += 7;

      const blocks = training.training_blocks || [];

      if (blocks.length === 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('    Sem blocos cadastrados', 14, yPosition);
        yPosition += 5;
      } else {
        blocks.forEach((block) => {
          // Verifica espaço para o bloco
          if (yPosition > pageHeight - marginBottom - 40) {
            doc.addPage();
            yPosition = 20;
          }

          // Nome do bloco
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`    ${block.name || block.block_type || 'Bloco'}`, 14, yPosition);
          yPosition += 6;

          const exercises = block.exercise_prescriptions || [];

          if (exercises.length === 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.text('      Sem exercícios', 14, yPosition);
            yPosition += 5;
          } else {
            // Tabela de exercícios
            const tableData = exercises.map((prescription) => {
              const exerciseName = prescription.exercise?.name || 'Exercício';
              const protocol = formatProtocol(prescription);
              const notes = prescription.notes || '';
              return [exerciseName, protocol, notes];
            });

            autoTable(doc, {
              startY: yPosition,
              head: [['Exercício', 'Protocolo', 'Observações']],
              body: tableData,
              margin: { left: 20 },
              styles: { fontSize: 9, cellPadding: 2 },
              headStyles: { fillColor: [66, 139, 202], textColor: 255 },
              theme: 'striped',
              tableWidth: 'auto',
              columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 50 },
                2: { cellWidth: 60 },
              },
            });

            yPosition = (doc as any).lastAutoTable.finalY + 5;
          }

          // Observações do bloco
          if (block.instructions) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            const lines = doc.splitTextToSize(`      Obs: ${block.instructions}`, 180);
            lines.forEach((line: string) => {
              if (yPosition > pageHeight - marginBottom) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(line, 14, yPosition);
              yPosition += 4;
            });
          }

          yPosition += 3;
        });
      }

      // Observações do treino
      if (training.description) {
        if (yPosition > pageHeight - marginBottom - 10) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        const lines = doc.splitTextToSize(`  Observações: ${training.description}`, 180);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - marginBottom) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 14, yPosition);
          yPosition += 4;
        });
        yPosition += 3;
      }

      yPosition += 5;
    });

    yPosition += 10;
  });

  // Salvar PDF
  const fileName = `treinos-prescritos-${dayjs().format('YYYY-MM-DD')}.pdf`;
  doc.save(fileName);
}

/**
 * Exporta dados em ambos os formatos
 */
export function exportBothFormats(weeks: TrainingWeek[]): void {
  exportToCSV(weeks);
  exportToPDF(weeks);
}
