import { NextRequest, NextResponse } from "next/server";

import { listItems } from "@/utils/services/items";
import { getSessionId } from "@/utils/server-cookies";

export async function GET(request: NextRequest) {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return NextResponse.json(
      {
        error: {
          status: 401,
          message: "Sessão inválida.",
          resource: "items",
        },
      },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const accountId = searchParams.get("accountId") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  const typeParam = searchParams.get("type");
  const type = typeParam === "income" || typeParam === "expense" ? typeParam : undefined;

  const pageParam = Number(searchParams.get("page"));
  const pageLimitParam = Number(searchParams.get("pageLimit"));

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : undefined;
  const pageLimit = Number.isFinite(pageLimitParam) && pageLimitParam > 0 ? pageLimitParam : undefined;

  const response = await listItems(sessionId, {
    name,
    categoryId,
    accountId,
    type,
    startDate,
    endDate,
    page,
    pageLimit,
  });

  if ("error" in response) {
    const status = response.error.status || 500;
    return NextResponse.json({ error: response.error }, { status });
  }

  return NextResponse.json(response);
}
