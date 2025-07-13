import { NextRequest, NextResponse } from 'next/server';
import supabase, { checkEnvMissing } from '@/lib/supabase';

// GET /api/supabase-test - Test Supabase connectivity
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Supabase connectivity...');
    
    // Check if environment variables are missing
    if (checkEnvMissing()) {
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables are missing',
        details: {
          SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing'
        }
      }, { status: 500 });
    }

    // Test 1: Basic connectivity
    console.log('📡 Testing basic connectivity...');
    const { data: healthData, error: healthError } = await supabase.from('projects').select('count').limit(1);
    
    if (healthError) {
      console.error('❌ Supabase connectivity failed:', healthError);
      return NextResponse.json({
        success: false,
        error: 'Supabase connectivity failed',
        details: healthError
      }, { status: 500 });
    }

    console.log('✅ Basic connectivity successful');

    // Test 2: Storage bucket access
    console.log('🗄️ Testing storage bucket access...');
    const { data: bucketData, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Storage bucket access failed:', bucketError);
      return NextResponse.json({
        success: false,
        error: 'Storage bucket access failed',
        details: bucketError
      }, { status: 500 });
    }

    console.log('✅ Storage bucket access successful');

    // Test 3: List images from storage
    console.log('🖼️ Testing image storage access...');
    const { data: imageData, error: imageError } = await supabase.storage
      .from('images')
      .list('', { limit: 5 });

    if (imageError) {
      console.error('❌ Image storage access failed:', imageError);
      return NextResponse.json({
        success: false,
        error: 'Image storage access failed',
        details: imageError
      }, { status: 500 });
    }

    console.log('✅ Image storage access successful');

    // Test 4: Get public URLs
    console.log('🔗 Testing public URL generation...');
    const testImagePath = 'default.jpeg';
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(testImagePath);

    console.log('✅ Public URL generation successful');

    return NextResponse.json({
      success: true,
      message: 'Supabase connectivity test passed',
      details: {
        connectivity: '✅ Working',
        storage: '✅ Working',
        images: '✅ Working',
        publicUrls: '✅ Working',
        buckets: bucketData?.map(b => b.name) || [],
        sampleImageCount: imageData?.length || 0,
        samplePublicUrl: publicUrl
      }
    });

  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Supabase test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 