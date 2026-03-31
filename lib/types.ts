export type Stage = "Prospect" | "Contacted" | "Qualified" | "In Deal" | "Closed";

export const STAGES: Stage[] = [
  "Prospect",
  "Contacted",
  "Qualified",
  "In Deal",
  "Closed",
];

export interface Developer {
  id: number;
  name: string;
  state: string | null;
  city: string | null;
  deals_in_market: number | null;
  total_deals_nationwide: number | null;
  total_volume_market: number | null;
  avg_sale_price_market: number | null;
  is_corp_llc: boolean;
  sample_addresses: string | null;
  stage: Stage;
  created_at: string;
  updated_at: string;
}

export interface DeveloperNote {
  id: number;
  developer_id: number;
  content: string;
  created_at: string;
}

export interface DeveloperFilters {
  search?: string;
  state?: string;
  stage?: string;
  min_deals?: number;
  min_volume?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
