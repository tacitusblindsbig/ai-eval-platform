/**
 * Supabase client configuration
 * Provides database access for test cases and evaluation results
 */

import { createClient } from '@supabase/supabase-js';
import { TestCase, EvaluationResult } from '@/types';

// Use placeholder values during build if env vars are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Supabase client instance
 * Use this for all database operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Database helper functions
 */

/**
 * Fetch all test cases from the database
 */
export async function getAllTestCases(): Promise<TestCase[]> {
  const { data, error } = await supabase
    .from('test_cases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch test cases: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single test case by ID
 */
export async function getTestCaseById(id: string): Promise<TestCase | null> {
  const { data, error } = await supabase
    .from('test_cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch test case: ${error.message}`);
  }

  return data;
}

/**
 * Insert multiple test cases into the database
 */
export async function insertTestCases(testCases: Omit<TestCase, 'id' | 'created_at'>[]): Promise<TestCase[]> {
  const { data, error } = await supabase
    .from('test_cases')
    .insert(testCases)
    .select();

  if (error) {
    throw new Error(`Failed to insert test cases: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch all evaluation results with optional test case data
 */
export async function getAllEvaluationResults(): Promise<any[]> {
  const { data, error } = await supabase
    .from('evaluation_results')
    .select(`
      *,
      test_case:test_cases(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch evaluation results: ${error.message}`);
  }

  return data || [];
}

/**
 * Insert an evaluation result into the database
 */
export async function insertEvaluationResult(result: {
  test_case_id: string;
  actual_output: string;
  accuracy_score: number;
  clarity_score: number;
  completeness_score: number;
  total_score: number;
  model_used: string;
}): Promise<any> {
  const { data, error } = await supabase
    .from('evaluation_results')
    .insert(result)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert evaluation result: ${error.message}`);
  }

  return data;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  // Get total test cases
  const { count: testCasesCount } = await supabase
    .from('test_cases')
    .select('*', { count: 'exact', head: true });

  // Get total evaluations
  const { count: evaluationsCount } = await supabase
    .from('evaluation_results')
    .select('*', { count: 'exact', head: true });

  // Get average score
  const { data: avgData } = await supabase
    .from('evaluation_results')
    .select('total_score');

  const averageScore = avgData && avgData.length > 0
    ? avgData.reduce((sum, result) => sum + result.total_score, 0) / avgData.length
    : 0;

  return {
    totalTestCases: testCasesCount || 0,
    totalEvaluations: evaluationsCount || 0,
    averageScore: Math.round(averageScore * 10) / 10,
  };
}
