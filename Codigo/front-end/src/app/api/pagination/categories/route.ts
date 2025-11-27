import { NextRequest, NextResponse } from "next/server";

import { listCategoriesPaginated } from "@/utils/services/categories";
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
          resource: "categories/paginated",
        },
      },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const pageParam = Number(searchParams.get("page"));
  const sizeParam = Number(searchParams.get("size"));
  const nameParam = searchParams.get("name") ?? undefined;
  const semanticalSearch = searchParams.get("semantical_search") ?? undefined;

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : defaultPagination.page;
  const size = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : defaultPagination.size;

  const response = await listCategoriesPaginated(
    sessionId,
    { page, size },
    nameParam,
    semanticalSearch
  );

  if ("error" in (response as Record<string, unknown>)) {
    const errorResponse = response as { error: { status: number; message: string; resource: string } };
    const status = errorResponse.error?.status || 500;
    return NextResponse.json({ error: errorResponse.error }, { status });
  }

  return NextResponse.json(response);
}
