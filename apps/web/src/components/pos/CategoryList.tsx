interface CategoryListProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export function CategoryList({ categories, activeCategory, onCategoryChange }: CategoryListProps) {
    return (
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => {
                const isActive = activeCategory === cat;
                return (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={`
                            px-6 py-4 rounded-2xl text-sm font-black transition-all duration-300 whitespace-nowrap relative flex-shrink-0 min-w-[100px] flex items-center justify-center
                            ${isActive
                                ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/30 scale-105 -translate-y-1 z-10'
                                : 'bg-card/80 backdrop-blur-2xl text-foreground/70 hover:bg-accent hover:text-foreground border border-white/5 hover:border-primary/50 hover:shadow-lg shadow-sm'
                            }
                        `}
                    >
                        {cat}
                    </button>
                );
            })}
        </div>
    );
}
