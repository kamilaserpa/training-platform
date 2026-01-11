import { useState, useEffect } from 'react';
import { weekService } from '../services/weekService';
import { trainingService } from '../services/trainingService';
import type { TrainingWeek } from '../types/database.types';

/**
 * Hook para buscar todas as semanas com seus treinos, blocos e exercícios
 * para exportação
 */
export function useExportData() {
  const [weeks, setWeeks] = useState<TrainingWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExportData();
  }, []);

  const fetchExportData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar todas as semanas com relacionamentos básicos
      const allWeeks = await weekService.getAllTrainingWeeks();
      
      // Buscar detalhes completos de cada treino (blocos e exercícios)
      const weeksWithDetails = await Promise.all(
        allWeeks.map(async (week) => {
          if (!week.trainings || week.trainings.length === 0) {
            return week;
          }

          // Para cada treino, buscar detalhes completos
          const trainingsWithDetails = await Promise.all(
            week.trainings.map(async (training) => {
              try {
                const detailedTraining = await trainingService.getTrainingById(training.id);
                return detailedTraining || training;
              } catch (err) {
                console.error(`Erro ao buscar detalhes do treino ${training.id}:`, err);
                return training;
              }
            })
          );

          return {
            ...week,
            trainings: trainingsWithDetails,
          };
        })
      );

      setWeeks(weeksWithDetails);
    } catch (err: any) {
      console.error('Erro ao buscar dados para exportação:', err);
      setError(err?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchExportData();
  };

  return { weeks, loading, error, refresh };
}
