export interface NotificationDto {
  id: string;
  user_id: string;
  type: 'message' | 'request_accepted' | 'request_completed' | 'request_in_progress' | 'review_received' | 'verification_status';
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  status: string;
  notifications: NotificationDto[];
  unread_count: number;
}
