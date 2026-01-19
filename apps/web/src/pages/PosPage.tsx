import { Search, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { useRxCollection, useRxQuery } from 'rxdb-hooks'
import { v4 as uuidv4 } from 'uuid'
import type { Product, Order } from '../db/database'
import { useScanner } from '../services/ScannerService'

const CATEGORIES = ['All', 'Coffee', 'Tea', 'Pastries', 'Sandwiches']

export function PosPage() {
    const [activeCategory, setActiveCategory] = useState('All')
    const [cart, setCart] = useState<(Product & { quantity: number })[]>([])

    const productCollection = useRxCollection<Product>('products')
    const orderCollection = useRxCollection<Order>('orders')

    const { result: products = [] } = useRxQuery(
        (productCollection ? productCollection.find().sort({ name: 'asc' }) : null) as any
    ) as { result: Product[] }

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    // Barcode Scanner Integration
    useScanner((barcode) => {
        console.log('Scanned:', barcode);
        const product = products.find(p => p.id === barcode || p.name.toLowerCase() === barcode.toLowerCase());
        if (product) {
            addToCart(product);
        } else {
            console.warn(`Product not found: ${barcode}`);
        }
    });

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) }
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const handleCheckout = async () => {
        if (!orderCollection) return

        if (cart.length === 0) return

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newOrder: Order = {
            id: uuidv4(),
            items: cart.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total: total,
            status: 'pending',
            timestamp: Date.now()
        }

        try {
            await orderCollection.insert(newOrder)
            setCart([])
            console.log('Order created:', newOrder)
        } catch (err) {
            console.error('Failed to create order:', err)
            alert('Failed to process order.')
        }
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const filteredProducts = activeCategory === 'All'
        ? products
        : products.filter(p => p.category === activeCategory)

    return (
        <div className="flex h-full w-full">
            {/* Product Section */}
            <div className="flex-1 flex flex-col h-full bg-background p-4">
                {/* Header/Search */}
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            placeholder="Search products..."
                            className="w-full pl-8 h-10 rounded-md border bg-muted/50 focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString()}
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-20">
                    {filteredProducts.map(product => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="flex flex-col p-4 rounded-xl border bg-card hover:shadow-lg transition-all active:scale-95 group text-left"
                        >
                            <div className={`h-24 w-full rounded-lg mb-3 ${product.color || 'bg-secondary'} group-hover:opacity-90`} />
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-primary font-bold mt-1">${product.price.toFixed(2)}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart Section */}
            <div className="w-[400px] bg-card border-l flex flex-col h-full shadow-xl z-20">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center">
                        <ShoppingCart className="mr-2 h-5 w-5" /> Current Order
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <div className="bg-muted rounded-full p-4">
                                <ShoppingCart className="h-8 w-8 opacity-50" />
                            </div>
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-muted-foreground">${item.price.toFixed(2)}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="h-8 w-8 flex items-center justify-center rounded-full bg-background border hover:bg-muted"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-4 text-center font-medium">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-muted/20 border-t space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (8%)</span>
                        <span>${(total * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>${(total * 1.08).toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="w-full bg-primary text-primary-foreground h-14 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={cart.length === 0}
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    )
}
