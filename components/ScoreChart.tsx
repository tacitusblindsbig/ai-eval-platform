'use client';

/**
 * Chart component for visualizing evaluation scores over time
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ScoreChartProps {
  data: Array<{
    date: string;
    accuracy: number;
    clarity: number;
    completeness: number;
    total: number;
  }>;
}

export default function ScoreChart({ data }: ScoreChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No evaluation data to display yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Run some evaluations to see trends over time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trends Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Accuracy"
          />
          <Line
            type="monotone"
            dataKey="clarity"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Clarity"
          />
          <Line
            type="monotone"
            dataKey="completeness"
            stroke="#ec4899"
            strokeWidth={2}
            name="Completeness"
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            strokeWidth={3}
            name="Total Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
