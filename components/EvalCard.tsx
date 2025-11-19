'use client';

/**
 * Card component for displaying a single evaluation result
 */

import { EvaluationResult } from '@/types';

interface EvalCardProps {
  evaluation: EvaluationResult;
  testCasePrompt?: string;
}

export default function EvalCard({ evaluation, testCasePrompt }: EvalCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTotalScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-600';
    if (score >= 6) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-200">
        <div className="flex-1">
          {testCasePrompt && (
            <p className="text-sm text-gray-600 mb-1 line-clamp-2">{testCasePrompt}</p>
          )}
          <p className="text-xs text-gray-400">{formatDate(evaluation.created_at)}</p>
        </div>
        <div
          className={`ml-4 px-3 py-1 rounded-full text-white font-bold text-lg ${getTotalScoreColor(
            evaluation.total_score
          )}`}
        >
          {evaluation.total_score.toFixed(1)}
        </div>
      </div>

      {/* Rubric Scores */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {/* Accuracy */}
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getScoreColor(evaluation.scores.accuracy)} rounded-lg py-2`}
            >
              {evaluation.scores.accuracy}
            </div>
            <p className="text-xs text-gray-600 mt-1">Accuracy</p>
          </div>

          {/* Clarity */}
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getScoreColor(evaluation.scores.clarity)} rounded-lg py-2`}
            >
              {evaluation.scores.clarity}
            </div>
            <p className="text-xs text-gray-600 mt-1">Clarity</p>
          </div>

          {/* Completeness */}
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getScoreColor(evaluation.scores.completeness)} rounded-lg py-2`}
            >
              {evaluation.scores.completeness}
            </div>
            <p className="text-xs text-gray-600 mt-1">Completeness</p>
          </div>
        </div>

        {/* Actual Output */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">Actual Output:</p>
          <p className="text-sm text-gray-700 line-clamp-3">{evaluation.actual_output}</p>
        </div>

        {/* Model Info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">Model: {evaluation.model_used}</span>
        </div>
      </div>
    </div>
  );
}
