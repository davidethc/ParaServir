import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/shared/lib/utils';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    debounceMs?: number;
}

export function SearchBar({
    value,
    onChange,
    placeholder = 'Buscar...',
    className,
    debounceMs = 300,
}: SearchBarProps) {
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (internalValue !== value) {
                onChange(internalValue);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [internalValue, onChange, debounceMs, value]);

    const handleClear = () => {
        setInternalValue('');
        onChange('');
    };

    return (
        <div className={cn('relative', className)}>
            <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
            />
            <Input
                type="text"
                value={internalValue}
                onChange={(e) => setInternalValue(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-10"
            />
            {internalValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
}
