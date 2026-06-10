export type Store = {
  id: string;
  name: string;
  whatsapp_number: string | null;
  niche: string | null;
  brand_tone: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  store_id: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export type Customer = {
  id: string;
  store_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  source_channel: string | null;
  style_profile: string | null;
  budget_range: string | null;
  notes: string | null;
  last_interaction_at: string | null;
  created_at: string;
};

export type Analysis = {
  id: string;
  store_id: string;
  customer_id: string;
  selfie_url: string | null;
  undertone: string | null;
  depth: string | null;
  contrast_level: string | null;
  season: string | null;
  best_colors: string[] | null;
  avoid_colors: string[] | null;
  metals: string[] | null;
  hair_suggestions: string[] | null;
  style_notes: string | null;
  confidence_score: number | null;
  created_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  sku: string | null;
  name: string;
  description: string | null;
  color_name: string | null;
  color_hex: string | null;
  dominant_season: string[] | null;
  undertone_match: string[] | null;
  style_tags: string[] | null;
  fabric: string | null;
  occasion_tags: string[] | null;
  price: number;
  stock: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

export type Campaign = {
  id: string;
  store_id: string;
  title: string;
  message_template: string;
  target_seasons: string[] | null;
  target_styles: string[] | null;
  status: string;
  launched_at: string | null;
  created_at: string;
};

export type Recommendation = {
  product_id: string;
  product_name: string;
  color_name: string | null;
  price: number;
  image_url: string | null;
  score: number;
};
