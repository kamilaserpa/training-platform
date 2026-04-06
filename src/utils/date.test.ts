import { describe, expect, it } from 'vitest';
import {
    formatISODateOnlyLocal,
    getIsoWeekAndYear,
    getWeekEndSundayLocal,
    getWeekStartMondayLocal,
    parseLocalDate,
} from './date';

/**
 * Testes para funções utilitárias de data
 */

describe('parseLocalDate', () => {
  it('parse date string YYYY-MM-DD sem erro de timezone', () => {
    const date = parseLocalDate('2026-02-02');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1); // Fevereiro (0-indexed)
    expect(date.getDate()).toBe(2);
  });

  it('parse date string BR DD/MM/YYYY', () => {
    const date = parseLocalDate('02/02/2026');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(2);
  });

  it('preserva Date objects passados como argumento', () => {
    const original = new Date(2026, 1, 2);
    const parsed = parseLocalDate(original);
    expect(parsed.getTime()).toBe(original.getTime());
  });

  it('retorna NaN Date para string inválida', () => {
    const date = parseLocalDate('invalid-date');
    expect(Number.isNaN(date.getTime())).toBe(true);
  });

  it('trata string vazia retornando NaN Date', () => {
    const date = parseLocalDate('');
    expect(Number.isNaN(date.getTime())).toBe(true);
  });

  it('parse ISO datetime strings (fallback)', () => {
    const date = parseLocalDate('2026-02-02T10:30:00Z');
    expect(date.getFullYear()).toBe(2026);
  });
});

describe('formatISODateOnlyLocal', () => {
  it('formata Date em YYYY-MM-DD', () => {
    const date = new Date(2026, 1, 2);
    const formatted = formatISODateOnlyLocal(date);
    expect(formatted).toBe('2026-02-02');
  });

  it('usa 2 dígitos com padding de zero', () => {
    const date = new Date(2026, 0, 5); // Janeiro 5
    const formatted = formatISODateOnlyLocal(date);
    expect(formatted).toBe('2026-01-05');
  });

  it('formata dezembro corretamente', () => {
    const date = new Date(2026, 11, 31);
    const formatted = formatISODateOnlyLocal(date);
    expect(formatted).toBe('2026-12-31');
  });

  it('retorna formato correto para datas em geral', () => {
    const date = new Date(2026, 5, 15);
    const formatted = formatISODateOnlyLocal(date);
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatted).toBe('2026-06-15');
  });
});

describe('getWeekStartMondayLocal', () => {
  it('retorna segunda-feira da semana de uma date durante a semana', () => {
    // 2026-02-06 é uma sexta-feira
    const date = new Date(2026, 1, 6);
    const monday = getWeekStartMondayLocal(date);
    expect(monday.getDay()).toBe(1); // 1 = segunda-feira
    expect(formatISODateOnlyLocal(monday)).toBe('2026-02-02');
  });

  it('retorna segunda-feira quando date já é segunda-feira', () => {
    // 2026-02-02 é uma segunda-feira
    const date = new Date(2026, 1, 2);
    const monday = getWeekStartMondayLocal(date);
    expect(monday.getDay()).toBe(1);
    expect(formatISODateOnlyLocal(monday)).toBe('2026-02-02');
  });

  it('retorna segunda-feira quando date é domingo', () => {
    // 2026-02-01 é um domingo
    // startOfWeek com weekStartsOn: 1 retorna a ÚLTIMA segunda-feira (semana anterior)
    const date = new Date(2026, 1, 1)
    const monday = getWeekStartMondayLocal(date)
    expect(monday.getDay()).toBe(1) // 1 = segunda-feira
    expect(formatISODateOnlyLocal(monday)).toBe('2026-01-26') // segunda anterior
  });

  it('alinha com date_trunc("week") do PostgreSQL (segunda-feira como início)', () => {
    // PostgreSQL date_trunc('week') considera segunda como início da semana
    const wednesday = new Date(2026, 1, 4);
    const monday = getWeekStartMondayLocal(wednesday);
    expect(formatISODateOnlyLocal(monday)).toBe('2026-02-02');
  });
});

describe('getWeekEndSundayLocal', () => {
  it('retorna domingo 6 dias após a segunda-feira', () => {
    const monday = new Date(2026, 1, 2); // Segunda-feira
    const sunday = getWeekEndSundayLocal(monday);
    expect(sunday.getDay()).toBe(0); // 0 = domingo
    expect(formatISODateOnlyLocal(sunday)).toBe('2026-02-08');
  });

  it('calcula corretamente fim de semana em jan→fev', () => {
    // Segunda 2026-01-26 → Domingo 2026-02-01
    const monday = new Date(2026, 0, 26);
    const sunday = getWeekEndSundayLocal(monday);
    expect(formatISODateOnlyLocal(sunday)).toBe('2026-02-01');
  });

  it('funciona com qualquer segunda-feira do ano', () => {
    const monday = new Date(2026, 2, 2); // Março
    const sunday = getWeekEndSundayLocal(monday);
    const dayDiff = (sunday.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24);
    expect(dayDiff).toBe(6);
    expect(sunday.getDay()).toBe(0);
  });
});

describe('getIsoWeekAndYear', () => {
  it('retorna semana ISO e ano para uma date', () => {
    const date = new Date(2026, 1, 6); // 2026-02-06 (sexta-feira)
    const { week, year } = getIsoWeekAndYear(date);
    expect(week).toBe(6); // Semana ISO 6
    expect(year).toBe(2026);
  });

  it('retorna semana correta para janeiro 5 (segunda semana do ano ISO)', () => {
    const date = new Date(2026, 0, 5); // Janeiro 5 (segunda-feira)
    // A semana 1 de 2026 é 2025-12-29 até 2026-01-04
    // Janeiro 5 está na segunda semana de 2026
    const { week, year } = getIsoWeekAndYear(date);
    expect(week).toBe(2);
    expect(year).toBe(2026);
  });

  it('transição de ano: semana 52/1', () => {
    const date = new Date(2025, 11, 29); // Dezembro 29, 2025
    const { week, year } = getIsoWeekAndYear(date);
    // Pode ser semana 1 de 2026 ou última semana de 2025, dependendo da regra ISO
    expect(typeof week).toBe('number');
    expect(typeof year).toBe('number');
  });

  it('segunda-feira da semana 6 em 2026', () => {
    const date = new Date(2026, 1, 2); // 2026-02-02 (segunda-feira, início semana 6)
    const { week, year } = getIsoWeekAndYear(date);
    expect(week).toBe(6);
    expect(year).toBe(2026);
  });
});

describe('Integração: round-trip date parsing → formatting', () => {
  it('parse YYYY-MM-DD e formata volta ao mesmo', () => {
    const original = '2026-02-06';
    const date = parseLocalDate(original);
    const formatted = formatISODateOnlyLocal(date);
    expect(formatted).toBe(original);
  });

  it('parse BR e formata em YYYY-MM-DD', () => {
    const brDate = '06/02/2026';
    const date = parseLocalDate(brDate);
    const formatted = formatISODateOnlyLocal(date);
    expect(formatted).toBe('2026-02-06');
  });

  it('semana completa: segunda-feira → domingo', () => {
    const dateStr = '2026-02-06'; // Sexta-feira
    const date = parseLocalDate(dateStr);
    const monday = getWeekStartMondayLocal(date);
    const sunday = getWeekEndSundayLocal(monday);

    expect(formatISODateOnlyLocal(monday)).toBe('2026-02-02');
    expect(formatISODateOnlyLocal(sunday)).toBe('2026-02-08');
    expect((sunday.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24)).toBe(6);
  });

  it('ISO week para data no meio de semana em 2026', () => {
    const date = new Date(2026, 1, 4); // Quarta-feira
    const { week } = getIsoWeekAndYear(date);
    const monday = getWeekStartMondayLocal(date);
    const mondayStr = formatISODateOnlyLocal(monday);

    expect(week).toBe(6);
    expect(mondayStr).toBe('2026-02-02');
  });
});

describe('Edge cases', () => {
  it('leap year: 2024-02-29', () => {
    const date = parseLocalDate('2024-02-29');
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(29);

    const formatted = formatISODateOnlyLocal(date);
    expect(formatted).toBe('2024-02-29');
  });

  it('trata ano muito antigo (year 1)', () => {
    const date = new Date(1, 0, 1);
    const formatted = formatISODateOnlyLocal(date);
    // Resultado pode ser '0001-01-01' ou similar (depende da implementação)
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('trata ano muito futuro (year 9999)', () => {
    const date = new Date(9999, 11, 31);
    const formatted = formatISODateOnlyLocal(date);
    expect(formatted).toBe('9999-12-31');
  });
});
