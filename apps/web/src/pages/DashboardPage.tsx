import { useRxCollection, useRxQuery } from 'rxdb-hooks'
import { TrendingUp, ShoppingBag, Users, DollarSign, Calendar } from 'lucide-react'
import type { Order } from '../db/database'

export function DashboardPage() {
    const orderCollection = useRxCollection<Order>('orders')

    // Fetch all orders
    const { result: orders = [] } = useRxQuery(
        (orderCollection ? orderCollection.find() : null) as any
    ) as { result: Order[] }

    // Calculate stats
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const ordersToday = orders.filter(o => {
        const today = new Date().setHours(0, 0, 0, 0)
        return o.timestamp >= today
    }).length

    const averageOrderValue = orders.length > 0 ? (totalSales / orders.length) : 0

    const stats = [
        { label: 'Total Sales', value: `$${totalSales.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Orders Today', value: ordersToday.toString(), icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Avg Order', value: `$${averageOrderValue.toFixed(2)}`, icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        { label: 'Active Staff', value: '4', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
        <div className="p-8 h-full bg-background overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight">System Overview</h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Live metrics for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-card border rounded-xl font-bold text-sm shadow-sm hover:bg-accent transition-all">Download Report</button>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all">Refresh Data</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="p-6 bg-card rounded-3xl border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className={`absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon className={`h-24 w-24 ${stat.color}`} />
                        </div>
                        <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-muted-foreground font-bold text-sm uppercase tracking-wider">{stat.label}</h3>
                        <p className="text-3xl font-black mt-1 text-foreground">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Visual Sales Chart */}
                <div className="lg:col-span-2 bg-card rounded-3xl border shadow-sm p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-xl">Revenue Trend</h3>
                            <p className="text-sm text-muted-foreground">Weekly performance metrics</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-bold">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                Growth: +12.5%
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full relative group">
                        <svg className="h-full w-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Area */}
                            <path
                                d={`M 0 200 ${chartData.map((val, i) => {
                                    const x = (i / 6) * 700
                                    const maxVal = Math.max(...chartData, 100)
                                    const y = 200 - (val / maxVal) * 150
                                    return `L ${x} ${y}`
                                }).join(' ')} L 700 200 Z`}
                                fill="url(#gradient)"
                                className="transition-all duration-1000"
                            />

                            {/* Line */}
                            <path
                                d={`M 0 ${200 - (chartData[0] / Math.max(...chartData, 100)) * 150} ${chartData.map((val, i) => {
                                    const x = (i / 6) * 700
                                    const maxVal = Math.max(...chartData, 100)
                                    const y = 200 - (val / maxVal) * 150
                                    return `L ${x} ${y}`
                                }).join(' ')}`}
                                fill="none"
                                stroke="var(--color-primary)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-1000"
                            />

                            {/* Data Points */}
                            {chartData.map((val, i) => {
                                const x = (i / 6) * 700
                                const maxVal = Math.max(...chartData, 100)
                                const y = 200 - (val / maxVal) * 150
                                return (
                                    <g key={i} className="group/point">
                                        <circle
                                            cx={x} cy={y} r="6"
                                            fill="var(--color-card)"
                                            stroke="var(--color-primary)"
                                            strokeWidth="3"
                                            className="transition-all hover:r-8 cursor-pointer"
                                        />
                                        <text x={x} y={y - 15} textAnchor="middle" className="text-[10px] font-black opacity-0 group-hover/point:opacity-100 transition-opacity fill-foreground">
                                            ${val.toFixed(0)}
                                        </text>
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

                {/* Performance Goal */}
                <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-3xl p-8 text-primary-foreground shadow-xl relative overflow-hidden">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-black mb-2">Performance Boost</h3>
                            <p className="text-primary-foreground/80 font-medium">Your sales are up 12% compared to last week.</p>
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-2/3 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            </div>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                <span>Weekly Goal</span>
                                <span>67% Completed</span>
                            </div>
                        </div>
                        <button className="mt-8 w-full py-4 bg-white text-primary rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                            Enable Analytics Pro
                        </button>
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Recent Orders Table */}
                <div className="lg:col-span-3 bg-card rounded-3xl border shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="font-bold text-xl">Recent Transactions</h3>
                        <button className="text-primary text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.slice(0, 5).map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-muted-foreground">#{order.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{order.items.length} items</td>
                                        <td className="px-6 py-4 text-sm font-black text-foreground">${order.total.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'synced' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-medium">No transactions found today</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
