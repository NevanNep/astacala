import { NextRequest, NextResponse } from "next/server";
import { authorizeUser, jsonError } from "@/src/lib/admin-auth";

type NotificationRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

function parseLimit(request: NextRequest, fallback?: number) {
  const value = request.nextUrl.searchParams.get("limit");
  if (!value) return fallback;

  const limit = Number(value);
  if (!Number.isInteger(limit) || limit <= 0) return fallback;

  return Math.min(limit, 100);
}

async function getRouteId(context: NotificationRouteContext) {
  const params = await context.params;
  return String(params.id ?? "").trim();
}

export async function GET_NOTIFICATIONS(request: NextRequest) {
  try {
    const auth = await authorizeUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    let query = auth.adminClient
      .from("notifikasi")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (request.nextUrl.searchParams.get("unread") === "true") {
      query = query.eq("dibaca", false);
    }

    const limit = parseLimit(request);
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ notifications: data ?? [] });
  } catch (error) {
    console.error("List notifications error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH_NOTIFICATION_READ(
  request: NextRequest,
  context: NotificationRouteContext
) {
  try {
    const auth = await authorizeUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    const id = await getRouteId(context);
    if (!id) {
      return jsonError("Notifikasi id wajib diisi", 400, "id");
    }

    const { data, error } = await auth.adminClient
      .from("notifikasi")
      .update({ dibaca: true })
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("*")
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 500);
    }

    if (!data) {
      return jsonError("Notifikasi tidak ditemukan", 404);
    }

    return NextResponse.json({ notification: data });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH_NOTIFICATIONS_READ_ALL(request: NextRequest) {
  try {
    const auth = await authorizeUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { data, error } = await auth.adminClient
      .from("notifikasi")
      .update({ dibaca: true })
      .eq("user_id", auth.user.id)
      .eq("dibaca", false)
      .select("id");

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ updated: data?.length ?? 0 });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE_NOTIFICATION(
  request: NextRequest,
  context: NotificationRouteContext
) {
  try {
    const auth = await authorizeUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    const id = await getRouteId(context);
    if (!id) {
      return jsonError("Notifikasi id wajib diisi", 400, "id");
    }

    const { data, error } = await auth.adminClient
      .from("notifikasi")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 500);
    }

    if (!data) {
      return jsonError("Notifikasi tidak ditemukan", 404);
    }

    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error("Delete notification error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE_NOTIFICATIONS(request: NextRequest) {
  try {
    const auth = await authorizeUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    let query = auth.adminClient
      .from("notifikasi")
      .delete()
      .eq("user_id", auth.user.id);

    if (request.nextUrl.searchParams.get("read") === "true") {
      query = query.eq("dibaca", true);
    }

    const { data, error } = await query.select("id");

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ deleted: data?.length ?? 0 });
  } catch (error) {
    console.error("Delete notifications error:", error);
    return jsonError("Internal server error", 500);
  }
}
