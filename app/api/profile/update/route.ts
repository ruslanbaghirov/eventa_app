// app/api/profile/update/route.ts

import { createServerClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get update data
    const body = await request.json();
    const { display_name, bio, location, phone, avatar_url } = body;

    // Validate display name length
    if (display_name && display_name.length > 50) {
      return NextResponse.json(
        { error: "Display name must be 50 characters or less" },
        { status: 400 }
      );
    }

    // Validate bio length
    if (bio && bio.length > 200) {
      return NextResponse.json(
        { error: "Bio must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: display_name?.trim() || null,
        bio: bio?.trim() || null,
        location: location?.trim() || null,
        phone: phone?.trim() || null,
        avatar_url: avatar_url || null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
