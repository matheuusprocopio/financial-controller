import { CreateGoalType, GoalType, UpdateGoalType } from "@/types/goal.types";
import newRequestProvider, { RequestError } from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_API_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

const withSession = (sessionId: string | undefined) =>
  sessionId ? { headers: { "X-Session-Id": sessionId } } : {};

export const listGoals = async (
  sessionId: string,
  semanticalSearch?: string
): Promise<GoalType[] | RequestError> => {
  const params = new URLSearchParams();

  if (semanticalSearch) {
    params.append("semantical_search", semanticalSearch);
  }

  const query = params.toString();

  return provider.get<GoalType[]>(`goals${query ? `?${query}` : ""}`, {
    ...withSession(sessionId),
  });
};

export const getGoalById = async (
  goalId: string,
  sessionId: string
): Promise<GoalType | RequestError> => {
  return provider.get<GoalType>(`goals/${goalId}`, {
    ...withSession(sessionId),
  });
};

export const createGoal = async (
  sessionId: string,
  payload: CreateGoalType
): Promise<GoalType | RequestError> => {
  return provider.post<GoalType, CreateGoalType>("goals", {
    body: payload,
    headers: {
      "X-Session-Id": sessionId,
    },
  });
};

export const updateGoal = async (
  goalId: string,
  sessionId: string,
  payload: UpdateGoalType
): Promise<GoalType | RequestError> => {
  return provider.put<GoalType, UpdateGoalType>(`goals/${goalId}`, {
    body: payload,
    headers: {
      "X-Session-Id": sessionId,
    },
  });
};

export const deleteGoal = async (
  goalId: string,
  sessionId: string
): Promise<RequestError | Record<string, never>> => {
  return provider.delete(`goals/${goalId}`, {
    headers: {
      "X-Session-Id": sessionId,
    },
  });
};
