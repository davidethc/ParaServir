/**
 * Comprehensive type definitions for the Chat module
 */

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'file';
export type ConversationStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';
export type ConversationFilter = 'all' | 'active' | 'archived';

/**
 * User presence state
 */
export interface UserPresence {
    userId: string;
    isOnline: boolean;
    lastSeen?: Date;
    isTyping?: boolean;
}

/**
 * Message with grouped metadata
 */
export interface GroupedMessage {
    id: string;
    content: string;
    timestamp: Date;
    isOwn: boolean;
    status?: MessageStatus;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
    showAvatar: boolean;
}

/**
 * Date divider for message list
 */
export interface DateDivider {
    type: 'divider';
    date: Date;
    label: string;
}

/**
 * Chat scroll state
 */
export interface ScrollState {
    isAtBottom: boolean;
    hasNewMessages: boolean;
    newMessageCount: number;
}

/**
 * Typing indicator state
 */
export interface TypingState {
    isTyping: boolean;
    userName?: string;
}

/**
 * Service request status colors
 */
export const SERVICE_STATUS_COLORS: Record<ConversationStatus, string> = {
    pending: '#F59E0B',
    accepted: '#10B981',
    completed: '#6B7280',
    cancelled: '#EF4444',
};

/**
 * Service request status labels
 */
export const SERVICE_STATUS_LABELS: Record<ConversationStatus, string> = {
    pending: 'Pendiente',
    accepted: 'Aceptado',
    completed: 'Completado',
    cancelled: 'Cancelado',
};
