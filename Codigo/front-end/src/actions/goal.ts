"use server";

import { CreateGoalType, UpdateGoalType } from "@/types/goal.types";
import { RequestError } from "@/utils/requestProvider";
import { getSessionId } from "@/utils/server-cookies";
import { createGoal, deleteGoal, updateGoal } from "@/utils/services/goals";

export const createGoalAction = async (
  payload: CreateGoalType
): Promise<RequestError | any> => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return {
      error: {
        message: "Invalid session",
      },
    } as RequestError;
  }

  const resp = await createGoal(sessionId, payload);
  return resp;
};

export const updateGoalAction = async (
  goalId: string,
  payload: UpdateGoalType
): Promise<RequestError | any> => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return {
      error: {
        message: "Invalid session",
      },
    } as RequestError;
  }

  const resp = await updateGoal(goalId, sessionId, payload);
  return resp;
};

export const deleteGoalAction = async (
  goalId: string
): Promise<RequestError | any> => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return {
      error: {
        message: "Invalid session",
      },
    } as RequestError;
  }

  const resp = await deleteGoal(goalId, sessionId);
  return resp;
};
