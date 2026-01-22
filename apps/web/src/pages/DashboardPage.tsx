import { useRxCollection, useRxQuery } from 'rxdb-hooks'
import { TrendingUp, ShoppingBag, Users, DollarSign, Calendar, X, CreditCard, Banknote, Package, Clock, ArrowUpRight, Sparkles, Zap, Download, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Order } from '../db/database'

export function DashboardPage() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [mounted, setMounted] = useState(false)
    const orderCollection = useRxCollection<Order>('orders')

    useEffect(() => {
        setMounted(true)
    }, [])

    // Fetch all orders
    const { result: orders = [] } = useRxQuery(
        (orderCollection ? orderCollection.find().sort({ timestamp: 'desc' }) : null) as any
    ) as { result: Order[] }

    // Calculate stats
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const ordersToday = orders.filter(o => {
        const today = new Date().setHours(0, 0, 0, 0)
        return o.timestamp >= today
    }).length

    const averageOrderValue = orders.length > 0 ? (totalSales / orders.length) : 0

    const stats = [
        { label: 'Total Sales', value: `$${totalSales.toFixed(2)}`, icon: DollarSign, color: 'from-emerald-400 to-emerald-600', shadowColor: 'shadow-emerald-500/30', trend: '+12.5%' },
        { label: 'Orders Today', value: ordersToday.toString(), icon: ShoppingBag, color: 'from-blue-400 to-blue-600', shadowColor: 'shadow-blue-500/30', trend: '+8.2%' },
        { label: 'Avg Order', value: `$${averageOrderValue.toFixed(2)}`, icon: TrendingUp, color: 'from-violet-400 to-violet-600', shadowColor: 'shadow-violet-500/30', trend: '+5.1%' },
        { label: 'Active Staff', value: '4', icon: Users, color: 'from-amber-400 to-amber-600', shadowColor: 'shadow-amber-500/30', trend: '0%' },
    ]

    // Simple Sparkline Data Generation
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        d.setHours(0, 0, 0, 0)
        return d.getTime()
    })

    const chartData = last7Days.map(day => {
        const dayTotal = orders
            .filter(o => o.timestamp >= day && o.timestamp < day + 86400000)
            .reduce((sum, o) => sum + o.total, 0)
        return dayTotal
    })

    return (
        <div className="p-8 h-full bg-background overflow-y-auto custom-scrollbar relative ambient-bg">
            {/* Header */}
            <div className={`
                flex justify-between items-center mb-10
                ${mounted ? 'animate-fade-in-up' : 'opacity-0'}
            `}>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight">
                            System Overview
                        </h1>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 font-medium">
                        <Calendar className="h-4 w-4" />
                        Live metrics for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="
                        px-5 py-3 rounded-xl font-bold text-sm
                        glass border border-white/10
                        hover:border-primary/40 hover:bg-primary/5
                        transition-all duration-300
                        flex items-center gap-2
                    ">
                        <Download className="h-4 w-4" />
                        Download Report
                    </button>
                    <button className="
                        relative px-5 py-3 rounded-xl font-bold text-sm text-white
                        overflow-hidden
                        hover:scale-105 active:scale-95
                        transition-all duration-300
                        flex items-center gap-2
                        group
                    ">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
                        <div className="absolute -bottom-2 inset-x-2 h-4 bg-primary/30 blur-xl rounded-full" />
                        <RefreshCw className="h-4 w-4 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="relative z-10">Refresh Data</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        style={{ animationDelay: `${i * 0.1}s` }}
                        className={`
                            p-6 rounded-3xl glass border border-white/10
                            hover:border-primary/30 hover:shadow-xl hover:-translate-y-1
                            transition-all duration-500 group overflow-hidden relative
                            ${mounted ? 'animate-fade-in-up' : 'opacity-0'}
                        `}
                    >
                        {/* Background icon */}
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                            <stat.icon className="h-32 w-32" />
                        </div>

                        {/* 3D Icon */}
                        <div className={`
                            relative h-14 w-14 rounded-2xl 
                            bg-gradient-to-br ${stat.color}
                            flex items-center justify-center mb-4
                            shadow-lg ${stat.shadowColor}
                            group-hover:scale-110 group-hover:-rotate-3
                            transition-all duration-500
                        `}>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-white/20" />
                            <stat.icon className="h-6 w-6 text-white relative z-10" />
                        </div>

                        <h3 className="text-muted-foreground font-bold text-xs uppercase tracking-wider mb-1">{stat.label}</h3>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black text-foreground">{stat.value}</p>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 px-2 py-1 rounded-full bg-emerald-500/10">
                                <ArrowUpRight className="h-3 w-3" />
                                {stat.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Visual Sales Chart */}
                <div className={`
                    lg:col-span-2 p-8 rounded-3xl glass border border-white/10
                    ${mounted ? 'animate-fade-in-up' : 'opacity-0'}
                `} style={{ animationDelay: '0.4s' }}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-xl mb-1">Revenue Trend</h3>
                            <p className="text-sm text-muted-foreground">Weekly performance metrics</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/20 text-xs font-bold text-emerald-500">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Growth: +12.5%
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full relative group">
                        {/* Chart glow */}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

                        <svg className="h-full w-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="hsl(262, 83%, 58%)" />
                                    <stop offset="50%" stopColor="hsl(280, 70%, 55%)" />
                                    <stop offset="100%" stopColor="hsl(262, 83%, 58%)" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Grid lines */}
                            {[0, 50, 100, 150, 200].map(y => (
                                <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />
                            ))}

                            {/* Area */}
                            <path
                                d={`M 0 200 ${chartData.map((val, i) => {
                                    const x = (i / 6) * 700
                                    const maxVal = Math.max(...chartData, 100)
                                    const y = 200 - (val / maxVal) * 160
                                    return `L ${x} ${y}`
                                }).join(' ')} L 700 200 Z`}
                                fill="url(#chartGradient)"
                                className="transition-all duration-1000"
                            />

                            {/* Line with glow */}
                            <path
                                d={`M 0 ${200 - (chartData[0] / Math.max(...chartData, 100)) * 160} ${chartData.map((val, i) => {
                                    const x = (i / 6) * 700
                                    const maxVal = Math.max(...chartData, 100)
                                    const y = 200 - (val / maxVal) * 160
                                    return `L ${x} ${y}`
                                }).join(' ')}`}
                                fill="none"
                                stroke="url(#lineGradient)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#glow)"
                                className="transition-all duration-1000"
                            />

                            {/* Data Points with 3D effect */}
                            {chartData.map((val, i) => {
                                const x = (i / 6) * 700
                                const maxVal = Math.max(...chartData, 100)
                                const y = 200 - (val / maxVal) * 160
                                return (
                                    <g key={i} className="group/point cursor-pointer">
                                        {/* Outer glow */}
                                        <circle
                                            cx={x} cy={y} r="12"
                                            fill="hsl(var(--primary))"
                                            opacity="0"
                                            className="transition-opacity group-hover/point:opacity-20"
                                        />
                                        {/* Main point */}
                                        <circle
                                            cx={x} cy={y} r="8"
                                            fill="hsl(var(--card))"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth="3"
                                            className="transition-all hover:r-10"
                                        />
                                        {/* Inner highlight */}
                                        <circle
                                            cx={x - 2} cy={y - 2} r="2"
                                            fill="white"
                                            opacity="0.5"
                                        />
                                        {/* Tooltip */}
                                        <g className="opacity-0 group-hover/point:opacity-100 transition-opacity">
                                            <rect x={x - 35} y={y - 45} width="70" height="30" rx="8" fill="hsl(var(--foreground))" />
                                            <text x={x} y={y - 25} textAnchor="middle" className="text-xs font-bold fill-background">
                                                ${val.toFixed(0)}
                                            </text>
                                        </g>
                                    </g>
                                )
                            })}
                        </svg>

                        {/* X-Axis Labels */}
                        <div className="flex justify-between mt-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
                        </div>
                    </div>
                </div>

                {/* Performance Goal Card */}
                <div
                    className={`
                        relative rounded-3xl p-8 overflow-hidden
                        ${mounted ? 'animate-fade-in-up' : 'opacity-0'}
                    `}
                    style={{ animationDelay: '0.5s' }}
                >
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-500 to-indigo-600" />

                    {/* 3D effect layers */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />

                    {/* Decorative elements */}
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl" />
                    <div className="absolute top-8 right-8 text-white/20">
                        <Sparkles className="h-8 w-8" />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between text-white">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black mb-2">Performance Boost</h3>
                            <p className="text-white/80 font-medium">Your sales are up 12% compared to last week.</p>
                        </div>

                        <div className="space-y-4 my-8">
                            {/* Progress bar */}
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div className="h-full w-2/3 rounded-full bg-white relative overflow-hidden">
                                    {/* Animated shimmer */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                <span>Weekly Goal</span>
                                <span>67% Completed</span>
                            </div>
                        </div>

                        <button className="
                            w-full py-4 rounded-2xl font-black text-sm
                            bg-white text-primary
                            hover:scale-[1.02] active:scale-95
                            transition-all duration-300
                            shadow-xl shadow-black/20
                        ">
                            Enable Analytics Pro
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div
                className={`
                    rounded-3xl glass border border-white/10 overflow-hidden mb-8
                    ${mounted ? 'animate-fade-in-up' : 'opacity-0'}
                `}
                style={{ animationDelay: '0.6s' }}
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl">Recent Transactions</h3>
                            <p className="text-xs text-muted-foreground">{orders.length} total orders</p>
                        </div>
                    </div>
                    <button className="text-primary text-sm font-bold hover:underline flex items-center gap-1 group">
                        View All
                        <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/20">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Items</th>
                                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.slice(0, 8).map((order, index) => (
                                <tr
                                    key={order.id}
                                    style={{ animationDelay: `${0.7 + index * 0.05}s` }}
                                    className={`
                                        hover:bg-primary/5 transition-colors cursor-pointer group
                                        ${mounted ? 'animate-fade-in-up' : 'opacity-0'}
                                    `}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                        #{order.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        {order.items.length} items
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-foreground">${order.total.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                                            ${order.status === 'synced'
                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            }
                                        `}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                                        <p className="text-muted-foreground font-medium">No transactions found today</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Side Panel */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-background/60 backdrop-blur-xl animate-fade-in-scale"
                        onClick={() => setSelectedOrder(null)}
                    />

                    {/* Panel */}
                    <div
                        className="relative w-full max-w-md h-full glass-strong border-l border-white/10 shadow-2xl animate-slide-in-right flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black">Order Details</h2>
                                    <p className="text-xs font-mono font-bold text-primary uppercase tracking-widest mt-1">
                                        #{selectedOrder.id.slice(0, 16)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-3 rounded-xl glass border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl glass border border-white/10">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Date</span>
                                    </div>
                                    <p className="font-bold text-sm">{new Date(selectedOrder.timestamp).toLocaleDateString()}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(selectedOrder.timestamp).toLocaleTimeString()}</p>
                                </div>
                                <div className="p-4 rounded-2xl glass border border-white/10">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        {selectedOrder.paymentMethod === 'Cash' ? <Banknote className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                                        <span className="text-[10px] font-black uppercase tracking-wider">Payment</span>
                                    </div>
                                    <p className="font-bold text-sm">{selectedOrder.paymentMethod || 'Unknown'}</p>
                                </div>
                            </div>

                            {/* Items List */}
                            <div>
                                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                    <Package className="h-4 w-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Ordered Items</span>
                                </div>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-center p-4 rounded-xl glass border border-white/10 hover:border-primary/20 transition-colors group"
                                        >
                                            <div className="flex gap-4 items-center">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary text-sm border border-primary/20">
                                                    {item.quantity}x
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 glass border-t border-white/10 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">${(selectedOrder.total / 1.08).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (8%)</span>
                                    <span className="font-medium">${(selectedOrder.total - (selectedOrder.total / 1.08)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-white/10">
                                    <span className="text-xl font-black">Total</span>
                                    <span className="text-3xl font-black text-primary">${selectedOrder.total.toFixed(2)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="
                                    relative w-full py-4 rounded-2xl font-black text-sm text-white
                                    overflow-hidden
                                    hover:scale-[1.02] active:scale-95
                                    transition-all duration-300
                                "
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
                                <span className="relative z-10">Close Details</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
