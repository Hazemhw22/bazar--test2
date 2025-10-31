import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // Fetch user role using service role to bypass RLS
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("role_id")
      .eq("user_id", user_id)
      .single();

    if (error) {
      // User profile doesn't exist yet
      return NextResponse.json({
        success: true,
        data: { role_id: null }
      });
    }

    return NextResponse.json({
      success: true,
      data: { role_id: profile.role_id }
    });
  } catch (error: any) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
