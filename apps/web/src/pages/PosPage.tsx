import { Search, ShoppingCart, CheckCircle2, Plus } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useRxCollection, useRxQuery } from 'rxdb-hooks'
import { v4 as uuidv4 } from 'uuid'
import type { Product, Order } from '../db/database'
import { useScanner } from '../services/ScannerService'
import { HardwareService } from '../services/HardwareService'
import { ProductCard } from '../components/pos/ProductCard'
import { CartItem } from '../components/pos/CartItem'
import { CategoryList } from '../components/pos/CategoryList'
import { PaymentModal } from '../components/pos/PaymentModal'

interface UserFeatures {
    restaurant?: boolean;
    service?: boolean;
    retail?: boolean;
}

interface User {
    features: UserFeatures;
    organizationId: string;
}

const getCategoriesForFeatures = (features: UserFeatures) => {
    const base = ['All'];
    if (features?.restaurant) return [...base, 'Coffee', 'Tea', 'Pastries', 'Sandwiches', 'Juices', 'Desserts'];
    if (features?.service) return [...base, 'Appointments', 'Services', 'Retail'];
    return [...base, 'Coffee', 'Tea', 'Pastries', 'Sandwiches', 'Juices', 'Desserts'];
}

export function PosPage() {
    const user: User = JSON.parse(localStorage.getItem('user') || '{"features": {}, "organizationId": ""}');
    const features = user.features;
    const CATEGORIES = getCategoriesForFeatures(features);

    const [activeCategory, setActiveCategory] = useState('All')
    const [cart, setCart] = useState<(Product & { quantity: number })[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
    const [showDrafts, setShowDrafts] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'Cash' | 'Card'>('Cash')
    const [showSuccess, setShowSuccess] = useState(false)

    const productCollection = useRxCollection<Product>('products')
    const orderCollection = useRxCollection<Order>('orders')

    const { result: products = [] } = useRxQuery(
        (productCollection ? productCollection.find().sort({ name: 'asc' }) : null) as any
    ) as { result: Product[] }

    const { result: draftOrders = [] } = useRxQuery(
        (orderCollection ? orderCollection.find({
            selector: { status: 'draft' },
            sort: [{ timestamp: 'desc' }]
        }) : null) as any
    ) as { result: Order[] }

    // Sync status from local storage or service
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    useState(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    })

    const addToCart = (product: Product) => {
        // Ensure we get a plain object if it's an RxDocument
        const productData: Product = typeof (product as any).toJSON === 'function' ? (product as any).toJSON() : {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            color: product.color,
            image: product.image
        };

        setCart(prev => {
            const existing = prev.find(item => item.id === productData.id)
            if (existing) {
                return prev.map(item =>
                    item.id === productData.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { ...productData, quantity: 1 }]
        })
    }

    // Barcode Scanner Integration
    useScanner((barcode) => {
        const product = products.find(p => p.id === barcode || p.name.toLowerCase() === barcode.toLowerCase());
        if (product) {
            addToCart(product);
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

    const saveDraft = async () => {
        if (!orderCollection || cart.length === 0) return

        const subtotal = cart.reduce((sum, item) => sum + ((item.price ?? 0) * item.quantity), 0)
        const total = subtotal * 1.08

        const orderData: Order = {
            id: activeOrderId || uuidv4(),
            items: cart.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total: total,
            status: 'draft',
            timestamp: Date.now()
        }

        try {
            if (activeOrderId) {
                const doc = await orderCollection.findOne(activeOrderId).exec()
                if (doc) {
                    await doc.patch(orderData)
                } else {
                    await orderCollection.insert(orderData)
                }
            } else {
                await orderCollection.insert(orderData)
            }
            setCart([])
            setActiveOrderId(null)
        } catch (err) {
            console.error('Failed to save draft:', err)
        }
    }

    const resumeOrder = (order: Order) => {
        const orderItems = order.items.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            category: 'All',
            quantity: item.quantity
        }))
        setCart(orderItems as any)
        setActiveOrderId(order.id)
        setShowDrafts(false)
    }

    const deleteDraft = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!orderCollection) return
        const doc = await orderCollection.findOne(id).exec()
        if (doc) {
            await doc.remove()
        }
    }

    const handleCheckout = async () => {
        if (!orderCollection || cart.length === 0) return

        const subtotal = cart.reduce((sum, item) => sum + ((item.price ?? 0) * item.quantity), 0)
        const tax = subtotal * 0.08
        const total = subtotal + tax

        const newOrder: Order = {
            id: activeOrderId || uuidv4(),
            items: cart.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total: total,
            status: 'pending',
            timestamp: Date.now(),
            paymentMethod: selectedPaymentMethod
        }

        try {
            if (activeOrderId) {
                const doc = await orderCollection.findOne(activeOrderId).exec()
                if (doc) {
                    await doc.patch(newOrder)
                } else {
                    await orderCollection.insert(newOrder)
                }
            } else {
                await orderCollection.insert(newOrder)
            }

            await HardwareService.printReceipt({
                orderId: newOrder.id,
                items: newOrder.items,
                subtotal,
                tax,
                total,
                timestamp: newOrder.timestamp,
                paymentMethod: selectedPaymentMethod
            })

            setCart([])
            setActiveOrderId(null)
            setShowPaymentModal(false)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        } catch (err) {
            console.error('Failed to create order:', err)
            alert('Failed to process order.')
        }
    }

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + ((item.price ?? 0) * item.quantity), 0), [cart])

    const filteredProducts = useMemo(() => products.filter(p => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    }), [products, activeCategory, searchQuery])

    return (
        <div className="flex h-full w-full bg-background">
            <div className="flex-1 flex flex-col h-full p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                placeholder="Search products or scan barcode..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 h-14 rounded-2xl border border-white/5 bg-card/50 backdrop-blur-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium text-lg"
                            />
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                            {isOnline ? 'Connected' : 'Offline Mode'}
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => setShowDrafts(!showDrafts)}
                            className={`px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap min-w-fit ${showDrafts ? 'bg-primary text-primary-foreground shadow-primary/25' : 'bg-card border border-white/5 hover:bg-accent text-foreground'}`}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span>Open Orders ({draftOrders.length})</span>
                        </button>
                    </div>
                </div>

                {showDrafts && (
                    <div className="mb-8 p-6 bg-card rounded-2xl border shadow-xl animate-in slide-in-from-top duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Draft Orders</h3>
                            <button onClick={() => setShowDrafts(false)} className="text-muted-foreground hover:text-foreground">Close</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {draftOrders.map(order => (
                                <div key={order.id} className="p-4 rounded-xl border bg-muted/30 hover:border-primary/50 transition-all cursor-pointer group relative" onClick={() => resumeOrder(order)}>
                                    <button
                                        onClick={(e) => deleteDraft(e, order.id)}
                                        className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                    >
                                        <Plus className="h-4 w-4 rotate-45" />
                                    </button>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-mono text-xs font-bold text-muted-foreground">#{order.id.slice(0, 8)}</span>
                                        <span className="text-xs text-muted-foreground">{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="font-bold mb-1">{order.items.length} items</div>
                                    <div className="text-primary font-black">${order.total.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <CategoryList
                    categories={CATEGORIES}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto pb-20 pr-2 custom-scrollbar">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                    ))}
                </div>
            </div>

            <div className="w-[400px] bg-card border-l flex flex-col h-full shadow-xl z-20">
                <div className="p-4 border-b flex justify-between items-center bg-card">
                    <h2 className="text-xl font-bold flex items-center">
                        <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
                        {activeOrderId ? 'Editing Order' : 'Current Order'}
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
                            <CartItem key={item.id} item={item} onUpdateQuantity={updateQuantity} />
                        ))
                    )}
                </div>

                <div className="p-4 bg-muted/20 border-t space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (8%)</span>
                        <span>${(subtotal * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>${(subtotal * 1.08).toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={saveDraft}
                            className="bg-card border text-foreground h-14 rounded-xl font-bold text-lg hover:bg-accent transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            disabled={cart.length === 0}
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="bg-primary text-primary-foreground h-14 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                            disabled={cart.length === 0}
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            </div>

            {showPaymentModal && (
                <PaymentModal
                    total={subtotal}
                    selectedMethod={selectedPaymentMethod}
                    onSelectMethod={setSelectedPaymentMethod}
                    onClose={() => setShowPaymentModal(false)}
                    onComplete={handleCheckout}
                />
            )}

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
