import { useState, useEffect } from 'react';

interface CategoryListProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

// 3D-style icons for categories
const categoryIcons: Record<string, string> = {
    'All': '🌟',
    'Coffee': '☕',
    'Tea': '🍵',
    'Pastries': '🥐',
    'Sandwiches': '🥪',
    'Juices': '🧃',
    'Desserts': '🍰',
    'Appointments': '📅',
    'Services': '✨',
    'Retail': '🛍️',
};

export function CategoryList({ categories, activeCategory, onCategoryChange }: CategoryListProps) {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative mb-8">
            {/* Subtle glow behind active category */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar relative">
                {categories.map((cat, index) => {
                    const isActive = activeCategory === cat;
                    const isHovered = hoveredCategory === cat;
                    const icon = categoryIcons[cat] || '📦';

                    return (
                        <button
                            key={cat}
                            onClick={() => onCategoryChange(cat)}
                            onMouseEnter={() => setHoveredCategory(cat)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            style={{
                                animationDelay: mounted ? `${index * 0.05}s` : '0s'
                            }}
                            className={`
                                category-chip relative
                                px-6 py-4 rounded-2xl 
                                text-sm font-black 
                                transition-all duration-400 
                                whitespace-nowrap 
                                flex-shrink-0 min-w-[120px] 
                                flex items-center justify-center gap-3
                                animate-fade-in-up
                                ${isActive
                                    ? `
                                        bg-gradient-to-br from-primary via-primary to-purple-600
                                        text-white 
                                        shadow-xl shadow-primary/40 
                                        scale-105 -translate-y-1 z-10
                                        border-none
                                    `
                                    : `
                                        glass border border-white/10
                                        text-foreground/80 
                                        hover:text-foreground 
                                        hover:border-primary/40 
                                        hover:shadow-lg hover:shadow-primary/10
                                        hover:-translate-y-0.5
                                    `
                                }
                            `}
                        >
                            {/* 3D Icon effect */}
                            <span className={`
                                text-xl transform transition-all duration-300
                                ${isActive || isHovered ? 'scale-125 rotate-12' : 'scale-100 rotate-0'}
                            `}>
                                {icon}
                            </span>

                            {/* Category name */}
                            <span className="relative z-10">{cat}</span>

                            {/* Active indicator dot */}
                            {isActive && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white shadow-lg shadow-white/50" />
                                    <div className="absolute h-3 w-3 rounded-full bg-white/30 animate-ping" />
                                </div>
                            )}

                            {/* Shine effect on active */}
                            {isActive && (
                                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                                </div>
                            )}

                            {/* Glow effect behind active button */}
                            {isActive && (
                                <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/30 blur-xl scale-150 opacity-50" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Scroll fade indicators */}
            <div className="absolute left-0 top-0 bottom-3 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </div>
    );
}
