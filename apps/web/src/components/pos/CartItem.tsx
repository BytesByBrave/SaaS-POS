import { Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemove = () => {
        setIsRemoving(true);
        setTimeout(() => {
            onUpdateQuantity(item.id, -item.quantity);
        }, 300);
    };

    return (
        <div className={`
            relative flex items-center gap-4 p-4 rounded-2xl 
            glass border border-white/10
            hover:border-primary/30 
            transition-all duration-500 group
            animate-fade-in-up
            ${isRemoving ? 'opacity-0 translate-x-10 scale-95' : 'opacity-100'}
        `}>
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Product Image with 3D effect */}
            <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-500">
                {/* 3D depth layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent z-10 pointer-events-none" />

                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className={`
                        h-full w-full ${item.color || 'bg-gradient-to-br from-primary/40 to-primary/20'} 
                        flex items-center justify-center
                    `}>
                        <span className="text-lg font-black text-white/30">{item.name.charAt(0)}</span>
                    </div>
                )}

                {/* Quantity badge with 3D effect */}
                <div className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center z-20">
                    <div className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/50" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
                    <span className="relative text-[10px] font-black text-white">{item.quantity}</span>
                </div>
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0 relative z-10">
                <div className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
                    {item.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-black text-primary">
                        ${(item.price ?? 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">each</span>
                </div>
                <div className="text-xs font-bold text-muted-foreground mt-0.5">
                    Total: <span className="text-foreground">${((item.price ?? 0) * item.quantity).toFixed(2)}</span>
                </div>
            </div>

            {/* Quantity Controls - Modern 3D Style */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl glass border border-white/10 relative z-10">
                <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="
                        relative h-8 w-8 flex items-center justify-center 
                        rounded-lg overflow-hidden
                        bg-gradient-to-br from-muted to-muted/50
                        hover:from-destructive/20 hover:to-destructive/10
                        border border-white/10
                        transition-all duration-300 
                        active:scale-90
                        group/btn
                    "
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                    <Minus className="h-3.5 w-3.5 relative z-10 text-muted-foreground group-hover/btn:text-destructive transition-colors" />
                </button>

                <span className="w-8 text-center text-sm font-black tabular-nums">
                    {item.quantity}
                </span>

                <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="
                        relative h-8 w-8 flex items-center justify-center 
                        rounded-lg overflow-hidden
                        bg-gradient-to-br from-primary to-primary/80
                        hover:from-primary hover:to-purple-600
                        transition-all duration-300 
                        active:scale-90
                        shadow-lg shadow-primary/30
                        group/btn
                    "
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                    <Plus className="h-3.5 w-3.5 relative z-10 text-white" />
                </button>
            </div>

            {/* Delete button - appears on hover */}
            <button
                onClick={handleRemove}
                className="
                    absolute -right-2 -top-2 
                    h-7 w-7 flex items-center justify-center
                    rounded-full
                    bg-destructive text-white
                    opacity-0 group-hover:opacity-100
                    transform scale-75 group-hover:scale-100
                    transition-all duration-300
                    shadow-lg shadow-destructive/30
                    hover:shadow-xl hover:shadow-destructive/40
                    active:scale-90
                    z-20
                "
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
