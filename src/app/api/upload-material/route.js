import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from '../../../lib/admin-auth.mjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const headerToken = request.headers.get('x-admin-session');
    const cookie = request.headers.get('cookie') || '';
    const cookieToken = cookie.split(';').map(part => part.trim()).find(part => part.startsWith('admin_session='))?.split('=')[1];
    const effectiveToken = headerToken || cookieToken;

    if (!verifyAdminSession(effectiveToken)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title");
    const subject = formData.get("subject");
    const topic = formData.get("topic") || "";
    const topic_id = formData.get("topic_id") || topic.toLowerCase().replace(/\s+/g, "_");
    const material_type = formData.get("material_type") || "notes";
    const is_free = formData.get("is_free") === "true";
    const price = parseFloat(formData.get("price") || "0");

    if (!file || !title || !subject) {
      return Response.json({ error: "File, title, subject jaruri che" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const filePath = `${subject}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("study-materials")
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return Response.json({ error: "Upload failed: " + uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("study-materials")
      .getPublicUrl(filePath);

    // Save to DB
    const { data, error: dbError } = await supabase
      .from("study_materials")
      .insert({
        title,
        subject,
        topic,
        topic_id,
        material_type,
        file_url: urlData.publicUrl,
        file_type: file.type,
        is_free,
        price: is_free ? 0 : price,
      })
      .select()
      .single();

    if (dbError) {
      return Response.json({ error: "DB error: " + dbError.message }, { status: 500 });
    }

    return Response.json({ success: true, material: data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}