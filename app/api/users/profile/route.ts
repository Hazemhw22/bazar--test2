import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch user profile using service role (bypasses RLS)
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, user_id, email, name, phone, address, image_url, is_active, created_at, updated_at, role_id")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profile", details: profileError.message },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Fetch role name if role_id exists
    let roleName = "customer";
    if (profile.role_id) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("name")
        .eq("id", profile.role_id)
        .single();

      if (roleData) {
        roleName = roleData.name;
      }
    }

    // Return profile with role
    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        role: roleName,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
