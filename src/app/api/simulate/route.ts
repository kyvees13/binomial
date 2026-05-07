import { NextRequest, NextResponse } from 'next/server';
import { runSimulation } from '@/lib/simulation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { n, p, trials = 1000 } = body;

    if (n === undefined || p === undefined) {
      return NextResponse.json({ error: 'Недостаточно параметров для симуляции' }, { status: 400 });
    }

    // Выполняем симуляцию на сервере
    const results = runSimulation(n, p, trials);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Ошибка API симуляции:', error);
    return NextResponse.json({ error: 'Ошибка сервера при выполнении симуляции' }, { status: 500 });
  }
}
