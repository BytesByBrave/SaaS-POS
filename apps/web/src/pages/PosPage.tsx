import { Search, ShoppingCart, CheckCircle2, Sparkles, Package, Receipt, Trash2 } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
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
    const user: User = useMemo(() => {
        try {
            const stored = localStorage.getItem('user');
            if (!stored || stored === 'undefined') {
                return { features: {}, organizationId: "" };
            }
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse user from local storage', e);
            return { features: {}, organizationId: "" };
        }
    }, []);
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
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    const productCollection = useRxCollection<Product>('products')
    const orderCollection = useRxCollection<Order>('orders')

    const productsQuery = productCollection ? productCollection.find().sort({ name: 'asc' }) : null
    const { result: products = [] } = useRxQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        productsQuery as any
    ) as { result: Product[] }

    const draftOrdersQuery = orderCollection ? orderCollection.find({
        selector: { status: 'draft' },
        sort: [{ timestamp: 'desc' }]
    }) : null
    const { result: draftOrders = [] } = useRxQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        draftOrdersQuery as any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])

    const filteredProducts = useMemo(() => products.filter(p => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    }), [products, activeCategory, searchQuery])

    return (
        <div className="flex h-full w-full bg-background relative">
            {/* Main Product Area */}
            <div className="flex-1 flex flex-col h-full p-6 overflow-hidden">
                {/* Header */}
                <div className={`
                    flex justify-between items-center mb-8
                    ${mounted ? 'animate-fade-in-up' : 'opacity-0'}
                `}>
                    <div className="flex items-center gap-4">
                        {/* Enhanced Search Bar */}
                        <div className={`
                            relative w-96 group
                            transition-all duration-500
                            ${isSearchFocused ? 'w-[28rem]' : 'w-96'}
                        `}>
                            {/* Search glow effect */}
                            <div className={`
                                absolute -inset-1 rounded-2xl 
                                bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20
                                opacity-0 blur-xl transition-opacity duration-500
                                ${isSearchFocused ? 'opacity-100' : 'group-hover:opacity-50'}
                            `} />

                            <div className="relative">
                                <Search className={`
                                    absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 
                                    transition-all duration-300
                                    ${isSearchFocused ? 'text-primary scale-110' : 'text-muted-foreground'}
                                `} />
                                <input
                                    placeholder="Search products or scan barcode..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className="
                                        w-full pl-12 pr-4 h-14 rounded-2xl 
                                        glass border border-white/10
                                        focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                                        transition-all duration-300 outline-none 
                                        font-medium text-base
                                        placeholder:text-muted-foreground/60
                                    "
                                />

                                {/* Animated line under search */}
                                <div className={`
                                    absolute bottom-0 left-4 right-4 h-0.5 
                                    bg-gradient-to-r from-primary via-purple-500 to-primary
                                    transform origin-left transition-transform duration-300
                                    ${isSearchFocused ? 'scale-x-100' : 'scale-x-0'}
                                `} />
                            </div>
                        </div>

                        {/* Connection Status with 3D effect */}
                        <div className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold
                            glass border border-white/10
                            ${isOnline ? 'text-emerald-500' : 'text-amber-500'}
                        `}>
                            <div className="relative">
                                <div className={`
                                    h-2.5 w-2.5 rounded-full 
                                    ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}
                                `} />
                                <div className={`
                                    absolute inset-0 h-2.5 w-2.5 rounded-full animate-ping
                                    ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}
                                `} />
                            </div>
                            {isOnline ? 'Connected' : 'Offline Mode'}
                        </div>
                    </div>

                    {/* Open Orders Button */}
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => setShowDrafts(!showDrafts)}
                            className={`
                                relative px-6 py-3.5 rounded-2xl font-black text-sm 
                                transition-all duration-500 
                                flex items-center gap-3 
                                overflow-hidden
                                hover:scale-105 active:scale-95
                                ${showDrafts
                                    ? 'text-white shadow-xl shadow-primary/30'
                                    : 'glass border border-white/10 hover:border-primary/40 text-foreground'
                                }
                            `}
                        >
                            {/* Active gradient background */}
                            {showDrafts && (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
                                </>
                            )}

                            <ShoppingCart className="h-5 w-5 relative z-10" />
                            <span className="relative z-10">Open Orders</span>

                            {/* Badge with count */}
                            {draftOrders.length > 0 && (
                                <span className={`
                                    relative z-10 h-6 min-w-6 px-2 rounded-full 
                                    flex items-center justify-center
                                    text-[10px] font-black
                                    ${showDrafts
                                        ? 'bg-white/20 text-white'
                                        : 'bg-primary text-white'
                                    }
                                `}>
                                    {draftOrders.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Draft Orders Panel */}
                {showDrafts && (
                    <div className="mb-8 p-6 glass-strong rounded-3xl border border-white/10 shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Receipt className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Draft Orders</h3>
                                    <p className="text-xs text-muted-foreground">{draftOrders.length} pending orders</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDrafts(false)}
                                className="px-4 py-2 rounded-xl glass border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm font-bold"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {draftOrders.map((order, index) => (
                                <div
                                    key={order.id}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                    className="
                                        animate-fade-in-up
                                        p-5 rounded-2xl 
                                        glass border border-white/10
                                        hover:border-primary/40 
                                        hover:shadow-lg hover:shadow-primary/10
                                        hover:-translate-y-1
                                        transition-all duration-300 cursor-pointer 
                                        group relative overflow-hidden
                                    "
                                    onClick={() => resumeOrder(order)}
                                >
                                    {/* Hover gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <button
                                        onClick={(e) => deleteDraft(e, order.id)}
                                        className="
                                            absolute -top-2 -right-2 h-8 w-8 
                                            bg-destructive text-white rounded-full 
                                            flex items-center justify-center 
                                            opacity-0 group-hover:opacity-100 
                                            transform scale-75 group-hover:scale-100
                                            transition-all duration-300 shadow-lg z-10
                                            hover:shadow-xl hover:shadow-destructive/30
                                        "
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    <div className="relative z-10">
                                        <div className="flex justify-between mb-3">
                                            <span className="font-mono text-xs font-bold text-primary">
                                                #{order.id.slice(0, 8)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-bold">{order.items.length} items</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs text-muted-foreground">$</span>
                                            <span className="text-2xl font-black text-primary">{order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {draftOrders.length === 0 && (
                                <div className="col-span-full py-12 text-center text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                    <p className="font-medium">No draft orders</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Category List */}
                <CategoryList
                    categories={CATEGORIES}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 overflow-y-auto pb-20 pr-2 custom-scrollbar perspective-container">
                    {filteredProducts.map((product, index) => (
                        <div
                            key={product.id}
                            style={{ animationDelay: `${index * 0.03}s` }}
                            className="animate-fade-in-up"
                        >
                            <ProductCard product={product} onAddToCart={addToCart} />
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground">
                            <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="font-bold text-xl mb-2">No products found</p>
                            <p className="text-sm">Try adjusting your search or category filter</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-[320px] lg:w-[380px] xl:w-[420px] 2xl:w-[450px] glass-strong cart-sidebar border-l border-white/10 flex flex-col h-full shadow-2xl z-20 transition-all duration-300">
                {/* Cart Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center relative overflow-hidden">
                    {/* Gradient accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                                <ShoppingCart className="h-5 w-5 text-white" />
                            </div>
                            {/* Cart count badge */}
                            {cartItemCount > 0 && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-[10px] font-black flex items-center justify-center shadow-lg">
                                    {cartItemCount}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-black">
                                {activeOrderId ? 'Editing Order' : 'Current Order'}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {cart.length} {cart.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                    </div>

                    {cart.length > 0 && (
                        <button
                            onClick={() => setCart([])}
                            className="p-2 rounded-lg glass border border-white/10 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                                    <ShoppingCart className="h-10 w-10 opacity-30" />
                                </div>
                                <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/20 animate-spin" style={{ animationDuration: '20s' }} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg">Cart is empty</p>
                                <p className="text-sm text-muted-foreground/60">Add products to get started</p>
                            </div>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={item.id} style={{ animationDelay: `${index * 0.05}s` }}>
                                <CartItem item={item} onUpdateQuantity={updateQuantity} />
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Footer with Totals */}
                <div className="p-5 glass border-t border-white/10 space-y-4">
                    {/* Totals */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Subtotal</span>
                            <span className="font-bold">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Tax (8%)</span>
                            <span className="font-bold">${(subtotal * 0.08).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-white/10">
                            <span className="text-lg font-black">Total</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm text-muted-foreground">$</span>
                                <span className="text-3xl font-black text-primary">
                                    {(subtotal * 1.08).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={saveDraft}
                            disabled={cart.length === 0}
                            className="
                                relative h-14 rounded-xl font-bold text-sm
                                glass border border-white/10
                                hover:border-primary/40 hover:bg-primary/5
                                transition-all duration-300
                                active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                                overflow-hidden group
                            "
                        >
                            <span className="relative z-10">Save Draft</span>
                        </button>

                        <button
                            onClick={() => setShowPaymentModal(true)}
                            disabled={cart.length === 0}
                            className="
                                relative h-14 rounded-xl font-bold text-sm text-white
                                overflow-hidden
                                transition-all duration-300
                                hover:scale-[1.02] active:scale-95
                                disabled:opacity-50 disabled:cursor-not-allowed
                                group
                            "
                        >
                            {/* Gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />

                            {/* Shadow */}
                            <div className="absolute -bottom-2 inset-x-2 h-4 bg-primary/30 blur-xl rounded-full" />

                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Checkout
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    total={subtotal}
                    selectedMethod={selectedPaymentMethod}
                    onSelectMethod={setSelectedPaymentMethod}
                    onClose={() => setShowPaymentModal(false)}
                    onComplete={handleCheckout}
                />
            )}

            {/* Success Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-fade-in-scale" />

                    {/* Success Card */}
                    <div className="relative scale-in-center">
                        {/* Glow effects */}
                        <div className="absolute -inset-10 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -inset-20 bg-emerald-500/10 rounded-full blur-3xl" />

                        <div className="relative glass-strong p-16 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center">
                            {/* Animated success icon */}
                            <div className="relative mb-8">
                                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                                    <CheckCircle2 className="h-14 w-14 text-white success-icon" />
                                </div>

                                {/* Animated rings */}
                                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 success-ring" />
                                <div className="absolute -inset-4 rounded-full border-2 border-emerald-500/20 success-ring" style={{ animationDelay: '0.2s' }} />
                            </div>

                            <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Order Complete!
                            </h2>
                            <p className="text-muted-foreground font-medium text-lg">
                                Receipt has been sent to the printer
                            </p>

                            {/* Sparkles decoration */}
                            <div className="absolute top-8 left-8 text-yellow-400 animate-bounce">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div className="absolute top-12 right-12 text-primary animate-bounce" style={{ animationDelay: '0.3s' }}>
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div className="absolute bottom-12 left-12 text-purple-400 animate-bounce" style={{ animationDelay: '0.5s' }}>
                                <Sparkles className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
