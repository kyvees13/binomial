"use client";

import React, { useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
import { binomialProbability } from '@/lib/math';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BinomialChartProps {
  n: number;
  p: number;
  currentK: number;
  onSelectK?: (k: number) => void;
}

export default function BinomialChart({ n, p, currentK, onSelectK }: BinomialChartProps) {
  const chartRef = useRef<any>(null);
  
  const { mu, sigma, start, end } = useMemo(() => {
    const muVal = n * p;
    const sigmaVal = Math.sqrt(n * p * (1 - p));
    const rangeStart = Math.max(0, Math.floor(Math.min(muVal - 4 * sigmaVal - 2, currentK - 5)));
    const rangeEnd = Math.min(n, Math.ceil(Math.max(muVal + 4 * sigmaVal + 5, currentK + 5)));
    return { mu: muVal, sigma: sigmaVal, start: rangeStart, end: rangeEnd };
  }, [n, p, currentK]);
  
  const chartData = useMemo(() => {
    const labels = [];
    const data = [];
    const backgroundColors = [];
    const borderColors = [];

    for (let i = start; i <= end; i++) {
      labels.push(i.toString());
      const prob = binomialProbability(n, i, p);
      data.push(prob);
      
      const diff = Math.abs(i - mu);
      
      if (i === currentK) {
        backgroundColors.push('rgba(255, 255, 255, 1)');
        borderColors.push('rgba(255, 255, 255, 1)');
      } else if (diff <= sigma) {
        backgroundColors.push('rgba(59, 130, 246, 0.5)');
        borderColors.push('rgba(59, 130, 246, 0.8)');
      } else if (diff <= 2 * sigma) {
        backgroundColors.push('rgba(168, 85, 247, 0.35)');
        borderColors.push('rgba(168, 85, 247, 0.6)');
      } else if (diff <= 3 * sigma) {
        backgroundColors.push('rgba(16, 185, 129, 0.2)');
        borderColors.push('rgba(16, 185, 129, 0.4)');
      } else {
        backgroundColors.push('rgba(255, 255, 255, 0.05)');
        borderColors.push('rgba(255, 255, 255, 0.1)');
      }
    }

    return {
      labels,
      datasets: [{
        label: 'Вероятность',
        data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 2,
        barPercentage: 0.9,
      }]
    };
  }, [n, p, currentK, mu, sigma, start, end]);

  const zonesPlugin = useMemo(() => ({
    id: 'zonesPlugin',
    beforeDraw: (chart: any) => {
      const { ctx, chartArea: { top, bottom, left, right }, scales: { x } } = chart;
      const k = chart.options.plugins.zonesPlugin.k;
      const kPos = x.getPixelForValue(k.toString());
      
      if (kPos >= left && kPos <= right) {
        ctx.save();
        ctx.fillStyle = 'rgba(244, 63, 94, 0.06)';
        ctx.fillRect(left, top, kPos - left, bottom - top);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.06)';
        ctx.fillRect(kPos, top, right - kPos, bottom - top);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(kPos, top);
        ctx.lineTo(kPos, bottom);
        ctx.stroke();
        ctx.restore();
      }
    }
  }), []);

  const onClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { current: chart } = chartRef;
    if (!chart || !onSelectK) return;
    const element = getElementAtEvent(chart, event);
    if (element.length > 0) {
      const index = element[0].index;
      const selectedK = parseInt(chart.data.labels[index] as string);
      onSelectK(selectedK);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: { display: false },
      zonesPlugin: { k: currentK },
      tooltip: {
        backgroundColor: '#000',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const val = context.parsed.y;
            return `Вероятность: ${(val * 100).toFixed(6)}%`;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#52525b', font: { size: 9 }, callback: (v: any) => (v * 100).toFixed(1) + '%' } },
      x: { grid: { display: false }, ticks: { color: '#52525b', font: { size: 9 } } }
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* ЛЕГЕНДА ДИАПАЗОНОВ */}
      <div className="absolute top-4 right-6 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0:8px_rgba(59,130,246,0.5)]" />
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Область 1&sigma; (68%)</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
          <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0:8px_rgba(168,85,247,0.5)]" />
          <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Область 2&sigma; (95%)</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0:8px_rgba(16,185,129,0.5)]" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Область 3&sigma; (99%)</span>
        </div>
      </div>
      <Bar ref={chartRef} data={chartData} options={options as any} plugins={[zonesPlugin]} onClick={onClick} />
    </div>
  );
}
