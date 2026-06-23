import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // সার্ভিস রোল কি দিয়ে সুপাবেস ক্লায়েন্ট তৈরি
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 🎯 এখানে 'crop' এর জায়গায় 'crop_type' ব্যবহার করা হয়েছে
    const { data, error } = await supabase
      .from('diagnoses')
      .select('id, region, crop_type, disease_name, severity, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}