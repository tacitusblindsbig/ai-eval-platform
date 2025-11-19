'use client';

/**
 * CSV upload form component with drag-and-drop support
 */

import { useState } from 'react';
import { parseTestCases, validateCSVFile, generateSampleCSV } from '@/lib/csv-parser';
import { TestCaseCSVRow } from '@/types';

interface UploadFormProps {
  onUploadSuccess?: (testCases: TestCaseCSVRow[]) => void;
}

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<TestCaseCSVRow[] | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    setPreviewData(null);

    // Validate file
    const validation = validateCSVFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);

    // Parse and preview the file
    try {
      setIsProcessing(true);
      const testCases = await parseTestCases(selectedFile);
      setPreviewData(testCases);
    } catch (err: any) {
      setError(err.message);
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!previewData) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Send to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testCases: previewData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload test cases');
      }

      const data = await response.json();

      // Reset form
      setFile(null);
      setPreviewData(null);

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(data.testCases);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleCSV = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-test-cases.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">CSV Format Requirements</h3>
        <p className="text-sm text-blue-800 mb-2">
          Your CSV file should have two columns: <code className="bg-blue-100 px-1 py-0.5 rounded">prompt</code> and{' '}
          <code className="bg-blue-100 px-1 py-0.5 rounded">expected_output</code>
        </p>
        <button
          onClick={downloadSampleCSV}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Download sample CSV template
        </button>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="text-blue-600 hover:text-blue-500 font-medium">
              Upload a CSV file
            </span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={handleFileInput}
            />
          </label>
          <p className="text-gray-500 text-sm mt-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">CSV files up to 5MB</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Processing CSV file...</p>
        </div>
      )}

      {/* Preview Data */}
      {previewData && !isProcessing && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Successfully parsed <strong>{previewData.length}</strong> test case
              {previewData.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Preview (first 5 rows)</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Prompt
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Expected Output
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                        {row.prompt}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                        {row.expected_output}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Upload {previewData.length} Test Case{previewData.length !== 1 ? 's' : ''} to Database
          </button>
        </div>
      )}
    </div>
  );
}
