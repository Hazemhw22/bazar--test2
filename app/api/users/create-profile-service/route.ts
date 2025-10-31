import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, name, phone, roleId = 7 } = body;
    
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking for existing profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check for existing profile', details: fetchError.message },
        { status: 500 }
      );
    }

    // If profile already exists, return success
    if (existingProfile) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile already exists',
        data: existingProfile 
      });
    }

    // Create the user profile using the service role client
    const { data: profile, error: insertError } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: userId,
          email: email.toLowerCase(),
          name: name || null,
          phone: phone || null,
          role_id: roleId,
          is_active: true,
          address: null,
          image_url: null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return NextResponse.json(
        { error: 'Failed to create profile', details: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile created successfully',
      data: profile 
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
