import { describe, it, expect } from 'vitest';
import { runSimulation } from './simulation';
import { expectedWins } from './math';

describe('Модуль симуляции Монте-Карло', () => {
  it('должен возвращать ожидаемое количество испытаний', () => {
    const trials = 500;
    const result = runSimulation(100, 0.1, trials);
    expect(result.outcomes.length).toBe(trials);
    expect(result.totalTrials).toBe(trials);
  });

  it('среднее количество побед должно быть близко к математическому ожиданию', () => {
    const n = 100;
    const p = 0.5;
    const trials = 1000;
    const result = runSimulation(n, p, trials);
    
    const expected = expectedWins(n, p);
    // Для 1000 испытаний отклонение обычно невелико
    expect(result.averageWins).toBeGreaterThan(expected * 0.8);
    expect(result.averageWins).toBeLessThan(expected * 1.2);
  });

  it('должен корректно формировать распределение', () => {
    const result = runSimulation(10, 0.1, 100);
    const sumDistribution = Object.values(result.distribution).reduce((a, b) => a + b, 0);
    expect(sumDistribution).toBe(100);
  });
});
