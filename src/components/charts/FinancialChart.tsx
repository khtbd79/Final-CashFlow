import React, { useMemo, useState } from 'react';
import { formatCurrency } from '../../engine/prng';

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  values: number[];
}

interface FinancialChartProps {
  labels: string[];
  series: ChartSeries[];
  height?: number;
  valueFormatter?: (v: number) => string;
  emptyLabel?: string;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({
  labels,
  series,
  height = 220,
  valueFormatter = (v) => formatCurrency(v),
  emptyLabel = 'Advance months to populate chart history.',
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 640;
  const padL = 62;
  const padR = 16;
  const padT = 18;
  const padB = 30;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const { minVal, maxVal, yTicks } = useMemo(() => {
    const allValues = series.flatMap((s) => s.values);
    if (allValues.length === 0) {
      return { minVal: 0, maxVal: 100, yTicks: [0, 50, 100] };
    }
    let min = Math.min(...allValues);
    let max = Math.max(...allValues);
    if (min === max) {
      min = min * 0.9;
      max = max * 1.1 || 100;
    }
    const span = max - min;
    const paddedMin = min - span * 0.1;
    const paddedMax = max + span * 0.1;
    const ticks = [
      paddedMin,
      paddedMin + (paddedMax - paddedMin) * 0.33,
      paddedMin + (paddedMax - paddedMin) * 0.66,
      paddedMax,
    ];
    return { minVal: paddedMin, maxVal: paddedMax, yTicks: ticks };
  }, [series]);

  const count = Math.max(labels.length, series[0]?.values.length ?? 0);

  const getX = (idx: number) => {
    if (count <= 1) return padL + innerW / 2;
    return padL + (idx / (count - 1)) * innerW;
  };

  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal || 1);
    return padT + innerH - ratio * innerH;
  };

  if (count === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-[#665B53]"
        style={{ height }}
      >
        {emptyLabel}
      </div>
    );
  }

  const activeIdx = hoverIdx !== null && hoverIdx < count ? hoverIdx : count - 1;

  return (
    <div className="w-full select-none">
      {/* Legend + Live Active Value Readout */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {series.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-[#5E544C]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: s.color }}
              />
              <span>{s.label}</span>
              <span className="font-mono font-bold text-[#26201C] tabular-nums">
                {valueFormatter(s.values[activeIdx] ?? 0)}
              </span>
            </div>
          ))}
        </div>
        <span className="font-mono text-[#665B53] tabular-nums">
          {labels[activeIdx] ?? ''}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          {series.map((s) => (
            <linearGradient
              key={s.id}
              id={`grad_${s.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal gridlines */}
        {yTicks.map((tick, idx) => {
          const y = getY(tick);
          return (
            <g key={idx}>
              <line
                x1={padL}
                y1={y}
                x2={width - padR}
                y2={y}
                stroke="#DFCEBC"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-[#665B53] font-mono text-[13.5px]"
              >
                {valueFormatter(Math.round(tick))}
              </text>
            </g>
          );
        })}

        {/* Zero line if visible */}
        {minVal < 0 && maxVal > 0 && (
          <line
            x1={padL}
            y1={getY(0)}
            x2={width - padR}
            y2={getY(0)}
            stroke="#9C8F84"
            strokeWidth="1"
          />
        )}

        {/* Series Paths */}
        {series.map((s) => {
          if (s.values.length === 0) return null;
          const points = s.values.map((v, i) => `${getX(i)},${getY(v)}`);
          const lineD = `M ${points.join(' L ')}`;
          const areaD = `${lineD} L ${getX(s.values.length - 1)},${padT + innerH} L ${getX(0)},${padT + innerH} Z`;
          return (
            <g key={s.id}>
              {series.length === 1 && (
                <path d={areaD} fill={`url(#grad_${s.id})`} />
              )}
              <path
                d={lineD}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {s.values[activeIdx] !== undefined && (
                <circle
                  cx={getX(activeIdx)}
                  cy={getY(s.values[activeIdx])}
                  r="4.5"
                  fill={s.color}
                  stroke="#F6E7D7"
                  strokeWidth="2"
                />
              )}
            </g>
          );
        })}

        {hoverIdx !== null && (
          <line
            x1={getX(activeIdx)}
            y1={padT}
            x2={getX(activeIdx)}
            y2={padT + innerH}
            stroke="#9C8F84"
            strokeDasharray="2 2"
            strokeWidth="1"
          />
        )}

        {labels.map((lbl, i) => {
          const step = Math.max(1, Math.ceil(labels.length / 6));
          if (i !== 0 && i !== labels.length - 1 && i % step !== 0) return null;
          return (
            <text
              key={i}
              x={getX(i)}
              y={height - 6}
              textAnchor="middle"
              className="fill-[#665B53] font-mono text-[13.5px]"
            >
              {lbl}
            </text>
          );
        })}

        {Array.from({ length: count }).map((_, idx) => {
          const colW = count > 1 ? innerW / count : innerW;
          const x = getX(idx) - colW / 2;
          return (
            <rect
              key={idx}
              x={Math.max(padL, x)}
              y={padT}
              width={colW}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(idx)}
              onTouchStart={() => setHoverIdx(idx)}
            />
          );
        })}
      </svg>
    </div>
  );
};

interface MiniSparklineProps {
  values: number[];
  positive: boolean;
  height?: number;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  values,
  positive,
  height = 36,
}) => {
  if (values.length < 2) return null;
  const w = 120;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = height - 4 - ((v - min) / span) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const color = positive ? '#169C5E' : '#DC2626';

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-24 shrink-0" style={{ height }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
};
