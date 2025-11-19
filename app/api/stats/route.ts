/**
 * API route for fetching dashboard statistics
 * GET /api/stats
 */

import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/supabase';

export async function GET() {
  try {
    const stats = await getDashboardStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
