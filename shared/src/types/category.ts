export interface Category {
  id: string;
  mapId: string;
  name: string;
  color: string;
  icon: string | null;
}

export interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
  icon?: string;
}
