'use client';

/**
 * Evaluate page for running evaluations on test cases
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TestCaseTable from '@/components/TestCaseTable';
import { TestCase } from '@/types';

export default function EvaluatePage() {
  const router = useRouter();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [batchEvaluating, setBatchEvaluating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTestCases();
  }, []);

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/test-cases');
      if (!response.ok) {
        throw new Error('Failed to fetch test cases');
      }

      const data = await response.json();
      setTestCases(data.testCases);
    } catch (err: any) {
      console.error('Error fetching test cases:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async (testCaseId: string) => {
    try {
      setEvaluatingId(testCaseId);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testCaseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run evaluation');
      }

      const data = await response.json();
      setSuccessMessage(
        `Evaluation completed! Score: ${data.result.total_score.toFixed(1)}/10`
      );

      // Redirect to results page after 2 seconds
      setTimeout(() => {
        router.push('/results');
      }, 2000);
    } catch (err: any) {
      console.error('Error running evaluation:', err);
      setError(err.message);
    } finally {
      setEvaluatingId(null);
    }
  };

  const handleRunBatchEvaluation = async () => {
    if (testCases.length === 0) {
      setError('No test cases to evaluate');
      return;
    }

    if (!confirm(`Run evaluation on all ${testCases.length} test cases? This may take several minutes.`)) {
      return;
    }

    try {
      setBatchEvaluating(true);
      setError(null);
      setSuccessMessage(null);

      const testCaseIds = testCases.map((tc) => tc.id);

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testCaseIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run batch evaluation');
      }

      const data = await response.json();
      setSuccessMessage(
        `Batch evaluation completed! ${data.totalEvaluated} test cases evaluated.`
      );

      // Redirect to results page after 2 seconds
      setTimeout(() => {
        router.push('/results');
      }, 2000);
    } catch (err: any) {
      console.error('Error running batch evaluation:', err);
      setError(err.message);
    } finally {
      setBatchEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Evaluation Platform</h1>
              <p className="mt-1 text-sm text-gray-600">
                Test and score AI-generated content using LLM-as-judge methodology
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Upload Test Cases
            </Link>
            <Link
              href="/evaluate"
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
            >
              Run Evaluations
            </Link>
            <Link
              href="/results"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              View Results
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Run Evaluations</h2>
            <p className="mt-2 text-sm text-gray-600">
              Select a test case to evaluate or run batch evaluation on all test cases.
            </p>
          </div>
          {testCases.length > 0 && (
            <button
              onClick={handleRunBatchEvaluation}
              disabled={batchEvaluating || !!evaluatingId}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {batchEvaluating ? (
                <>
                  <svg
                    className="inline-block animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Evaluating All...
                </>
              ) : (
                `Evaluate All (${testCases.length})`
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-green-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
            <p className="text-sm text-green-700 mt-2">Redirecting to results page...</p>
          </div>
        )}

        {batchEvaluating && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="animate-spin h-5 w-5 text-blue-600 mr-2"
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
              <p className="text-sm text-blue-800">
                Running batch evaluation... This may take several minutes. Please do not close this page.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading test cases...</p>
          </div>
        ) : (
          <TestCaseTable
            testCases={testCases}
            onRunEvaluation={handleRunEvaluation}
            isEvaluating={!!evaluatingId || batchEvaluating}
            evaluatingId={evaluatingId}
          />
        )}
      </main>
    </div>
  );
}
