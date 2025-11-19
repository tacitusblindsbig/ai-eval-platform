'use client';

/**
 * Table component for displaying test cases
 */

import { TestCase } from '@/types';
import { useState } from 'react';

interface TestCaseTableProps {
  testCases: TestCase[];
  onRunEvaluation?: (testCaseId: string) => void;
  isEvaluating?: boolean;
  evaluatingId?: string | null;
}

export default function TestCaseTable({
  testCases,
  onRunEvaluation,
  isEvaluating = false,
  evaluatingId = null,
}: TestCaseTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!testCases || testCases.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No test cases found.</p>
        <p className="text-sm text-gray-400 mt-2">
          Upload a CSV file to get started.
        </p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prompt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Output
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              {onRunEvaluation && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testCases.map((testCase) => (
              <tr key={testCase.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    {expandedId === testCase.id ? (
                      <div>
                        <p className="whitespace-pre-wrap">{testCase.prompt}</p>
                        <button
                          onClick={() => toggleExpand(testCase.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                        >
                          Show less
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="line-clamp-2">{testCase.prompt}</p>
                        {testCase.prompt.length > 100 && (
                          <button
                            onClick={() => toggleExpand(testCase.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                          >
                            Show more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs line-clamp-2">{testCase.expected_output}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(testCase.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                {onRunEvaluation && (
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => onRunEvaluation(testCase.id)}
                      disabled={isEvaluating}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white ${
                        evaluatingId === testCase.id
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors`}
                    >
                      {evaluatingId === testCase.id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Evaluating...
                        </>
                      ) : (
                        'Run Evaluation'
                      )}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
