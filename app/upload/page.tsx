'use client';

/**
 * Upload page for CSV test cases
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UploadForm from '@/components/UploadForm';

export default function UploadPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUploadSuccess = (testCases: any[]) => {
    setSuccessMessage(
      `Successfully uploaded ${testCases.length} test case${testCases.length !== 1 ? 's' : ''}!`
    );

    // Redirect to evaluate page after 2 seconds
    setTimeout(() => {
      router.push('/evaluate');
    }, 2000);
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
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
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
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              View Results
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload Test Cases</h2>
          <p className="mt-2 text-sm text-gray-600">
            Upload a CSV file containing your test cases to evaluate AI-generated content.
          </p>
        </div>

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
            <p className="text-sm text-green-700 mt-2">Redirecting to evaluation page...</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        </div>
      </main>
    </div>
  );
}
