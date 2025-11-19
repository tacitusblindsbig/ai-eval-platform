'use client';

/**
 * Results page for viewing evaluation history and trends
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import ScoreChart from '@/components/ScoreChart';
import { EvaluationWithTestCase } from '@/types';

export default function ResultsPage() {
  const [results, setResults] = useState<EvaluationWithTestCase[]>([]);
  const [filteredResults, setFilteredResults] = useState<EvaluationWithTestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    // Filter and sort results
    let filtered = results;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (result) =>
          result.test_case?.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.actual_output.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === 'date') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      filtered = [...filtered].sort((a, b) => b.total_score - a.total_score);
    }

    setFilteredResults(filtered);
  }, [results, searchQuery, sortBy]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/results');
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err: any) {
      console.error('Error fetching results:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = filteredResults.map((result) => ({
      timestamp: new Date(result.created_at).toLocaleString(),
      prompt: result.test_case?.prompt || '',
      expected_output: result.test_case?.expected_output || '',
      actual_output: result.actual_output,
      accuracy_score: result.scores.accuracy,
      clarity_score: result.scores.clarity,
      completeness_score: result.scores.completeness,
      total_score: result.total_score,
      model_used: result.model_used,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart data
  const chartData = results
    .map((result) => ({
      date: result.created_at,
      accuracy: result.scores.accuracy,
      clarity: result.scores.clarity,
      completeness: result.scores.completeness,
      total: result.total_score,
    }))
    .reverse(); // Reverse to show oldest to newest

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
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
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Run Evaluations
            </Link>
            <Link
              href="/results"
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
            >
              View Results
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Evaluation Results</h2>
          <p className="mt-2 text-sm text-gray-600">
            View and analyze your evaluation history and performance trends.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
          </div>
        ) : (
          <>
            {/* Score Trends Chart */}
            {results.length > 0 && (
              <div className="mb-8">
                <ScoreChart data={chartData} />
              </div>
            )}

            {/* Filters and Actions */}
            {results.length > 0 && (
              <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search results..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="score">Sort by Score</option>
                  </select>
                  <button
                    onClick={exportToCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            )}

            {/* Results Table */}
            {filteredResults.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  {searchQuery ? 'No results found matching your search.' : 'No evaluation results yet.'}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {searchQuery ? 'Try a different search query.' : 'Run some evaluations to see results here.'}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test Case
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Accuracy
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clarity
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completeness
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredResults.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(result.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs">
                              <p className="line-clamp-2">{result.test_case?.prompt || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`text-lg font-semibold ${getScoreColor(
                                result.scores.accuracy
                              )}`}
                            >
                              {result.scores.accuracy}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`text-lg font-semibold ${getScoreColor(
                                result.scores.clarity
                              )}`}
                            >
                              {result.scores.clarity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`text-lg font-semibold ${getScoreColor(
                                result.scores.completeness
                              )}`}
                            >
                              {result.scores.completeness}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`text-xl font-bold ${getScoreColor(result.total_score)}`}
                            >
                              {result.total_score.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
