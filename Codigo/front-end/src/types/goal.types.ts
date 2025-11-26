export type GoalType = {
  id: string;
  userId: string;
  accountId: string | null;
  title: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  achieved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateGoalType = {
  title: string;
  description?: string;
  accountId?: string | null;
  targetAmount: number;
  deadline?: string | null;
};

export type UpdateGoalType = {
  title?: string;
  description?: string;
  accountId?: string | null;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string | null;
  achieved?: boolean;
};
