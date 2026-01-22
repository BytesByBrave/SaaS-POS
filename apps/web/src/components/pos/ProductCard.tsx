import { Plus, Sparkles } from 'lucide-react';
import type { Product } from '../../db/database';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(true);
        onAddToCart(product);
        setTimeout(() => setIsClicked(false), 300);
    };

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                product-card relative flex flex-col p-5 rounded-[2rem] 
                glass-strong border border-white/10
                hover:border-primary/40 hover:shadow-2xl 
                transition-all duration-500 
                active:scale-[0.97] group text-left 
                overflow-hidden h-full min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] w-full
                ${isClicked ? 'scale-95' : ''}
            `}
        >
            {/* Ambient glow effect */}
            <div className={`
                absolute -top-20 -right-20 w-40 h-40 rounded-full 
                bg-primary/20 blur-3xl transition-all duration-700
                ${isHovered ? 'opacity-100 scale-150' : 'opacity-0 scale-100'}
            `} />

            {/* Shimmer overlay */}
            <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 
                transition-opacity duration-500 pointer-events-none
                shimmer
            `} />

            {/* Product Image Container */}
            <div className="relative h-48 w-full rounded-2xl mb-5 overflow-hidden flex-shrink-0 group/image">
                {/* 3D depth shadow */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10 pointer-events-none" />

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
                                    fallback.className = 'fallback-char text-6xl font-black text-white/10 select-none';
                                    fallback.innerText = product.name.charAt(0);
                                    parent.appendChild(fallback);
                                }
                            }
                        }}
                    />
                ) : (
                    <div className={`
                        h-full w-full ${product.color || 'bg-gradient-to-br from-primary/30 to-primary/10'} 
                        flex items-center justify-center 
                        transform group-hover:scale-110 transition-transform duration-700 ease-out
                    `}>
                        <div className="text-6xl font-black text-white/15 select-none">{product.name.charAt(0)}</div>
                    </div>
                )}

                {/* Hover overlay with 3D animated plus icon */}
                <div className={`
                    absolute inset-0 z-20
                    bg-gradient-to-t from-primary/40 via-primary/20 to-transparent
                    flex items-center justify-center 
                    opacity-0 group-hover:opacity-100 
                    transition-all duration-500 
                `}>
                    <div className={`
                        h-16 w-16 rounded-full 
                        bg-white/90 dark:bg-white/20
                        backdrop-blur-xl
                        flex items-center justify-center
                        transform translate-y-8 group-hover:translate-y-0
                        opacity-0 group-hover:opacity-100
                        transition-all duration-500 delay-100
                        shadow-2xl shadow-primary/50
                    `}>
                        <Plus className="h-8 w-8 text-primary icon-3d" />
                    </div>
                </div>

                {/* Sparkle effect on hover */}
                <Sparkles className={`
                    absolute top-3 right-3 h-5 w-5 text-yellow-400 z-20
                    transform transition-all duration-500
                    ${isHovered ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-45'}
                `} />
            </div>

            {/* Product Info */}
            <div className="px-1 flex-1 flex flex-col justify-between w-full overflow-hidden relative z-10">
                <div className="space-y-2">
                    {/* Category badge with 3D effect */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-black">
                            {product.category}
                        </span>
                    </div>

                    {/* Product name with hover effect */}
                    <h3 className={`
                        font-bold text-foreground text-lg leading-tight 
                        break-words whitespace-normal line-clamp-2
                        transition-colors duration-300
                        group-hover:text-primary
                    `}>
                        {product.name}
                    </h3>
                </div>

                {/* Price and Add Button */}
                <div className="flex items-end justify-between mt-5 gap-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            Price
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xs text-muted-foreground font-medium">$</span>
                            <span className="text-3xl font-black text-primary tracking-tight">
                                {Math.floor(product.price ?? 0)}
                            </span>
                            <span className="text-lg font-bold text-primary/70">
                                .{((product.price ?? 0) % 1).toFixed(2).slice(2)}
                            </span>
                        </div>
                    </div>

                    {/* 3D Add to Cart Button */}
                    <div className={`
                        relative h-14 w-14 flex items-center justify-center 
                        rounded-2xl overflow-hidden
                        transform transition-all duration-500
                        group-hover:scale-110 group-hover:rotate-3
                        ${isClicked ? 'scale-90' : ''}
                    `}>
                        {/* Button background with gradient */}
                        <div className={`
                            absolute inset-0 
                            bg-gradient-to-br from-primary via-primary to-primary/80
                            transition-all duration-500
                            group-hover:from-primary group-hover:via-purple-500 group-hover:to-indigo-600
                        `} />

                        {/* 3D effect layers */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />

                        {/* Shine effect */}
                        <div className={`
                            absolute top-0 left-0 right-0 h-1/2 
                            bg-gradient-to-b from-white/30 to-transparent
                            rounded-t-2xl
                        `} />

                        {/* Icon */}
                        <Plus className={`
                            h-6 w-6 text-white relative z-10
                            transform transition-transform duration-500
                            group-hover:rotate-180
                        `} />

                        {/* Shadow for 3D depth */}
                        <div className="absolute -bottom-1 inset-x-1 h-3 bg-primary/30 blur-md rounded-full" />
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card/50 to-transparent pointer-events-none" />
        </button>
    );
}
