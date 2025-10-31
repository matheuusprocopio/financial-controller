export type CategorieType = {
  id: string;
  name: string;
  imagePath: string;
  userId: string;
  mainCategoryId?: string;
  createdAt: string;
};

export type CreateCategoryType = {
  name: string;
  imagePath: string;
  userId: string;
  mainCategoryId?: string;
};