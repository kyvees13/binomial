"use client";

import React, { useState, useEffect } from 'react';
import { SimulationResults } from '@/lib/simulation';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Activity, 
  Percent, 
  BarChart4,
  FlaskConical,
  Target,
  Dices,
  TrendingUp,
  TrendingDown,
  Loader2,
  Database,
  ShieldCheck,
  Sparkle
} from "lucide-react";

import BinomialChart from './BinomialChart';
import SimulationSection from './SimulationSection';

const PRESETS = [
  { name: "Mega Millions", p: 0.0000000033 },
  { name: "Powerball", p: 0.0000000034 },
  { name: "Редкий шанс", p: 0.001 },
  { name: "Средний шанс", p: 0.01 },
];

export default function LotteryCalculator() {
  const [n, setN] = useState<number>(1000);
  const [p, setP] = useState<number>(0.01);
  const [k, setK] = useState<number>(10);
  const [ticketPrice, setTicketPrice] = useState<number>(0);
  const [reward, setReward] = useState<number>(500);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [stats, setStats] = useState<any>(null);
  const [simResults, setSimResults] = useState<SimulationResults | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [debouncedParams, setDebouncedParams] = useState({ n, p, k, ticketPrice, reward });

  useEffect(() => {
    setMounted(true);
    const fetchStats = async () => {
      setIsCalculating(true);
      setDebouncedParams({ n, p, k, ticketPrice, reward });
      
      try {
        const response = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ n, p, k, ticketPrice, reward }),
        });
        const data = await response.json();
        if (!data.error) setStats(data);
      } catch (err) {
        console.error("Ошибка аналитики API:", err);
      } finally {
        setIsCalculating(false);
      }
    };

    const handler = setTimeout(fetchStats, 350);
    return () => clearTimeout(handler);
  }, [n, p, k, ticketPrice, reward]);

  const handleSetN = (val: any) => {
    let newValue: number;
    if (Array.isArray(val)) newValue = val[0];
    else newValue = parseInt(val);
    if (!isNaN(newValue) && newValue >= 0) setN(newValue);
    else if (val === "") setN(0);
  };

  const handleSetP = (val: number) => {
    if (!isNaN(val) && val >= 0) setP(Number(val.toFixed(8)));
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n, p, trials: 1000 }),
      });
      const data = await response.json();
      if (!data.error) setSimResults(data);
    } catch (err) {
      console.error("Ошибка симуляции API:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const formatProb = (prob: number) => {
    if (isNaN(prob) || prob === undefined) return "0.0000%";
    if (prob < 0.00000001) return prob.toExponential(4);
    return (prob * 100).toFixed(4) + "%";
  };

  const safeFormatCurrency = (val: number) => {
    if (isNaN(val) || val === undefined) return "0 ₽";
    const sign = val >= 0 ? "" : "-";
    return sign + Math.abs(val).toLocaleString('ru-RU') + " ₽";
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-black overflow-hidden relative text-white selection:bg-primary/20">
      
      <div className={`absolute top-0 left-0 right-0 h-0.5 z-100 bg-primary transition-all duration-500 ease-in-out ${isCalculating ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />

      {isSidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-black lg:relative lg:w-72 border-r border-zinc-800 flex flex-col p-5 space-y-8 overflow-y-auto shrink-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        <div className="space-y-8 px-1 pb-10 text-white">
          <div className="space-y-4 text-white">
            <div className="space-y-4 bg-zinc-900/40 p-4 rounded-xl border border-white/5 text-white">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex justify-between text-white">Испытаний (n) </Label>
              <Slider value={[n]} min={1} max={10000} step={1} onValueChange={handleSetN} className="py-2 cursor-pointer text-white" />
              <Input type="number" value={n} onChange={(e) => handleSetN(e.target.value)} className="bg-black/40 font-mono text-[11px] border-zinc-800 h-8 text-white focus:border-zinc-600 text-white" />
            </div>

            <div className="space-y-3 px-1 text-white">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] text-white">Вероятность (p)</Label>
              <div className="relative text-white">
                <Percent className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-600 text-white" />
                <Input type="number" step="0.0001" value={p} onChange={(e) => { const val = parseFloat(e.target.value); setP(isNaN(val) ? 0 : val); }} className="bg-zinc-900/50 font-mono text-[11px] border-zinc-800 pl-8 h-8 focus:border-zinc-600 text-white text-white" />
              </div>
              <div className="flex flex-wrap gap-1 mt-1 text-white">
                {PRESETS.map(preset => (
                  <Button key={preset.name} variant="outline" size="sm" onClick={() => setP(preset.p)} className="text-[7px] h-5 px-1.5 border-zinc-800 bg-zinc-900/30 text-zinc-500 uppercase hover:text-white transition-colors font-bold text-white">{preset.name}</Button>
                ))}
              </div>
            </div>

            <div className="space-y-3 px-1 text-white">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] text-white">Цель побед (k)</Label>
              <div className="relative text-white"><Target className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-600 text-white" /><Input type="number" value={k} onChange={(e) => { const val = parseInt(e.target.value); setK(isNaN(val) ? 0 : val); }} className="bg-zinc-900/50 font-mono text-[11px] border-zinc-800 pl-8 h-8 focus:border-zinc-600 text-white" /></div>
            </div>
          </div>

          <Separator className="bg-zinc-800/50 text-white" />

          <div className="space-y-4 px-1 text-white">
            <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] text-white">Экономика</h3>
            <div className="grid grid-cols-1 gap-3 text-white">
              <div className="space-y-1.5 text-white">
                <Label className="text-[9px] font-bold text-zinc-500 uppercase text-zinc-400 text-white">Цена билета</Label>
                <Input type="number" value={ticketPrice} onChange={(e) => { const val = parseFloat(e.target.value); setTicketPrice(isNaN(val) ? 0 : val); }} className="bg-zinc-900/50 font-mono text-xs border-zinc-800 h-8 focus:border-zinc-600 text-white" />
              </div>
              <div className="space-y-1.5 text-white text-white">
                <Label className="text-[9px] font-bold text-zinc-500 uppercase text-zinc-400 text-white">Выигрыш</Label>
                <Input type="number" value={reward} onChange={(e) => { const val = parseFloat(e.target.value); setReward(isNaN(val) ? 0 : val); }} className="bg-zinc-900/50 font-mono text-xs border-zinc-800 h-8 focus:border-zinc-600 text-white text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 bg-black flex flex-col overflow-hidden relative text-white">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-zinc-800/10 blur-[180px] rounded-full pointer-events-none text-white text-white" />
        
        {/* DASHBOARD HEADER */}
        <header className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-zinc-800 bg-black/50 backdrop-blur-xl z-30 text-white text-white">
          <div className="flex items-center gap-4 text-white">

              <div className="flex items-center gap-3 text-white">
                <BarChart4 className="h-5 w-5 text-zinc-500" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white italic">Аналитические данные</h2>
              </div>
          </div>

          <div className="flex items-center gap-3">
            <Dialog>
                <DialogTrigger asChild>
                <Button variant="outline" className="h-9 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground/80 border-none shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all font-black text-[10px] uppercase tracking-widest">
                    <FlaskConical className="h-3.5 w-3.5 mr-2" />
                    Симуляция
                </Button>
                </DialogTrigger>
                <DialogContent className="min-w-7xl bg-zinc-950 border-zinc-800 text-white rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                <DialogHeader className="text-white">
                    <DialogTitle className="text-2xl font-black italic uppercase flex items-center gap-3 text-white"><Dices className="h-6 w-6 text-white" />Лаборатория испытаний</DialogTitle>
                    <DialogDescription className="text-zinc-500 uppercase font-bold text-[10px] tracking-widest">Запуск 1,000 экспериментов по схеме B({n}, {p})</DialogDescription>
                </DialogHeader>
                
                <div className="py-4 text-white">
                    {!simResults && !isSimulating ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl p-16 text-center space-y-6 text-white">
                        <p className="text-zinc-400 text-sm">Нажмите кнопку для запуска серверного расчета Монте-Карло.</p>
                        <Button onClick={handleRunSimulation} className="h-16 px-12 text-lg font-black bg-white text-black hover:bg-zinc-200 transition-all rounded-full shadow-[0_0_50px_rgba(255,255,255,0.1)]">ЗАПУСТИТЬ РАСЧЕТ</Button>
                    </div>
                    ) : isSimulating ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6 text-white">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <div className="text-sm font-black uppercase tracking-[0.3em] animate-pulse text-white">Генерация случайных величин...</div>
                    </div>
                    ) : simResults ? (
                    <div className="space-y-6 animate-in fade-in duration-500 text-white">
                        <SimulationSection results={simResults} />
                        <div className="flex justify-center text-white">
                            <Button onClick={handleRunSimulation} disabled={isSimulating} className="h-12 px-10 text-sm font-black bg-white text-black hover:bg-zinc-200 transition-all rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] text-white">
                                {isSimulating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />} ПЕРЕСЧИТАТЬ СИМУЛЯЦИЮ
                            </Button>
                        </div>
                    </div>
                    ) : null}

                </div>
                </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen(true)} className="lg:hidden bg-zinc-900 border-zinc-800 text-[10px] font-black h-8 px-4 text-white">ПАРАМЕТРЫ</Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative text-white">
          {isCalculating && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300 text-white">
              <div className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] shadow-3xl flex flex-col items-center gap-6 scale-90 md:scale-100 text-white">
                  <div className="relative text-white">
                      <Loader2 className="h-12 w-12 text-primary animate-spin text-white" />
                      <Activity className="h-5 w-5 text-white absolute inset-0 m-auto animate-pulse text-white" />
                  </div>
                  <div className="text-center space-y-2 text-white">
                      <div className="text-sm font-black uppercase tracking-[0.3em] text-white">Анализ данных...</div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest text-zinc-500 text-white">Синхронизация с математическим ядром</div>
                  </div>
              </div>
            </div>
          )}

          <div className={`p-6 md:p-10 lg:p-12 space-y-12 transition-all duration-500 ${isCalculating ? 'opacity-40' : 'opacity-100'} text-white`}>
              {stats ? (
              <div className="space-y-12 text-white">
                
                {/* ПАНЕЛЬ KPI (АНАЛИТИЧЕСКИЕ БЛОКИ) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                    {/* БЛОК 1: РИСК */}
                    <div className="bg-zinc-900/30 p-6 rounded-[2rem] border border-white/5 shadow-2xl border-l-rose-500/50 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 blur-3xl rounded-full" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2">
                            <span className="text-zinc-500">Риск недобора</span>
                            <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-md border border-rose-500/20 font-mono">(P &lt; {k})</span>
                        </span>
                        <div className="text-5xl font-black text-white tabular-nums mt-3 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{formatProb(stats.probAtLeastK ? 1 - stats.probAtLeastK : 0)}</div>
                        <div className="mt-8 flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-black mt-3"><TrendingDown className="h-3.5 w-3.5 text-rose-500" /> Вероятность проигрыша</div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[7px] text-zinc-500 uppercase font-black">Минимум (3&sigma;)</span>
                          <span className="text-[11px] font-black text-rose-400/80">{stats.sigmaRanges.s3.start} побед</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[7px] text-zinc-500 uppercase font-black">Статус</span>
                          {stats.probAtLeastK > 0.9 ? (
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">Надежно</span>
                          ) : stats.probAtLeastK > 0.5 ? (
                              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Приемлемо</span>
                          ) : (
                              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Критично</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* БЛОК 2: УСПЕХ */}
                    <div className="bg-zinc-900/30 p-6 rounded-[2rem] border border-white/5 shadow-2xl border-l-emerald-500/50 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2">
                            <span className="text-zinc-500">Шанс успеха</span>
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 font-mono">(P &ge; {k})</span>
                        </span>
                        <div className="text-5xl font-black text-white tabular-nums mt-3 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{formatProb(stats.probAtLeastK)}</div>
                        <div className="mt-8 flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-black mt-3"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Вероятность цели</div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[7px] text-zinc-500 uppercase font-black">Мат. ожидание</span>
                          <span className="text-[11px] font-black text-emerald-400/80">{stats.ev.toFixed(2)} побед</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[7px] text-zinc-500 uppercase font-black">Разброс (&sigma;)</span>
                          <span className="text-[11px] font-black text-zinc-300">&plusmn;{stats.sd.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* БЛОК 3: ПРОФИТ */}
                    <div className="bg-zinc-900/30 p-6 rounded-[2rem] border border-white/5 shadow-2xl border-l-white/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 blur-3xl rounded-full" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2">
                            <span className="text-zinc-500">Результат</span>
                            <span className="bg-white/5 text-zinc-300 px-2 py-0.5 rounded-md border border-white/10 font-mono">(&mu;)</span>
                        </span>
                        <div className="text-5xl font-black text-primary tabular-nums mt-3 tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{safeFormatCurrency(stats.profit)}</div>
                        <div className="mt-8 flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-black mt-3"><Activity className="h-3.5 w-3.5 text-primary" /> Ожидаемый профит</div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[7px] text-zinc-500 uppercase font-black">Мин (3&sigma;)</span>
                          <span className={`text-[11px] font-black ${stats.sigmaProfits.s3.start >= 0 ? "text-emerald-400/80" : "text-rose-400/80"}`}>{safeFormatCurrency(stats.sigmaProfits.s3.start)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[7px] text-zinc-500 uppercase font-black">Макс (3&sigma;)</span>
                          <span className={`text-[11px] font-black ${stats.sigmaProfits.s3.end >= 0 ? "text-emerald-400/80" : "text-rose-400/80"}`}>{safeFormatCurrency(stats.sigmaProfits.s3.end)}</span>
                        </div>
                      </div>
                    </div>
                </div>

                {/* ПЛАНЕТАРНАЯ ПАНЕЛЬ ГАРАНТИЙ (ТЕПЕРЬ СРАЗУ ПОД СТАТИСТИКОЙ) */}
                <div className="space-y-4 text-white text-white">
                    <div className="flex items-center gap-2 px-1 text-white text-white">
                        <ShieldCheck className="h-3.5 w-3.5 text-zinc-600 text-white text-white" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 text-white text-white">Планирование гарантии для цели k={k}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white text-white">
                        {[1, 2, 3].map((s) => {
                            const reqN = s === 1 ? stats.reqN1s : s === 2 ? stats.reqN2s : stats.reqN3s;
                            const reqP = s === 1 ? stats.reqP1s : s === 2 ? stats.reqP2s : stats.reqP3s;
                            const colors = s === 1 ? "blue" : s === 2 ? "purple" : "emerald";
                            const prob = s === 1 ? "68.2%" : s === 2 ? "95.4%" : "99.7%";
                            
                            const isNStable = Math.abs(reqN - n) < 0.01;
                            const isPStable = Math.abs(reqP - p) < 1e-10;

                            const pPercent = isNaN(reqP) ? "100.00" : (reqP * 100).toFixed(4);
                            const pDiff = (reqP > p && !isPStable) ? `+${((reqP - p) * 100).toFixed(4)}%` : "OK";

                            return (
                                <div key={s} className={`group flex flex-col p-4 rounded-2xl bg-zinc-950 border border-white/5 hover:border-${colors}-500/40 transition-all relative overflow-hidden text-white`}>
                                    <div className={`absolute inset-0 bg-${colors}-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity text-white` } />
                                    
                                    <div className="relative z-10 flex justify-between items-center mb-4 text-white">
                                        <div className={`text-${colors}-400 text-[10px] font-black uppercase tracking-widest text-white`}>{prob} Уровень</div>
                                        <Sparkle className={`h-3 w-3 text-${colors}-500 opacity-30 text-white`} />
                                    </div>

                                    <div className="relative z-10 space-y-3 text-white text-white">
                                        {/* ИЗМЕНИТЬ N */}
                                        <div className="flex items-center gap-2 text-white">
                                            <div className="flex-1 space-y-0.5 text-white">
                                                <div className="text-[6px] text-zinc-600 uppercase font-black text-white">Объем (n):</div>
                                                <div className="text-sm font-black text-white tabular-nums text-white">{reqN.toLocaleString('ru-RU')}</div>
                                            </div>
                                            <Button onClick={() => handleSetN(reqN)} size="sm" className={`h-7 px-3 bg-white/5 hover:bg-${colors}-500 hover:text-white transition-all text-white text-[8px] font-black uppercase border border-white/5 rounded-lg text-white`}>
                                                {isNStable ? "OK" : "SET N"}
                                            </Button>
                                        </div>

                                        {/* ИЗМЕНИТЬ P */}
                                        <div className="flex items-center gap-2 text-white">
                                            <div className="flex-1 space-y-0.5 text-white">
                                                <div className="text-[6px] text-zinc-600 uppercase font-black text-white">Шанс (p): <span className="text-zinc-500 font-normal text-white">{pDiff}</span></div>
                                                <div className="text-sm font-black text-white tabular-nums text-white">{pPercent}%</div>
                                            </div>
                                            <Button onClick={() => handleSetP(reqP)} size="sm" className={`h-7 px-3 bg-white/5 hover:bg-zinc-100 hover:text-black transition-all text-zinc-400 text-[8px] font-black uppercase border border-white/5 rounded-lg text-white`}>
                                                {isPStable ? "OK" : "SET P"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ГРАФИК */}
                <div className="h-112.5 md:h-137.5 lg:h-162.5 w-full bg-zinc-950/40 rounded-[3rem] border border-white/[0.03] p-6 md:p-10 shadow-3xl backdrop-blur-md relative cursor-crosshair overflow-hidden text-white">
                    <BinomialChart n={debouncedParams.n} p={debouncedParams.p} currentK={debouncedParams.k} onSelectK={setK} />
                </div>
              </div>
              ) : (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-800 text-white">
                      <Database className="h-20 w-20 mb-4 animate-pulse text-zinc-800 text-white" />
                      <div className="text-lg font-black uppercase tracking-widest text-zinc-700 animate-pulse text-white">Инициализация модулей...</div>
                  </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}
