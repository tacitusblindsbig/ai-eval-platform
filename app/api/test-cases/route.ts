/**
 * API route for fetching test cases
 * GET /api/test-cases
 */

import { NextResponse } from 'next/server';
import { getAllTestCases } from '@/lib/supabase';

export async function GET() {
  try {
    const testCases = await getAllTestCases();

    return NextResponse.json({
      success: true,
      testCases,
    });
  } catch (error: any) {
    console.error('Error fetching test cases:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch test cases' },
      { status: 500 }
    );
  }
}
