import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const { user_id, email, name, phone, address } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // Try to fetch existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        data: existingProfile
      });
    }

    // If profile doesn't exist, create it
    const { data: newProfile, error: insertError } = await supabase
      .from("user_profiles")
      .insert({
        user_id,
        role_id: 7, // Default customer role
        email: email || "",
        name: name || "",
        phone: phone || "",
        address: address || "",
        is_active: true
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error creating user profile:", insertError);
      return NextResponse.json(
        { error: "Failed to create user profile", message: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newProfile,
      created: true
    });
  } catch (error: any) {
    console.error("Error in get-or-create-profile:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
