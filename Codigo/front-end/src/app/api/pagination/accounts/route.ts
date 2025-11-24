import { NextRequest, NextResponse } from "next/server";

import { listAccountsPaginated } from "@/utils/services/accounts";
import { getSessionId } from "@/utils/server-cookies";

const defaultPagination = {
  page: 1,
  size: 10,
};

export async function GET(request: NextRequest) {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return NextResponse.json(
      {
        error: {
          status: 401,
          message: "Sessão inválida.",
          resource: "accounts/paginated",
        },
      },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const pageParam = Number(searchParams.get("page"));
  const sizeParam = Number(searchParams.get("size"));

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : defaultPagination.page;
  const size = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : defaultPagination.size;

  const response = await listAccountsPaginated(sessionId, { page, size });

  if ("error" in response) {
    const status = response.error.status || 500;
    return NextResponse.json({ error: response.error }, { status });
  }

  return NextResponse.json(response);
}
