"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SimulationResults } from '@/lib/simulation';
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, BarChart3, ShieldAlert, CheckCircle2 } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SimulationSectionProps {
  results: SimulationResults;
}

export default function SimulationSection({ results }: SimulationSectionProps) {
  const { distribution, averageWins, totalTrials } = results;

  const sortedKeys = Object.keys(distribution)
    .map(Number)
    .sort((a, b) => a - b);

  const chartData = {
    labels: sortedKeys.map(k => k.toString()),
    datasets: [
      {
        label: 'Частота',
        data: sortedKeys.map(k => distribution[k]),
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#000',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 },
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#71717a', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#71717a', font: { size: 10 } }
      }
    },
  };

  const lossCount = distribution[0] || 0;
  const winCount = totalTrials - lossCount;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <BarChart3 className="h-4 w-4" />
            Эмпирическое среднее
          </div>
          <div className="text-5xl font-black font-mono text-white tabular-nums">{averageWins.toFixed(4)}</div>
          <p className="text-[10px] text-zinc-600 uppercase font-bold">Среднее кол-во побед в эксперименте</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            <ShieldAlert className="h-4 w-4" />
            Риск полного проигрыша
          </div>
          <div className="text-5xl font-black font-mono text-rose-500 tabular-nums">
            {((lossCount / totalTrials) * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-zinc-600 uppercase font-bold">Доля испытаний с 0 выигрышей</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
            Вероятность успеха
          </div>
          <div className="text-5xl font-black font-mono text-emerald-400 tabular-nums">
            {((winCount / totalTrials) * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-zinc-600 uppercase font-bold">Доля испытаний с &ge; 1 выигрышем</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h3 className="text-xl font-black italic uppercase flex items-center gap-3 text-white">
            <LayoutGrid className="h-6 w-6 text-zinc-400" />
            Распределение исходов
            </h3>
            <Badge variant="outline" className="bg-white/5 text-zinc-400 border-zinc-800 font-mono text-[10px] px-3 py-1">N=1,000 ИСПЫТАНИЙ</Badge>
        </div>
        <div className="h-112.5 w-full bg-zinc-950/20 rounded-[2.5rem] border border-zinc-800/50 p-10 backdrop-blur-md">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}
