import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, phone, roleId = 7 } = body;
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking for existing profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check for existing profile' },
        { status: 500 }
      );
    }

    // If profile already exists, return success
    if (existingProfile) {
      return NextResponse.json({ success: true, message: 'Profile already exists' });
    }

    // Create the user profile using the admin client
    const { data: profile, error: insertError } = await supabaseAdmin
      .from('user_profiles')
      .insert([
        {
          user_id: user.id,
          email: email.toLowerCase(),
          name: name || null,
          phone: phone || null,
          role_id: roleId,
          is_active: true,
          address: null,
          image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
