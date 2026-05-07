
export interface SimulationResults {
  outcomes: number[];
  averageWins: number;
  distribution: Record<number, number>;
  totalTrials: number;
}

export function runSimulation(n: number, p: number, trials: number = 1000): SimulationResults {
  const outcomes: number[] = [];
  const distribution: Record<number, number> = {};
  let totalWins = 0;

  for (let t = 0; t < trials; t++) {
    let wins = 0;

    if (n > 10000) {
      for (let i = 0; i < n; i++) {
        if (Math.random() < p) {
          wins++;
        }
      }
    } else {
      for (let i = 0; i < n; i++) {
        if (Math.random() < p) {
          wins++;
        }
      }
    }

    outcomes.push(wins);
    totalWins += wins;
    distribution[wins] = (distribution[wins] || 0) + 1;
  }

  return {
    outcomes,
    averageWins: totalWins / trials,
    distribution,
    totalTrials: trials,
  };
}
