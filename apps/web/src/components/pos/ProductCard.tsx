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
            className="flex flex-col p-4 rounded-[2rem] border border-white/5 bg-card/40 backdrop-blur-md hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 active:scale-[0.98] group text-left relative overflow-hidden h-full min-h-[380px] w-full"
        >
            <div className="relative h-44 w-full rounded-2xl mb-4 overflow-hidden bg-secondary/20 flex-shrink-0">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                                parent.classList.add('flex', 'items-center', 'justify-center');
                                if (!parent.querySelector('.fallback-char')) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'fallback-char text-5xl font-black text-white/10 select-none';
                                    fallback.innerText = product.name.charAt(0);
                                    parent.appendChild(fallback);
                                }
                            }
                        }}
                    />
                ) : (
                    <div className={`h-full w-full ${product.color || 'bg-secondary'} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700 ease-out`}>
                        <div className="text-5xl font-black text-white/10 select-none">{product.name.charAt(0)}</div>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center pointer-events-none">
                    <Plus className="h-12 w-12 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
            </div>

            <div className="px-1 flex-1 flex flex-col justify-between w-full overflow-hidden">
                <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-black">
                        {product.category}
                    </div>
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors text-base leading-tight break-words whitespace-normal line-clamp-2">
                        {product.name}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-medium">Price</span>
                        <div className="text-primary font-black text-2xl tracking-tight">${(product.price ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transform group-hover:rotate-90 transition-all duration-500 shadow-lg shadow-primary/5">
                        <Plus className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </button>
    );
}
