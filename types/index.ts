/**
 * Core TypeScript interfaces for the AI Evaluation Platform
 */

/**
 * Test case containing a prompt and expected output
 */
export interface TestCase {
  id: string;
  prompt: string;
  expected_output: string;
  created_at: string;
}

/**
 * Rubric scores for evaluation (each scored 0-10)
 */
export interface RubricScores {
  accuracy: number;   // How factually correct is the output (0-10)
  clarity: number;    // How clear and understandable is the output (0-10)
  completeness: number; // Does it cover all required points (0-10)
}

/**
 * Complete evaluation result for a test case
 */
export interface EvaluationResult {
  id: string;
  test_case_id: string;
  actual_output: string;
  scores: RubricScores;
  total_score: number; // Average of the three rubric scores
  model_used: string;  // e.g., "gemini-2.0-flash"
  created_at: string;
}

/**
 * CSV row format for uploading test cases
 */
export interface TestCaseCSVRow {
  prompt: string;
  expected_output: string;
}

/**
 * Statistics for the dashboard
 */
export interface DashboardStats {
  totalTestCases: number;
  totalEvaluations: number;
  averageScore: number;
}

/**
 * Evaluation result with associated test case data (for display)
 */
export interface EvaluationWithTestCase extends EvaluationResult {
  test_case?: TestCase;
}
