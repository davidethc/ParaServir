export interface WorkerServiceDto {
  id: string;
  title: string;
  description: string;
  base_price: string | number;
  is_available: boolean;
  category_id: string;
  category_name: string;
  category_icon?: string | null;
  created_at?: string;
  updated_at?: string;
}
