import { useState, useCallback } from 'react';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration?: number;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const duration = toast.duration ?? 5000;

        const newToast: Toast = {
            ...toast,
            id,
            duration,
        };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = useCallback(
        (title: string, description?: string) => {
            addToast({ type: 'success', title, description });
        },
        [addToast]
    );

    const error = useCallback(
        (title: string, description?: string) => {
            addToast({ type: 'error', title, description });
        },
        [addToast]
    );

    const warning = useCallback(
        (title: string, description?: string) => {
            addToast({ type: 'warning', title, description });
        },
        [addToast]
    );

    const info = useCallback(
        (title: string, description?: string) => {
            addToast({ type: 'info', title, description });
        },
        [addToast]
    );

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
    };
}
