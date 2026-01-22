import { Minus, Plus } from 'lucide-react';

interface CartItemProps {
    item: {
        id: string;
        name: string;
        price: number;
        quantity: number;
        image?: string;
        color?: string;
    };
    onUpdateQuantity: (id: string, delta: number) => void;
}

export function CartItem({ item, onUpdateQuantity }: CartItemProps) {
    return (
        <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm p-3 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors group">
            <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className={`h-full w-full ${item.color || 'bg-secondary'} flex items-center justify-center`}>
                        <span className="text-sm font-bold opacity-30">{item.name.charAt(0)}</span>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground line-clamp-1">{item.name}</div>
                <div className="text-sm font-medium text-primary">${(item.price ?? 0).toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-xl">
                <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-background border border-border/50 hover:bg-muted hover:border-primary/30 transition-all active:scale-90"
                >
                    <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm font-black">{item.quantity}</span>
                <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-90 shadow-lg shadow-primary/20"
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}
