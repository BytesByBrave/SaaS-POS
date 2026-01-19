interface CategoryListProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export function CategoryList({ categories, activeCategory, onCategoryChange }: CategoryListProps) {
    return (
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeCategory === cat
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                        : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground border shadow-sm'
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
