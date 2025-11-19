/**
 * API route for fetching evaluation results
 * GET /api/results
 */

import { NextResponse } from 'next/server';
import { getAllEvaluationResults, getDashboardStats } from '@/lib/supabase';

export async function GET() {
  try {
    const results = await getAllEvaluationResults();

    // Transform the results to include test case data
    const formattedResults = results.map((result) => ({
      id: result.id,
      test_case_id: result.test_case_id,
      actual_output: result.actual_output,
      scores: {
        accuracy: result.accuracy_score,
        clarity: result.clarity_score,
        completeness: result.completeness_score,
      },
      total_score: result.total_score,
      model_used: result.model_used,
      created_at: result.created_at,
      test_case: result.test_case,
    }));

    return NextResponse.json({
      success: true,
      results: formattedResults,
    });
  } catch (error: any) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
