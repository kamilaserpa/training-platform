// Mock de dados para semanas com treinos detalhados

export interface MockExercicio {
  nome: string;
}

export interface MockBloco {
  nome: string;
  protocolo: string;
  exercicios: MockExercicio[];
}

export interface MockTreino {
  id: string;
  nome: string;
  blocos: MockBloco[];
}

export interface MockDia {
  treino?: MockTreino;
}

export interface MockSemana {
  id: string;
  numeroSemana: number;
  focoSemana: string;
  status: 'active' | 'completed' | 'draft';
  dias: {
    segunda: MockDia;
    terca: MockDia;
    quarta: MockDia;
    quinta: MockDia;
    sexta: MockDia;
  };
}

export const mockSemanas: MockSemana[] = [
  {
    id: '1',
    numeroSemana: 1,
    focoSemana: 'Hipertrofia - Membros Inferiores',
    status: 'active',
    dias: {
      segunda: {
        treino: {
          id: 'treino-1',
          nome: 'Treino A',
          blocos: [
            {
              nome: 'Bloco 01',
              protocolo: '4×12',
              exercicios: [
                { nome: 'Agachamento Livre' },
                { nome: 'Leg Press 45°' },
                { nome: 'Cadeira Extensora' }
              ]
            },
            {
              nome: 'Bloco 02',
              protocolo: '3×15',
              exercicios: [
                { nome: 'Stiff' },
                { nome: 'Cadeira Flexora' }
              ]
            }
          ]
        }
      },
      terca: {},
      quarta: {
        treino: {
          id: 'treino-2',
          nome: 'Treino B',
          blocos: [
            {
              nome: 'Bloco 01',
              protocolo: '4×10',
              exercicios: [
                { nome: 'Supino Reto' },
                { nome: 'Supino Inclinado' },
                { nome: 'Crucifixo' }
              ]
            },
            {
              nome: 'Bloco 02',
              protocolo: 'EMOM 12\'',
              exercicios: [
                { nome: 'Flexão de Braço' },
                { nome: 'Push Press' }
              ]
            }
          ]
        }
      },
      quinta: {},
      sexta: {
        treino: {
          id: 'treino-3',
          nome: 'Treino C',
          blocos: [
            {
              nome: 'Bloco 01',
              protocolo: '3×12',
              exercicios: [
                { nome: 'Agachamento Búlgaro' },
                { nome: 'Afundo' }
              ]
            },
            {
              nome: 'Bloco 02',
              protocolo: '20\'',
              exercicios: [
                { nome: 'Corrida' },
                { nome: 'Bike' }
              ]
            }
          ]
        }
      }
    }
  },
  {
    id: '2',
    numeroSemana: 2,
    focoSemana: 'Força - Membros Superiores',
    status: 'draft',
    dias: {
      segunda: {
        treino: {
          id: 'treino-4',
          nome: 'Treino A',
          blocos: [
            {
              nome: 'Bloco 01',
              protocolo: '5×5',
              exercicios: [
                { nome: 'Supino Reto' },
                { nome: 'Desenvolvimento' }
              ]
            }
          ]
        }
      },
      terca: {},
      quarta: {
        treino: {
          id: 'treino-5',
          nome: 'Treino B',
          blocos: [
            {
              nome: 'Bloco 01',
              protocolo: '4×8',
              exercicios: [
                { nome: 'Barra Fixa' },
                { nome: 'Remada Curvada' }
              ]
            },
            {
              nome: 'Bloco 02',
              protocolo: '3×12',
              exercicios: [
                { nome: 'Rosca Direta' },
                { nome: 'Tríceps Testa' }
              ]
            }
          ]
        }
      },
      quinta: {},
      sexta: {}
    }
  },
  {
    id: '3',
    numeroSemana: 3,
    focoSemana: 'Resistência - Full Body',
    status: 'completed',
    dias: {
      segunda: {
        treino: {
          id: 'treino-6',
          nome: 'Treino Full A',
          blocos: [
            {
              nome: 'Bloco 01',
              protocolo: '8×30"×15"',
              exercicios: [
                { nome: 'Levantamento Terra' },
                { nome: 'Cadeira Flexora' }
              ]
            },
            {
              nome: 'Bloco 02',
              protocolo: 'EMOM 12\'',
              exercicios: [
                { nome: 'Push Press' },
                { nome: 'Wall Ball' }
              ]
            }
          ]
        }
      },
      terca: {},
      quarta: {
        treino: {
          id: 'treino-7',
          nome: 'Treino Full B',
          blocos: [
            {
              nome: 'Bloco 01',
              protocolo: 'AMRAP 15\'',
              exercicios: [
                { nome: 'Burpee' },
                { nome: 'Pull-up' },
                { nome: 'Box Jump' }
              ]
            }
          ]
        }
      },
      quinta: {},
      sexta: {
        treino: {
          id: 'treino-8',
          nome: 'Treino Full C',
          blocos: [
            {
              nome: 'Bloco 01',
              protocolo: '4 rounds',
              exercicios: [
                { nome: 'Snatch' },
                { nome: 'Clean & Jerk' }
              ]
            }
          ]
        }
      }
    }
  }
];
