import { Decimal } from 'decimal.js';

/**
 * Логарифм гамма-функции (аппроксимация Ланцоша) для больших n
 */
export function logGamma(n: number): number {
  if (n <= 0) return 0;
  const coeff = [
    76.18009172947146, -86.50532032941677,
    24.01409824083091, -1.231739572450155,
    0.1208650973866179e-2, -0.5395239384953e-5
  ];
  let x = n;
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let i = 0; i <= 5; i++) {
    y += 1;
    ser += coeff[i] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Логарифм биномиального коэффициента C(n, k)
 */
export function logBinomial(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  if (k === 0 || k === n) return 0;
  if (k > n / 2) k = n - k;
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
}

/**
 * Количество сочетаний C(n, k)
 */
export function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;
  return Math.round(Math.exp(logBinomial(n, k)));
}

/**
 * Точный расчет вероятности по формуле Бернулли P(X = k)
 */
export function binomialProbability(n: number, k: number, p: number): number {
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  if (k < 0 || k > n) return 0;
  
  const logProb = logBinomial(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
  return Math.exp(logProb);
}

/**
 * Вероятность хотя бы k успехов: P(X >= k)
 */
export function atLeastKProbability(n: number, k: number, p: number): number {
  if (k <= 0) return 1;
  if (k > n) return 0;
  
  // Для небольших k быстрее считать сумму P(X < k)
  if (k < n / 2) {
    let probLessK = 0;
    for (let i = 0; i < k; i++) {
      probLessK += binomialProbability(n, i, p);
    }
    return Math.max(0, 1 - probLessK);
  } else {
    let probAtLeastK = 0;
    for (let i = k; i <= n; i++) {
      probAtLeastK += binomialProbability(n, i, p);
    }
    return Math.min(1, probAtLeastK);
  }
}

/**
 * Математическое ожидание M[X] = n * p
 */
export function expectedWins(n: number, p: number): number {
  return n * p;
}

/**
 * Стандартное отклонение sigma = sqrt(n * p * q)
 */
export function standardDeviation(n: number, p: number): number {
  return Math.sqrt(n * p * (1 - p));
}

/**
 * Расчет требуемого n для заданного уровня сигма-барьера
 */
export function calculateNForSigma(p: number, targetK: number, m: number = 3): number {
  if (p <= 0 || p >= 1) return 0;
  
  const D_p = new Decimal(p);
  const D_targetK = new Decimal(targetK).minus(0.999);
  const D_m = new Decimal(m);
  
  const q = new Decimal(1).minus(D_p);
  
  const a = D_p;
  const b = D_m.mul(D_p.mul(q).sqrt()).neg();
  const c = D_targetK.neg();
  
  const discriminant = b.pow(2).minus(a.mul(c).mul(4));
  if (discriminant.lt(0)) return 0;

  const sqrtN = b.neg().plus(discriminant.sqrt()).div(a.mul(2));
  return Math.ceil(sqrtN.pow(2).toNumber());
}

/**
 * Расчет требуемого p для заданного n и целевого k (Decimal Precision)
 */
export function calculatePForSigma(n: number, targetK: number, m: number = 3): number {
  if (n <= 0 || targetK <= 0) return 0;
  if (targetK > n) return 1;

  const D_n = new Decimal(n);
  const D_k = new Decimal(targetK);
  const D_m = new Decimal(m);
  const D_m2 = D_m.pow(2);

  // Ap^2 + Bp + C = 0
  // A = n^2 + m^2*n
  // B = -(2*n*k + m^2*n)
  // C = k^2
  const A = D_n.pow(2).plus(D_m2.mul(D_n));
  const B = D_n.mul(D_k).mul(2).plus(D_m2.mul(D_n)).neg();
  const C = D_k.pow(2);
  
  const discriminant = B.pow(2).minus(A.mul(C).mul(4));
  if (discriminant.lt(0)) return 1;
  
  const p = B.neg().plus(discriminant.sqrt()).div(A.mul(2));
  return Decimal.min(1, Decimal.max(0, p)).toNumber();
}
