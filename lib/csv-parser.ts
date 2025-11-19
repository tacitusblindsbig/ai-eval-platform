/**
 * CSV parsing utilities for test case uploads
 * Handles parsing and validation of CSV files containing test cases
 */

import Papa from 'papaparse';
import { TestCaseCSVRow } from '@/types';

/**
 * Parse a CSV file containing test cases
 *
 * Expected CSV format:
 * prompt,expected_output
 * "What is 2+2?","4"
 * "Explain photosynthesis","Photosynthesis is the process..."
 *
 * @param file - The CSV file to parse
 * @returns Promise<TestCaseCSVRow[]> - Array of parsed test cases
 * @throws Error if file is invalid or parsing fails
 */
export async function parseTestCases(file: File): Promise<TestCaseCSVRow[]> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      reject(new Error('Invalid file type. Please upload a CSV file.'));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error('File too large. Maximum size is 5MB.'));
      return;
    }

    Papa.parse<TestCaseCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize header names (trim whitespace and lowercase)
        return header.trim().toLowerCase();
      },
      complete: (results) => {
        try {
          // Validate that we have data
          if (!results.data || results.data.length === 0) {
            reject(new Error('CSV file is empty or contains no valid data.'));
            return;
          }

          // Validate and transform each row
          const testCases: TestCaseCSVRow[] = [];
          const errors: string[] = [];

          results.data.forEach((row: any, index: number) => {
            const rowNumber = index + 2; // +2 because index is 0-based and row 1 is header

            // Check for required fields
            if (!row.prompt || typeof row.prompt !== 'string' || row.prompt.trim() === '') {
              errors.push(`Row ${rowNumber}: Missing or empty 'prompt' field`);
              return;
            }

            if (!row.expected_output || typeof row.expected_output !== 'string' || row.expected_output.trim() === '') {
              errors.push(`Row ${rowNumber}: Missing or empty 'expected_output' field`);
              return;
            }

            testCases.push({
              prompt: row.prompt.trim(),
              expected_output: row.expected_output.trim(),
            });
          });

          // If there are validation errors, reject with detailed message
          if (errors.length > 0) {
            reject(new Error(`CSV validation failed:\n${errors.join('\n')}`));
            return;
          }

          // If no valid test cases were found
          if (testCases.length === 0) {
            reject(new Error('No valid test cases found in CSV file.'));
            return;
          }

          resolve(testCases);
        } catch (error: any) {
          reject(new Error(`Failed to process CSV data: ${error.message}`));
        }
      },
      error: (error: any) => {
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      },
    });
  });
}

/**
 * Validate CSV file before uploading
 * Checks file type and size without parsing content
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  if (!file.name.endsWith('.csv')) {
    return { valid: false, error: 'Invalid file type. Please upload a CSV file.' };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 5MB.' };
  }

  return { valid: true };
}

/**
 * Generate a sample CSV string for download
 * Users can download this as a template
 */
export function generateSampleCSV(): string {
  const sampleData = [
    {
      prompt: 'What is 2 + 2?',
      expected_output: '4',
    },
    {
      prompt: 'Explain what photosynthesis is in simple terms.',
      expected_output: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.',
    },
    {
      prompt: 'Write a haiku about coding.',
      expected_output: 'Lines of code align\nBugs emerge from the shadows\nDebug through the night',
    },
  ];

  return Papa.unparse(sampleData);
}
