import { describe, expect, it } from 'vitest';

/**
 * Testes para funções de cálculo de tempo total do treino
 */

// Simular as funções do TreinoForm
const calculateTotalTrainingTime = (sectionRegistry: Record<string, any>) => {
  let totalSeconds = 0;

  Object.keys(sectionRegistry).forEach((sectionKey) => {
    const items = sectionRegistry[sectionKey].items || [];
    items.forEach((item: any) => {
      if (item.tempoTotal && typeof item.tempoTotal === 'number') {
        totalSeconds += item.tempoTotal;
      }
    });
  });

  return totalSeconds;
};

const formatSecondsToHHMMSS = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds === 0) return '00:00:00';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

describe('calculateTotalTrainingTime', () => {
  it('retorna 0 quando não há exercícios', () => {
    const sectionRegistry = {
      mobilidade: { items: [] },
      core: { items: [] },
      neural: { items: [] },
      treino1: { items: [] },
      treino2: { items: [] },
      condicionamento: { items: [] },
    };

    const total = calculateTotalTrainingTime(sectionRegistry);
    expect(total).toBe(0);
  });

  it('calcula tempo total de um exercício simples', () => {
    const sectionRegistry = {
      mobilidade: {
        items: [
          { tempoTotal: 60 }, // 1 minuto
        ],
      },
      core: { items: [] },
      neural: { items: [] },
      treino1: { items: [] },
      treino2: { items: [] },
      condicionamento: { items: [] },
    };

    const total = calculateTotalTrainingTime(sectionRegistry);
    expect(total).toBe(60);
  });

  it('soma tempos de múltiplos exercícios em um bloco', () => {
    const sectionRegistry = {
      mobilidade: {
        items: [
          { tempoTotal: 30 },
          { tempoTotal: 45 },
          { tempoTotal: 60 },
        ],
      },
      core: { items: [] },
      neural: { items: [] },
      treino1: { items: [] },
      treino2: { items: [] },
      condicionamento: { items: [] },
    };

    const total = calculateTotalTrainingTime(sectionRegistry);
    expect(total).toBe(135);
  });

  it('soma tempos de múltiplos blocos', () => {
    const sectionRegistry = {
      mobilidade: {
        items: [{ tempoTotal: 120 }], // 2 minutos
      },
      core: {
        items: [{ tempoTotal: 90 }], // 1.5 minutos
      },
      neural: {
        items: [{ tempoTotal: 60 }], // 1 minuto
      },
      treino1: {
        items: [{ tempoTotal: 180 }], // 3 minutos
      },
      treino2: {
        items: [{ tempoTotal: 150 }], // 2.5 minutos
      },
      condicionamento: {
        items: [{ tempoTotal: 120 }], // 2 minutos
      },
    };

    const total = calculateTotalTrainingTime(sectionRegistry);
    expect(total).toBe(720); // 12 minutos
  });

  it('ignora exercícios sem tempoTotal', () => {
    const sectionRegistry = {
      mobilidade: {
        items: [
          { tempoTotal: 60 },
          { nome: 'Exercício sem tempo' }, // sem tempoTotal
          { tempoTotal: 45 },
        ],
      },
      core: { items: [] },
      neural: { items: [] },
      treino1: { items: [] },
      treino2: { items: [] },
      condicionamento: { items: [] },
    };

    const total = calculateTotalTrainingTime(sectionRegistry);
    expect(total).toBe(105);
  });

  it('ignora tempoTotal inválido (não numérico)', () => {
    const sectionRegistry = {
      mobilidade: {
        items: [
          { tempoTotal: 60 },
          { tempoTotal: 'quarenta' }, // string, não número
          { tempoTotal: 45 },
        ],
      },
      core: { items: [] },
      neural: { items: [] },
      treino1: { items: [] },
      treino2: { items: [] },
      condicionamento: { items: [] },
    };

    const total = calculateTotalTrainingTime(sectionRegistry);
    expect(total).toBe(105);
  });

  it('calcula treino completo real (exemplo)', () => {
    const sectionRegistry = {
      mobilidade: {
        items: [
          { tempoTotal: 135 }, // 2 min 15s
          { tempoTotal: 90 }, // 1.5 min
        ],
      },
      core: {
        items: [
          { tempoTotal: 225 }, // 3.75 min
        ],
      },
      neural: {
        items: [
          { tempoTotal: 180 }, // 3 min
        ],
      },
      treino1: {
        items: [
          { tempoTotal: 450 }, // 7.5 min
          { tempoTotal: 420 }, // 7 min
        ],
      },
      treino2: {
        items: [
          { tempoTotal: 360 }, // 6 min
        ],
      },
      condicionamento: {
        items: [
          { tempoTotal: 300 }, // 5 min
          { tempoTotal: 240 }, // 4 min
        ],
      },
    };

    const total = calculateTotalTrainingTime(sectionRegistry);
    expect(total).toBe(2400); // 40 minutos
  });
});

describe('formatSecondsToHHMMSS', () => {
  it('formata 0 segundos como 00:00:00', () => {
    expect(formatSecondsToHHMMSS(0)).toBe('00:00:00');
  });

  it('formata 30 segundos como 00:00:30', () => {
    expect(formatSecondsToHHMMSS(30)).toBe('00:00:30');
  });

  it('formata 60 segundos como 00:01:00', () => {
    expect(formatSecondsToHHMMSS(60)).toBe('00:01:00');
  });

  it('formata 90 segundos como 00:01:30', () => {
    expect(formatSecondsToHHMMSS(90)).toBe('00:01:30');
  });

  it('formata 600 segundos (10 minutos) como 00:10:00', () => {
    expect(formatSecondsToHHMMSS(600)).toBe('00:10:00');
  });

  it('formata 3600 segundos (1 hora) como 01:00:00', () => {
    expect(formatSecondsToHHMMSS(3600)).toBe('01:00:00');
  });

  it('formata 3661 segundos como 01:01:01', () => {
    expect(formatSecondsToHHMMSS(3661)).toBe('01:01:01');
  });

  it('formata 3665 segundos como 01:01:05', () => {
    expect(formatSecondsToHHMMSS(3665)).toBe('01:01:05');
  });

  it('formata 7200 segundos (2 horas) como 02:00:00', () => {
    expect(formatSecondsToHHMMSS(7200)).toBe('02:00:00');
  });

  it('formata 2400 segundos (40 minutos) como 00:40:00', () => {
    expect(formatSecondsToHHMMSS(2400)).toBe('00:40:00');
  });

  it('formata tempo de treino completo: 5400 segundos como 01:30:00', () => {
    expect(formatSecondsToHHMMSS(5400)).toBe('01:30:00');
  });

  it('formata tempo maior: 9125 segundos como 02:32:05', () => {
    expect(formatSecondsToHHMMSS(9125)).toBe('02:32:05');
  });

  it('trata null como 00:00:00', () => {
    expect(formatSecondsToHHMMSS(null as any)).toBe('00:00:00');
  });

  it('trata undefined como 00:00:00', () => {
    expect(formatSecondsToHHMMSS(undefined as any)).toBe('00:00:00');
  });

  it('usa padding com zeros para valores menores que 10', () => {
    expect(formatSecondsToHHMMSS(65)).toBe('00:01:05');
    expect(formatSecondsToHHMMSS(125)).toBe('00:02:05');
    expect(formatSecondsToHHMMSS(625)).toBe('00:10:25');
  });
});

describe('Integração: tempo total do treino', () => {
  it('integração completa: calcula e formata treino de até 3 horas', () => {
    const sectionRegistry = {
      mobilidade: { items: [{ tempoTotal: 300 }] },
      core: { items: [{ tempoTotal: 600 }] },
      neural: { items: [{ tempoTotal: 450 }] },
      treino1: { items: [{ tempoTotal: 1800 }] },
      treino2: { items: [{ tempoTotal: 1800 }] },
      condicionamento: { items: [{ tempoTotal: 900 }] },
    };

    const totalSeconds = calculateTotalTrainingTime(sectionRegistry);
    const formatted = formatSecondsToHHMMSS(totalSeconds);

    expect(totalSeconds).toBe(5850);
    expect(formatted).toBe('01:37:30');
  });

  it('treino curto (30 minutos)', () => {
    const sectionRegistry = {
      mobilidade: { items: [{ tempoTotal: 180 }] },
      core: { items: [{ tempoTotal: 600 }] },
      neural: { items: [] },
      treino1: { items: [{ tempoTotal: 840 }] },
      treino2: { items: [] },
      condicionamento: { items: [] },
    };

    const totalSeconds = calculateTotalTrainingTime(sectionRegistry);
    const formatted = formatSecondsToHHMMSS(totalSeconds);

    expect(totalSeconds).toBe(1620);
    expect(formatted).toBe('00:27:00');
  });

  it('treino longo (3 horas)', () => {
    const sectionRegistry = {
      mobilidade: { items: [{ tempoTotal: 600 }] },
      core: { items: [{ tempoTotal: 900 }] },
      neural: { items: [{ tempoTotal: 600 }] },
      treino1: { items: [{ tempoTotal: 3600 }] },
      treino2: { items: [{ tempoTotal: 3600 }] },
      condicionamento: { items: [{ tempoTotal: 1200 }] },
    };

    const totalSeconds = calculateTotalTrainingTime(sectionRegistry);
    const formatted = formatSecondsToHHMMSS(totalSeconds);

    expect(totalSeconds).toBe(10500);
    expect(formatted).toBe('02:55:00');
  });

  it('treino vazio retorna 00:00:00', () => {
    const sectionRegistry = {
      mobilidade: { items: [] },
      core: { items: [] },
      neural: { items: [] },
      treino1: { items: [] },
      treino2: { items: [] },
      condicionamento: { items: [] },
    };

    const totalSeconds = calculateTotalTrainingTime(sectionRegistry);
    const formatted = formatSecondsToHHMMSS(totalSeconds);

    expect(totalSeconds).toBe(0);
    expect(formatted).toBe('00:00:00');
  });
});
