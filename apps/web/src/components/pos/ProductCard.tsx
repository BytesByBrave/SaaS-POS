import { Plus } from 'lucide-react';
import type { Product } from '../../db/database';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    return (
        <button
            onClick={() => onAddToCart(product)}
            className="flex flex-col p-4 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98] group text-left relative overflow-hidden"
        >
            <div className={`h-32 w-full rounded-xl mb-4 ${product.color || 'bg-secondary'} group-hover:scale-105 transition-transform duration-500 flex items-center justify-center`}>
                <Plus className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</div>
            <div className="text-primary font-black text-lg mt-1">${(product.price ?? 0).toFixed(2)}</div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-lg">
                    <Plus className="h-4 w-4" />
                </div>
            </div>
        </button>
    );
}
