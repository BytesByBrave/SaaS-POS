import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Settings, LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export function MainLayout() {
    const location = useLocation()
    const [collapsed, setCollapsed] = useState(false)
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const role = user.role || 'staff'

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') ||
                localStorage.getItem('theme') === 'dark'
        }
        return false
    })

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [isDarkMode])

    const handleLogout = () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    const navItems = [
        { icon: ShoppingCart, label: 'Point of Sale', path: '/', roles: ['admin', 'manager', 'staff'] },
        { icon: LayoutDashboard, label: 'Analytics', path: '/dashboard', roles: ['admin', 'manager'] },
        { icon: Settings, label: 'System Settings', path: '/settings', roles: ['admin', 'manager'] },
    ].filter(item => item.roles.includes(role))

    return (
        <div className="flex h-screen w-full bg-muted/40 font-sans selection:bg-primary/10 selection:text-primary">
            {/* Sidebar */}
            <aside className={`bg-card/80 backdrop-blur-xl border-r transition-all duration-500 ease-in-out flex flex-col relative z-30 ${collapsed ? 'w-20' : 'w-72'}`}>
                <div className="h-20 flex items-center px-6 border-b border-border/50">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-accent rounded-xl transition-all active:scale-90 text-primary"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    {!collapsed && (
                        <div className="ml-4 flex flex-col">
                            <span className="font-black text-xl tracking-tighter bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">SaaS POS</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Enterprise Edition</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center p-4 rounded-2xl transition-all duration-300 group relative ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {!collapsed && <span className="ml-4 font-bold tracking-tight">{item.label}</span>}
                                {isActive && (
                                    <div className="absolute left-[-1rem] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 space-y-4 border-t border-border/50 bg-muted/30">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="flex items-center w-full p-4 rounded-2xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all group"
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        {!collapsed && <span className="ml-4 font-bold tracking-tight">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-4 rounded-2xl hover:bg-destructive/10 text-destructive/80 hover:text-destructive transition-all group"
                    >
                        <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        {!collapsed && <span className="ml-4 font-bold tracking-tight">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative bg-background/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none" />
                <div className="relative h-full overflow-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
