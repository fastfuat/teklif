export interface Category {
  id: number;
  name: string;
  image_url?: string;
  created_at: string;
}

export interface Brand {
  id: number;
  name: string;
  category_id: number;
  image_url?: string;
  created_at: string;
  categories?: Category;
}

export interface Model {
  id: number;
  name: string;
  brand_id: number;
  image_url?: string;
  created_at: string;
  brands?: Brand;
}

export interface Feature {
  id: number;
  name: string;
  model_id: number;
  options: string[];
  created_at: string;
}

export interface Quote {
  id: number;
  category_id: number;
  brand_id: number;
  model_id: number;
  selected_features: Record<string, string>;
  contact_number?: string;
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  created_at: string;
} 