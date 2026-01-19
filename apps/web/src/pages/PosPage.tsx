import { Search, Plus, Minus, ShoppingCart, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useRxCollection, useRxQuery } from 'rxdb-hooks'
import { v4 as uuidv4 } from 'uuid'
import type { Product, Order } from '../db/database'
import { useScanner } from '../services/ScannerService'
import { HardwareService } from '../services/HardwareService'

const CATEGORIES = ['All', 'Coffee', 'Tea', 'Pastries', 'Sandwiches']

export function PosPage() {
    const [activeCategory, setActiveCategory] = useState('All')
    const [cart, setCart] = useState<(Product & { quantity: number })[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    const productCollection = useRxCollection<Product>('products')
    const orderCollection = useRxCollection<Order>('orders')

    const { result: products = [] } = useRxQuery(
        (productCollection ? productCollection.find().sort({ name: 'asc' }) : null) as any
    ) as { result: Product[] }

    // Sync status from local storage or service
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    useState(() => {
        window.addEventListener('online', () => setIsOnline(true))
        window.addEventListener('offline', () => setIsOnline(false))
    })

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

    const [showSuccess, setShowSuccess] = useState(false)

    const handleCheckout = async () => {
        if (!orderCollection) return
        if (cart.length === 0) return

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const tax = subtotal * 0.08
        const total = subtotal + tax

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

            // Print Receipt
            await HardwareService.printReceipt({
                orderId: newOrder.id,
                items: newOrder.items,
                subtotal,
                tax,
                total,
                timestamp: newOrder.timestamp,
                paymentMethod: 'Cash' // For now default to Cash
            })

            setCart([])
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
            console.log('Order created:', newOrder)
        } catch (err) {
            console.error('Failed to create order:', err)
            alert('Failed to process order.')
        }
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="flex h-full w-full bg-background">
            {/* Product Section */}
            <div className="flex-1 flex flex-col h-full p-6 overflow-hidden">
                {/* Header/Search */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                placeholder="Search products or scan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 h-12 rounded-xl border bg-card/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            />
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                            {isOnline ? 'Connected' : 'Offline Mode'}
                        </div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground px-4 py-2 bg-card rounded-lg border shadow-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeCategory === cat
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                                : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground border shadow-sm'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto pb-20 pr-2 custom-scrollbar">
                    {filteredProducts.map(product => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="flex flex-col p-4 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98] group text-left relative overflow-hidden"
                        >
                            <div className={`h-32 w-full rounded-xl mb-4 ${product.color || 'bg-secondary'} group-hover:scale-105 transition-transform duration-500 flex items-center justify-center`}>
                                <Plus className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</div>
                            <div className="text-primary font-black text-lg mt-1">${product.price.toFixed(2)}</div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-lg">
                                    <Plus className="h-4 w-4" />
                                </div>
                            </div>
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

            {/* Success Overlay */}
            {showSuccess && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-card p-12 rounded-3xl border shadow-2xl flex flex-col items-center scale-in-center">
                        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="h-10 w-10 text-primary animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-black mb-2">Order Complete!</h2>
                        <p className="text-muted-foreground font-medium">Receipt has been sent to the printer.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
