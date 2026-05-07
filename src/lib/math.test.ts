import { describe, it, expect } from 'vitest';
import { 
  combinations, 
  binomialProbability, 
  atLeastKProbability, 
  expectedWins, 
  standardDeviation,
  calculateNForSigma,
  calculatePForSigma
} from './math';

describe('Математическое ядро биномиального распределения', () => {
  describe('Функция combinations (C(n, k))', () => {
    it('должна корректно вычислять количество сочетаний', () => {
      expect(combinations(10, 2)).toBe(45);
      expect(combinations(5, 0)).toBe(1);
      expect(combinations(5, 5)).toBe(1);
      expect(combinations(52, 5)).toBe(2598960); // Количество рук в покере
    });

    it('должна возвращать 0 для некорректных k', () => {
      expect(combinations(5, 6)).toBe(0);
      expect(combinations(5, -1)).toBe(0);
    });
  });

  describe('Функция binomialProbability (P(X = k))', () => {
    it('должна вычислять точную вероятность', () => {
      // n=10, p=0.1, k=1 -> P = 0.387420489
      const prob = binomialProbability(10, 1, 0.1);
      expect(prob).toBeCloseTo(0.3874, 4);
    });

    it('должна корректно обрабатывать p=0 и p=1', () => {
      expect(binomialProbability(10, 0, 0)).toBe(1);
      expect(binomialProbability(10, 1, 0)).toBe(0);
      expect(binomialProbability(10, 10, 1)).toBe(1);
      expect(binomialProbability(10, 5, 1)).toBe(0);
    });

    it('не должна возвращать NaN при очень больших N', () => {
      const prob = binomialProbability(10000, 50, 0.01);
      expect(isNaN(prob)).toBe(false);
      expect(prob).toBeGreaterThan(0);
    });
  });

  describe('Функция atLeastKProbability (P(X >= k))', () => {
    it('должна вычислять кумулятивную вероятность', () => {
      // n=100, p=0.01, k=1 -> P(X >= 1) = 1 - (0.99^100) ≈ 0.634
      const prob = atLeastKProbability(100, 1, 0.01);
      expect(prob).toBeCloseTo(0.634, 3);
    });

    it('должна возвращать 1 для k=0', () => {
      expect(atLeastKProbability(10, 0, 0.5)).toBe(1);
    });

    it('должна возвращать 0 для k > n', () => {
      expect(atLeastKProbability(10, 11, 0.5)).toBe(0);
    });
  });

  describe('Статистические показатели', () => {
    it('должна вычислять математическое ожидание', () => {
      expect(expectedWins(1000, 0.05)).toBe(50);
    });

    it('должна вычислять стандартное отклонение', () => {
      // n=100, p=0.5 -> sigma = sqrt(100*0.5*0.5) = 5
      expect(standardDeviation(100, 0.5)).toBe(5);
    });
  });

  describe('Функция calculateNForSigma', () => {
    it('должна находить n для заданного уровня уверенности', () => {
      // Если p=0.01 и мы хотим хотя бы 1 успех с 3-сигма уверенностью
      const n = calculateNForSigma(0.01, 1, 3);
      expect(n).toBeGreaterThan(0);
      
      // Проверка: P(X >= 1) для найденного n должно быть высоким
      const prob = atLeastKProbability(n, 1, 0.01);
      expect(prob).toBeGreaterThan(0.99); // 3 сигма ~ 99.7%
    });
  });

  describe('Функция calculatePForSigma', () => {
    it('должна находить p для заданного объема n', () => {
      const p = calculatePForSigma(1000, 10, 3);
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThan(1);

      // Проверка: P(X >= 10) для найденного p должно быть высоким
      const prob = atLeastKProbability(1000, 10, p);
      expect(prob).toBeGreaterThan(0.99);
    });
  });
});
