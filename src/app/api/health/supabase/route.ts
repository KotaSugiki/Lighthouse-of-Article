import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("papers").select("id").limit(1);

    if (error) {
      console.error("Supabase health check failed:", error.message);
      return NextResponse.json(
        { ok: false, error: "Supabase connection failed" },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Supabase health check configuration failed:", error);
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured" },
      { status: 503 },
    );
  }
}
