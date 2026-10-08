import React from 'react';
import { HealthStatus, ConfidenceLevel } from '../types/plant';

interface HealthScoreGaugeProps {
  score: number;
  status: HealthStatus;
  statusText?: string;
  confidence?: ConfidenceLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  status,
  statusText,
  confidence,
  size = 'md',
}) => {
  // Determine color scheme
  let color = '#10b981'; // green
  let bgColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let badgeColor = 'bg-emerald-500';
  let statusLabel = statusText || 'Healthy';

  if (score < 45 || status === 'critical') {
    color = '#ef4444'; // red
    bgColor = 'bg-red-50 text-red-800 border-red-200';
    badgeColor = 'bg-red-500';
    if (!statusText) statusLabel = 'Critical (ગંભીર)';
  } else if (score < 65 || status === 'moderate') {
    color = '#f97316'; // orange
    bgColor = 'bg-orange-50 text-orange-800 border-orange-200';
    badgeColor = 'bg-orange-500';
    if (!statusText) statusLabel = 'Moderate Problem (મધ્યમ)';
  } else if (score < 80 || status === 'attention') {
    color = '#eab308'; // yellow
    bgColor = 'bg-amber-50 text-amber-800 border-amber-200';
    badgeColor = 'bg-amber-500';
    if (!statusText) statusLabel = 'Needs Attention (ધ્યાન જરૂરી)';
  }

  const radius = size === 'sm' ? 32 : size === 'lg' ? 64 : 48;
  const stroke = size === 'sm' ? 6 : size === 'lg' ? 10 : 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const dimension = radius * 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg height={dimension} width={dimension} className="transform -rotate-90">
          {/* Background track */}
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Animated Progress stroke */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1.2s ease-in-out',
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`font-black tracking-tight leading-none ${
              size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl'
            } text-stone-800`}
          >
            {score}
          </span>
          <span className="text-[10px] text-stone-600 font-semibold uppercase mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {/* Status Pill Badge */}
      <div className="mt-2.5 flex flex-col items-center gap-1">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${bgColor}`}
        >
          <span className={`w-2 h-2 rounded-full ${badgeColor} animate-pulse`} />
          <span>{statusLabel}</span>
        </div>

        {confidence && (
          <span className="text-[11px] text-stone-600 font-medium">
            AI વિશ્વાસ: {confidence === 'high' ? 'ઊંચો (High)' : confidence === 'medium' ? 'મધ્યમ (Medium)' : 'નીચો (Low)'}
          </span>
        )}
      </div>
    </div>
  );
};
