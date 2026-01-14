import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Toast as ToastType } from '@/shared/hooks/useToast';

interface ToastProps {
    toast: ToastType;
    onRemove: (id: string) => void;
}

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colorMap = {
    success: {
        border: '#10B981',
        icon: '#10B981',
        bg: '#D1FAE5',
    },
    error: {
        border: '#EF4444',
        icon: '#EF4444',
        bg: '#FEE2E2',
    },
    warning: {
        border: '#F59E0B',
        icon: '#F59E0B',
        bg: '#FEF3C7',
    },
    info: {
        border: '#58A3B0',
        icon: '#58A3B0',
        bg: '#E0F2F7',
    },
};

export function Toast({ toast, onRemove }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [, setIsPaused] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => {
            setIsVisible(true);
        });
    }, []);

    const handleRemove = () => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
    };

    const Icon = iconMap[toast.type];
    const colors = colorMap[toast.type];

    return (
        <div
            className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg bg-white
        transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        mb-3 min-w-[320px] max-w-md
      `}
            style={{
                borderLeft: `4px solid ${colors.border}`,
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="shrink-0">
                <Icon size={24} style={{ color: colors.icon }} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground mb-1">
                    {toast.title}
                </p>
                {toast.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {toast.description}
                    </p>
                )}
            </div>

            <button
                onClick={handleRemove}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            >
                <X size={16} />
            </button>
        </div>
    );
}
