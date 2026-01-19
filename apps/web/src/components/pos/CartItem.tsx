import { Minus, Plus } from 'lucide-react';

interface CartItemProps {
    item: {
        id: string;
        name: string;
        price: number;
        quantity: number;
    };
    onUpdateQuantity: (id: string, delta: number) => void;
}

export function CartItem({ item, onUpdateQuantity }: CartItemProps) {
    return (
        <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
            <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">${(item.price ?? 0).toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-background border hover:bg-muted"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <span className="w-4 text-center font-medium">{item.quantity}</span>
                <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
