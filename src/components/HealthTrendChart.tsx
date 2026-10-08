import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { ScanRecord } from '../types/plant';

interface HealthTrendChartProps {
  scans: ScanRecord[];
  plantName?: string;
  onSelectScan?: (scan: ScanRecord) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const score = data.score;
    const statusText =
      score >= 80
        ? 'તંદુરસ્ત (Healthy)'
        : score >= 65
        ? 'ધ્યાન જરૂરી (Attention)'
        : score >= 45
        ? 'મધ્યમ સમસ્યા (Moderate)'
        : 'ગંભીર (Critical)';
    const statusColor =
      score >= 80
        ? 'text-emerald-700 bg-emerald-100'
        : score >= 65
        ? 'text-amber-700 bg-amber-100'
        : 'text-red-700 bg-red-100';

    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-emerald-100 text-xs space-y-1 z-50">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-stone-500 font-medium">{data.formattedDate}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
            {statusText}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-stone-900">{score}</span>
          <span className="text-[10px] text-stone-400 font-bold uppercase">/ 100</span>
        </div>
        {data.summary && (
          <p className="text-[11px] text-stone-600 line-clamp-2 max-w-[200px] pt-1 border-t border-stone-100">
            {data.summary}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const HealthTrendChart: React.FC<HealthTrendChartProps> = ({
  scans,
  plantName,
  onSelectScan,
}) => {
  if (!scans || scans.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
        <AlertCircle className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
        <p className="font-semibold text-stone-600">આ છોડ માટે કોઈ સ્કેન ડેટા ઉપલબ્ધ નથી.</p>
        <p className="text-[11px] text-stone-400 mt-0.5">નવો સ્કેન લો જેથી હેલ્થ ટ્રેન્ડ તૈયાર થશે.</p>
      </div>
    );
  }

  // Sort scans chronologically ascending
  const sortedScans = [...scans].sort((a, b) => a.timestamp - b.timestamp);

  const chartData = sortedScans.map((s, index) => {
    const rawDate = new Date(s.timestamp);
    const shortDate = rawDate.toLocaleDateString('gu-IN', {
      day: 'numeric',
      month: 'short',
    });
    return {
      index: index + 1,
      id: s.id,
      date: shortDate || s.dateFormatted,
      formattedDate: s.dateFormatted || rawDate.toLocaleDateString(),
      score: s.analysis.health.score,
      summary: s.analysis.health.summary,
      rawScan: s,
    };
  });

  const firstScore = chartData[0].score;
  const lastScore = chartData[chartData.length - 1].score;
  const diff = lastScore - firstScore;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-sm space-y-3">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <h4 className="font-extrabold text-sm text-stone-900">
              📈 Plant Health Trend
            </h4>
          </div>
          {plantName && (
            <p className="text-xs text-stone-500 font-medium ml-6">
              {plantName} • આરોગ્ય પ્રગતિ આલેખ
            </p>
          )}
        </div>

        {/* Diff Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              diff > 0
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : diff < 0
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            {diff > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            ) : diff < 0 ? (
              <TrendingDown className="w-3.5 h-3.5 text-amber-700" />
            ) : (
              <Minus className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span>
              {diff > 0
                ? `+${diff}% સુધારો (Recovery)`
                : diff < 0
                ? `${diff}% ઘટાડો (Drop)`
                : 'સ્થિર સ્થિતિ'}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 12, left: -22, bottom: 4 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload.length && onSelectScan) {
                const scan = e.activePayload[0].payload.rawScan;
                if (scan) onSelectScan(scan);
              }
            }}
          >
            <defs>
              <linearGradient id="healthScoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              dy={6}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            />

            {/* Threshold line at 80 (Healthy benchmark) */}
            <ReferenceLine
              y={80}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'તંદુરસ્ત (80)',
                fill: '#059669',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="score"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#healthScoreGradient)"
              activeDot={{
                r: 6,
                fill: '#059669',
                stroke: '#ffffff',
                strokeWidth: 3,
                className: 'filter drop-shadow-md cursor-pointer',
              }}
              dot={{
                r: 4,
                fill: '#ffffff',
                stroke: '#059669',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer statistics */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span>કુલ સ્કેન ઇતિહાસ: {chartData.length}</span>
        </span>

        <span className="font-semibold text-emerald-800">
          તાજેતરનો સ્કોર: {lastScore}/100
        </span>
      </div>
    </div>
  );
};
