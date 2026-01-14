export interface ServiceRequestDto {
  id: string;
  category_id: string;
  category_name?: string;
  description: string;
  address: string;
  scheduled_date: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  worker_id?: string;
  worker_name?: string;
  service_id?: string;
  service_title?: string;
  created_at?: string;
  updated_at?: string;
}
