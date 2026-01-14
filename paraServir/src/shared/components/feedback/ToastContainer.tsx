import { Toast } from './Toast';
import type { Toast as ToastType } from '@/shared/hooks/useToast';

interface ToastContainerProps {
    toasts: ToastType[];
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-9999 flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </div>
        </div>
    );
}
