import { NextRequest, NextResponse } from 'next/server';
import { calculateNForSigma, calculatePForSigma } from '@/lib/math';
import { Decimal } from 'decimal.js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { n, p, k, ticketPrice, reward } = body;

    const D_n = new Decimal(n);
    const D_p = new Decimal(p);
    const D_reward = new Decimal(reward);
    const D_price = new Decimal(ticketPrice);

    const mu = D_n.mul(D_p);
    const sigma = D_n.mul(D_p).mul(new Decimal(1).minus(D_p)).sqrt();

    const s1Start = Decimal.max(0, mu.minus(sigma).ceil());
    const s1End = mu.plus(sigma).floor();
    const s2Start = Decimal.max(0, mu.minus(sigma.mul(2)).ceil());
    const s2End = mu.plus(sigma.mul(2)).floor();
    const s3Start = Decimal.max(0, mu.minus(sigma.mul(3)).ceil());
    const s3End = mu.plus(sigma.mul(3)).floor();

    // Возвращаем чистые расчетные значения без блокировок
    const reqN1s = calculateNForSigma(p, k, 1);
    const reqN2s = calculateNForSigma(p, k, 2);
    const reqN3s = calculateNForSigma(p, k, 3);

    const reqP1s = calculatePForSigma(n, k, 1);
    const reqP2s = calculatePForSigma(n, k, 2);
    const reqP3s = calculatePForSigma(n, k, 3);

    const z = new Decimal(k).minus(0.5).minus(mu).div(sigma);
    const probAtLeastK = new Decimal(1).minus(new Decimal(0.5).mul(new Decimal(1).plus(erf(z.div(new Decimal(2).sqrt())))));
    const profit = mu.mul(D_reward).minus(D_n.mul(D_price));

    return NextResponse.json({
      ev: mu.toNumber(),
      sd: sigma.toNumber(),
      probAtLeastK: probAtLeastK.toNumber(),
      profit: profit.toNumber(),
      sigmaRanges: {
        s1: { start: s1Start.toNumber(), end: s1End.toNumber() },
        s2: { start: s2Start.toNumber(), end: s2End.toNumber() },
        s3: { start: s3Start.toNumber(), end: s3End.toNumber() }
      },
      sigmaProfits: {
        s1: { 
          start: s1Start.mul(D_reward).minus(D_n.mul(D_price)).toNumber(), 
          end: s1End.mul(D_reward).minus(D_n.mul(D_price)).toNumber() 
        },
        s2: { 
          start: s2Start.mul(D_reward).minus(D_n.mul(D_price)).toNumber(), 
          end: s2End.mul(D_reward).minus(D_n.mul(D_price)).toNumber() 
        },
        s3: { 
          start: s3Start.mul(D_reward).minus(D_n.mul(D_price)).toNumber(), 
          end: s3End.mul(D_reward).minus(D_n.mul(D_price)).toNumber() 
        }
      },
      reqN1s, reqN2s, reqN3s,
      reqP1s, reqP2s, reqP3s
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function erf(x: Decimal): Decimal {
  const a1 = new Decimal(0.254829592);
  const a2 = new Decimal(-0.284496736);
  const a3 = new Decimal(1.421413741);
  const a4 = new Decimal(-1.453152027);
  const a5 = new Decimal(1.061405429);
  const p = new Decimal(0.3275911);
  const sign = x.gte(0) ? 1 : -1;
  const absX = x.abs();
  const t = new Decimal(1).div(new Decimal(1).plus(p.mul(absX)));
  const inner = a5.mul(t).plus(a4).mul(t).plus(a3).mul(t).plus(a2).mul(t).plus(a1).mul(t);
  const y = new Decimal(1).minus(inner.mul(absX.pow(2).neg().exp()));
  return y.mul(sign);
}
