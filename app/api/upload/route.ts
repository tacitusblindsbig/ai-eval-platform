/**
 * API route for uploading test cases
 * POST /api/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { insertTestCases } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testCases } = body;

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: testCases array is required' },
        { status: 400 }
      );
    }

    // Validate each test case has required fields
    for (const testCase of testCases) {
      if (!testCase.prompt || !testCase.expected_output) {
        return NextResponse.json(
          { error: 'Invalid test case: prompt and expected_output are required' },
          { status: 400 }
        );
      }
    }

    // Insert test cases into Supabase
    const insertedTestCases = await insertTestCases(testCases);

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${insertedTestCases.length} test case(s)`,
      testCases: insertedTestCases,
    });
  } catch (error: any) {
    console.error('Error uploading test cases:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload test cases' },
      { status: 500 }
    );
  }
}
