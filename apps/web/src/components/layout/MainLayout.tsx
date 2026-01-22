import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Settings, LogOut, Moon, Sun, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

export function MainLayout() {
    const location = useLocation()

    // Safely parse user from localStorage with fallback for invalid values
    const getUserFromStorage = () => {
        try {
            const storedUser = localStorage.getItem('user')
            // Check for invalid stored values
            if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
                return {}
            }
            return JSON.parse(storedUser)
        } catch {
            return {}
        }
    }

    const user = getUserFromStorage()
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
        { icon: LayoutDashboard, label: 'Analytics', path: '/dashboard', roles: ['admin', 'manager', 'staff'] },
        { icon: Settings, label: 'System Settings', path: '/settings', roles: ['admin', 'manager', 'staff'] },
    ].filter(item => item.roles.includes(role))

    return (
        <div className="flex h-screen w-full bg-background font-sans selection:bg-primary/20 selection:text-primary ambient-bg">
            {/* Animated background particles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="particle" style={{ left: '10%', top: '20%', animationDelay: '0s' }} />
                <div className="particle" style={{ left: '80%', top: '30%', animationDelay: '5s' }} />
                <div className="particle" style={{ left: '30%', top: '70%', animationDelay: '10s' }} />
                <div className="particle" style={{ left: '70%', top: '80%', animationDelay: '3s' }} />
                <div className="particle" style={{ left: '50%', top: '10%', animationDelay: '7s' }} />
            </div>

            {/* Sidebar */}
            <aside className="
                relative z-40 flex flex-col items-center
                glass-strong border-r border-white/10
                w-20 h-full py-6
                transition-all duration-500 ease-out
            ">
                {/* Sidebar glow effect */}
                <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

                {/* Header Logo */}
                <div className="mb-8 relative group cursor-pointer">
                    <div className="
                        h-12 w-12 rounded-2xl 
                        bg-gradient-to-br from-primary via-purple-500 to-indigo-600
                        flex items-center justify-center 
                        shadow-lg shadow-primary/30
                        transform transition-transform duration-300 group-hover:scale-110
                    ">
                        <Zap className="h-6 w-6 text-white fill-white" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 w-full px-3 space-y-4 overflow-y-auto no-scrollbar flex flex-col items-center">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{ animationDelay: `${index * 0.1}s` }}
                                className={`
                                    relative h-12 w-12 rounded-xl flex items-center justify-center
                                    transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-primary/10 text-primary shadow-lg shadow-primary/10'
                                        : 'text-muted-foreground hover:bg-white/5 hover:text-primary'
                                    }
                                `}
                                title={item.label}
                            >
                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                                )}

                                <item.icon className={`
                                    h-6 w-6 transition-all duration-300
                                    ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                                `} />
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="w-full px-3 space-y-4 pt-4 border-t border-white/10 flex flex-col items-center">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="
                            h-10 w-10 rounded-xl 
                            flex items-center justify-center
                            text-muted-foreground hover:text-yellow-400
                            transition-all duration-300 hover:bg-white/5
                        "
                        title={isDarkMode ? "Light Mode" : "Dark Mode"}
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="
                            h-10 w-10 rounded-xl 
                            flex items-center justify-center
                            text-muted-foreground hover:text-destructive
                            transition-all duration-300 hover:bg-destructive/10
                        "
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                {/* Grid pattern background */}
                <div className="absolute inset-0 grid-pattern pointer-events-none" />

                {/* Content container */}
                <div className="relative h-full overflow-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
