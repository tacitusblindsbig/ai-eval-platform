# AI Evaluation Platform (EaaS)

A powerful evaluation platform for testing and scoring AI-generated content using LLM-as-judge methodology. Built with Next.js 14, TypeScript, Gemini AI, and Supabase.

## Features

- **CSV Upload**: Easily upload test cases via drag-and-drop CSV files
- **LLM-as-Judge**: Automated evaluation using Google's Gemini AI model
- **Rubric Scoring**: Get detailed scores on Accuracy, Clarity, and Completeness (0-10 scale)
- **Batch Evaluation**: Run evaluations on multiple test cases at once
- **Results Dashboard**: View statistics, trends, and evaluation history
- **Score Visualization**: Interactive charts showing performance trends over time
- **Export Results**: Download evaluation results as CSV for further analysis

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **LLM**: Google Gemini API (`gemini-2.0-flash-exp`)
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **CSV Parsing**: PapaParse

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Google AI API key (for Gemini)
- A Supabase account and project

## Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd ai-eval-platform
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Gemini API Configuration
GOOGLE_API_KEY=your_google_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to get these:**
- **Google API Key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Supabase URL & Key**: Go to your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API

4. **Set up Supabase database**

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Create test_cases table
CREATE TABLE test_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create evaluation_results table
CREATE TABLE evaluation_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_case_id UUID REFERENCES test_cases(id) ON DELETE CASCADE,
  actual_output TEXT NOT NULL,
  accuracy_score INTEGER NOT NULL CHECK (accuracy_score >= 0 AND accuracy_score <= 10),
  clarity_score INTEGER NOT NULL CHECK (clarity_score >= 0 AND clarity_score <= 10),
  completeness_score INTEGER NOT NULL CHECK (completeness_score >= 0 AND completeness_score <= 10),
  total_score DECIMAL NOT NULL,
  model_used TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_test_cases_created_at ON test_cases(created_at DESC);
CREATE INDEX idx_evaluation_results_created_at ON evaluation_results(created_at DESC);
CREATE INDEX idx_evaluation_results_test_case_id ON evaluation_results(test_case_id);
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## CSV Format Requirements

Your CSV file must have exactly two columns:

| Column Name | Description | Example |
|------------|-------------|---------|
| `prompt` | The input prompt for the AI | "What is 2+2?" |
| `expected_output` | The ideal/expected response | "4" |

**Example CSV:**

```csv
prompt,expected_output
"What is 2 + 2?","4"
"Explain photosynthesis in simple terms.","Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar."
"Write a haiku about coding.","Lines of code align / Bugs emerge from the shadows / Debug through the night"
```

**Tips:**
- Maximum file size: 5MB
- Use quotes for fields containing commas or newlines
- Download the sample template from the Upload page for reference

## How It Works

### 1. Upload Test Cases
- Navigate to the **Upload** page
- Upload a CSV file with your test cases
- Preview the parsed data before saving
- Test cases are stored in Supabase

### 2. Run Evaluations
- Go to the **Evaluate** page
- Choose individual test cases or run batch evaluation
- The system will:
  1. Generate an actual output using Gemini AI based on the prompt
  2. Use Gemini as a judge to evaluate the actual output against the expected output
  3. Provide scores on three criteria:
     - **Accuracy** (0-10): Factual correctness compared to expected output
     - **Clarity** (0-10): How clear and understandable the output is
     - **Completeness** (0-10): Coverage of all required points
  4. Calculate total score (average of the three)
  5. Store results in the database

### 3. View Results
- Visit the **Results** page to see:
  - Interactive score trends chart
  - Complete evaluation history
  - Filter and search functionality
  - Export to CSV option

### 4. Dashboard
- The **Dashboard** shows:
  - Total test cases uploaded
  - Total evaluations run
  - Average score across all evaluations
  - Recent evaluation results

## LLM-as-Judge Methodology

This platform uses a dual-LLM approach:

1. **Generation**: Gemini generates an actual output based on the prompt
2. **Evaluation**: Gemini acts as a judge, comparing the actual output to the expected output using a detailed rubric

The evaluation prompt instructs the LLM to:
- Score on a 0-10 scale for each criterion
- Use objective evaluation standards
- Return structured JSON for consistent parsing

## Project Structure

```
ai-eval-platform/
├── app/
│   ├── api/
│   │   ├── evaluate/route.ts      # Evaluation API endpoint
│   │   ├── results/route.ts       # Fetch results endpoint
│   │   ├── stats/route.ts         # Dashboard stats endpoint
│   │   ├── test-cases/route.ts    # Fetch test cases endpoint
│   │   └── upload/route.ts        # CSV upload endpoint
│   ├── evaluate/page.tsx          # Evaluation page
│   ├── results/page.tsx           # Results page
│   ├── upload/page.tsx            # Upload page
│   └── page.tsx                   # Homepage/Dashboard
├── components/
│   ├── EvalCard.tsx               # Evaluation result card
│   ├── ScoreChart.tsx             # Score trend visualization
│   ├── TestCaseTable.tsx          # Test cases table
│   └── UploadForm.tsx             # CSV upload form
├── lib/
│   ├── csv-parser.ts              # CSV parsing utilities
│   ├── evaluator.ts               # Core evaluation logic
│   ├── gemini.ts                  # Gemini AI client
│   └── supabase.ts                # Supabase client
├── types/
│   └── index.ts                   # TypeScript type definitions
└── .env.local                     # Environment variables
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload test cases from CSV |
| `/api/test-cases` | GET | Fetch all test cases |
| `/api/evaluate` | POST | Run single or batch evaluation |
| `/api/results` | GET | Fetch all evaluation results |
| `/api/stats` | GET | Get dashboard statistics |

## Database Schema

### `test_cases` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `prompt` | TEXT | The input prompt |
| `expected_output` | TEXT | Expected response |
| `created_at` | TIMESTAMP | Creation timestamp |

### `evaluation_results` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `test_case_id` | UUID | Foreign key to test_cases |
| `actual_output` | TEXT | Generated output |
| `accuracy_score` | INTEGER | Accuracy score (0-10) |
| `clarity_score` | INTEGER | Clarity score (0-10) |
| `completeness_score` | INTEGER | Completeness score (0-10) |
| `total_score` | DECIMAL | Average of all scores |
| `model_used` | TEXT | Model identifier |
| `created_at` | TIMESTAMP | Creation timestamp |

## Configuration

### Gemini Model

The default model is `gemini-2.0-flash-exp`. To change it, edit `lib/gemini.ts`:

```typescript
const MODEL_NAME = 'gemini-2.0-flash-exp'; // Change to another Gemini model
```

### Evaluation Timeout

For batch evaluations, there's a 1-second delay between requests to avoid rate limiting. Adjust in `lib/evaluator.ts`:

```typescript
await new Promise(resolve => setTimeout(resolve, 1000)); // Change delay (ms)
```

## Troubleshooting

### "Missing environment variables" error
- Ensure `.env.local` exists and contains valid credentials
- Restart the development server after changing environment variables

### Database connection issues
- Verify your Supabase URL and anon key are correct
- Check that the tables are created in your Supabase project
- Ensure Row Level Security (RLS) is disabled for testing, or configure appropriate policies

### Gemini API errors
- Verify your Google API key is valid
- Check you haven't exceeded API rate limits
- Ensure the Gemini API is enabled for your Google Cloud project

### CSV upload fails
- Ensure CSV has exactly two columns: `prompt` and `expected_output`
- Check file size is under 5MB
- Verify there are no empty required fields

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Production Deployment

This app is ready to deploy on:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Any platform supporting Next.js 14**

Remember to:
1. Set environment variables in your hosting platform
2. Ensure Supabase database is set up
3. Configure API rate limits as needed

## License

MIT

## Support

For issues or questions, please open an issue in the GitHub repository.

---

**Built with Next.js, Gemini AI, and Supabase**
