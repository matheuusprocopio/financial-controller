import { NextRequest, NextResponse } from "next/server";

import { listGoals } from "@/utils/services/goals";
import { getSessionId } from "@/utils/server-cookies";
import type { GoalType } from "@/types/goal.types";
import type { RequestError } from "@/utils/requestProvider";

const defaultPagination = {
  page: 1,
  size: 10,
};

const normalizeNumber = (value: number | null, fallback: number) => {
  if (!Number.isFinite(value) || value === null || value <= 0) {
    return fallback;
  }

  return value;
};

const filterGoals = (
  goals: GoalType[],
  filters: {
    title?: string | null;
    status?: string | null;
    accountId?: string | null;
  },
  options?: { skipTitleFilter?: boolean }
) => {
  let filtered = [...goals];

  if (!options?.skipTitleFilter && filters.title && filters.title.trim()) {
    const titleFilter = filters.title.toLowerCase().trim();
    filtered = filtered.filter((goal) =>
      goal.title.toLowerCase().includes(titleFilter)
    );
  }

  if (filters.status === "achieved") {
    filtered = filtered.filter((goal) => goal.achieved);
  } else if (filters.status === "pending") {
    filtered = filtered.filter((goal) => !goal.achieved);
  }

  if (filters.accountId && filters.accountId.trim()) {
    if (filters.accountId === "global") {
      filtered = filtered.filter((goal) => !goal.accountId);
    } else {
      filtered = filtered.filter(
        (goal) => goal.accountId === filters.accountId
      );
    }
  }

  return filtered;
};

export async function GET(request: NextRequest) {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return NextResponse.json(
      {
        error: {
          status: 401,
          message: "Sessão inválida.",
          resource: "goals",
        },
      },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const pageParam = Number(searchParams.get("page"));
  const sizeParam = Number(searchParams.get("size"));
  const title = searchParams.get("title");
  const semanticalSearch = searchParams.get("semantical_search") ?? undefined;
  const status = searchParams.get("status");
  const accountId = searchParams.get("accountId");

  const page = normalizeNumber(pageParam, defaultPagination.page);
  const size = normalizeNumber(sizeParam, defaultPagination.size);

  const searchTerm = semanticalSearch ?? title ?? undefined;
  const response = await listGoals(sessionId, searchTerm);

  if (isRequestError(response)) {
    const statusCode = response.error.status || 500;
    return NextResponse.json({ error: response.error }, { status: statusCode });
  }

  const filteredGoals = filterGoals(
    response,
    { title, status, accountId },
    { skipTitleFilter: !!semanticalSearch }
  );
  const totalItems = filteredGoals.length;
  const start = (page - 1) * size;
  const data = filteredGoals.slice(start, start + size);

  return NextResponse.json({
    data,
    totalItems,
    currentPage: page,
    pageLimit: size,
  });
}

const isRequestError = (resp: unknown): resp is RequestError => {
  return !!resp && typeof resp === "object" && "error" in (resp as Record<string, unknown>);
};
