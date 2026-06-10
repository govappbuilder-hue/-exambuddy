import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_current_affairs")
      .select("*")
      .eq("date", date)
      .single();

    if (error || !data) {
      return Response.json({ articles: [] });
    }

    return Response.json({ articles: data.articles || [] });
  } catch (error) {
    return Response.json({ articles: [] });
  }
}