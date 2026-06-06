import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// এই লগটি যোগ করুন ডেবগ করার জন্য
console.log("--- Supabase Client Debugging ---");
console.log("URL exists:", !!supabaseUrl);
console.log("Service Key exists:", !!supabaseServiceRoleKey); 
console.log("---------------------------------");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET() {
  try {
    // স্কিমা অনুযায়ী 'crop_type' এবং 'region' কলাম সিলেক্ট করা হলো
    const { data, error } = await supabase
      .from('diagnoses')
      .select('region, crop_type');

    if (error) {
      throw error;
    }

    const analyticsMap = {};

    data.forEach(item => {
      const region = item.region || 'অজানা অঞ্চল';
      const crop = item.crop_type || 'অজানা ফসল'; 
      const key = `${region}-${crop}`;

      if (!analyticsMap[key]) {
        analyticsMap[key] = { region, crop, count: 0 };
      }
      analyticsMap[key].count += 1;
    });

    const finalAnalyticsData = Object.values(analyticsMap);
    return NextResponse.json(finalAnalyticsData);

  } catch (error) {
    console.error('Dashboard Analytics Error:', error.message);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}