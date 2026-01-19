import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Settings, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export function MainLayout() {
    const location = useLocation()
    const [collapsed, setCollapsed] = useState(false)

    const navItems = [
        { icon: ShoppingCart, label: 'POS', path: '/' },
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ]

    return (
        <div className="flex h-screen w-full bg-muted/40">
            {/* Sidebar */}
            <aside className={`bg-card border-r transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
                <div className="h-14 flex items-center px-4 border-b">
                    <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-accent rounded-md">
                        <Menu className="h-5 w-5" />
                    </button>
                    {!collapsed && <span className="ml-2 font-bold text-xl">SaaS POS</span>}
                </div>

                <nav className="flex-1 p-2 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center p-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-2 border-t">
                    <button className="flex items-center w-full p-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                        <LogOut className="h-5 w-5" />
                        {!collapsed && <span className="ml-3 font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    )
}
