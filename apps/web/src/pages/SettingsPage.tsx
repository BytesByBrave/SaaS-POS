import { useState, useEffect } from 'react'
import { Save, User, Building, Printer, CreditCard, Shield, Bell, RefreshCw, Check, Zap, Sparkles, Sun, Moon } from 'lucide-react'
import { HardwareService, type PrinterInfo } from '../services/HardwareService'

function HardwareSettings() {
    const [printers, setPrinters] = useState<PrinterInfo[]>([])
    const [selectedPrinter, setSelectedPrinter] = useState(localStorage.getItem('selected_printer') || '')
    const [loading, setLoading] = useState(false)

    const fetchPrinters = async () => {
        setLoading(true)
        try {
            const list = await HardwareService.getPrinters()
            setPrinters(list)
        } catch (error) {
            console.error('Failed to fetch printers:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPrinters()
    }, [])

    const handleSelectPrinter = (name: string) => {
        setSelectedPrinter(name)
        localStorage.setItem('selected_printer', name)
    }

    return (
        <div className="space-y-8 max-w-2xl animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black">Printer & Scanner</h3>
                    <p className="text-sm text-muted-foreground mt-1">Configure your hardware devices</p>
                </div>
                <button
                    onClick={fetchPrinters}
                    disabled={loading}
                    className="
                        p-3 rounded-xl glass border border-white/10
                        hover:border-primary/40 hover:bg-primary/5
                        transition-all text-muted-foreground hover:text-primary 
                        disabled:opacity-50 group
                    "
                >
                    <RefreshCw className={`h-5 w-5 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                </button>
            </div>

            <div className="space-y-6">
                {/* Printer Section */}
                <div className="p-6 rounded-2xl glass border border-white/10 space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-white/20" />
                            <Printer className="h-6 w-6 text-white relative z-10" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-lg">Receipt Printer</div>
                            <p className="text-sm text-muted-foreground">Select your thermal receipt printer</p>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {printers.length > 0 ? (
                            printers.map((printer, index) => (
                                <button
                                    key={printer.name}
                                    onClick={() => handleSelectPrinter(printer.name)}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                    className={`
                                        animate-fade-in-up
                                        relative flex items-center justify-between p-5 rounded-xl 
                                        transition-all duration-300 group overflow-hidden
                                        ${selectedPrinter === printer.name
                                            ? 'bg-primary/10 border-2 border-primary/50 shadow-lg shadow-primary/10'
                                            : 'glass border border-white/10 hover:border-primary/30 hover:bg-primary/5'
                                        }
                                    `}
                                >
                                    {/* Selected gradient */}
                                    {selectedPrinter === printer.name && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                                    )}

                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`
                                            relative h-3 w-3 rounded-full
                                            ${printer.status === 0 ? 'bg-emerald-500' : 'bg-amber-500'}
                                        `}>
                                            <div className={`
                                                absolute inset-0 rounded-full animate-ping
                                                ${printer.status === 0 ? 'bg-emerald-500' : 'bg-amber-500'}
                                            `} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-foreground">{printer.name}</span>
                                            <p className="text-xs text-muted-foreground">
                                                {printer.status === 0 ? 'Ready' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedPrinter === printer.name && (
                                        <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary">
                                            <Check className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Selected</span>
                                        </div>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-12 rounded-xl glass border border-white/10">
                                <Printer className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="font-medium text-muted-foreground">
                                    {loading ? 'Fetching printers...' : 'No printers found'}
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-1">Ensure Electron is running</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Terminal Section */}
                <div className="p-6 rounded-2xl glass border border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-white/20" />
                                <CreditCard className="h-6 w-6 text-white relative z-10" />
                            </div>
                            <div>
                                <div className="font-bold text-lg">Card Terminal</div>
                                <div className="text-sm text-muted-foreground">Stripe Reader S700</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="relative h-2.5 w-2.5 rounded-full bg-emerald-500">
                                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />
                            </div>
                            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Connected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SETTINGS_TABS = [
    { id: 'profile', label: 'Profile', icon: User, color: 'from-violet-400 to-violet-600' },
    { id: 'business', label: 'Business UI', icon: Building, color: 'from-blue-400 to-blue-600' },
    { id: 'hardware', label: 'Hardware', icon: Printer, color: 'from-emerald-400 to-emerald-600' },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-amber-400 to-amber-600' },
    { id: 'security', label: 'Security', icon: Shield, color: 'from-rose-400 to-rose-600' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-cyan-400 to-cyan-600' },
]

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    return (
        <div className="h-full flex flex-col bg-background p-8 overflow-hidden ambient-bg">
            {/* Header */}
            <div className={`
                flex justify-between items-center mb-8
                ${mounted ? 'animate-fade-in-up' : 'opacity-0'}
            `}>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight">
                            Settings
                        </h1>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <p className="text-muted-foreground font-medium">
                        Manage your professional POS configuration and profile
                    </p>
                </div>
                <button className="
                    relative px-6 py-3.5 rounded-xl font-bold text-sm text-white
                    overflow-hidden
                    hover:scale-105 active:scale-95
                    transition-all duration-300
                    flex items-center gap-2
                    group
                ">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
                    <div className="absolute -bottom-2 inset-x-2 h-4 bg-primary/30 blur-xl rounded-full" />
                    <Save className="h-4 w-4 relative z-10 group-hover:rotate-12 transition-transform" />
                    <span className="relative z-10">Save Changes</span>
                </button>
            </div>

            <div className="flex-1 flex gap-8 overflow-hidden">
                {/* Sidebar Tabs */}
                <div className={`
                    w-72 flex flex-col gap-2
                    ${mounted ? 'animate-slide-in-left' : 'opacity-0'}
                `}>
                    {SETTINGS_TABS.map((tab, index) => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ animationDelay: `${index * 0.05}s` }}
                                className={`
                                    relative flex items-center gap-4 p-4 rounded-2xl 
                                    font-bold transition-all duration-300 overflow-hidden group
                                    ${isActive
                                        ? 'text-white shadow-xl'
                                        : 'glass border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/30'
                                    }
                                `}
                            >
                                {/* Active background */}
                                {isActive && (
                                    <>
                                        <div className={`absolute inset-0 bg-gradient-to-r ${tab.color}`} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
                                    </>
                                )}

                                {/* Icon */}
                                <div className={`
                                    relative h-10 w-10 rounded-xl flex items-center justify-center
                                    transition-all duration-300
                                    ${isActive
                                        ? 'bg-white/20'
                                        : 'bg-muted/50 group-hover:bg-primary/10'
                                    }
                                `}>
                                    <tab.icon className={`h-5 w-5 relative z-10 ${isActive ? 'text-white' : 'group-hover:text-primary'}`} />
                                </div>

                                <span className="relative z-10">{tab.label}</span>

                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-8 bg-white rounded-r-full shadow-lg" />
                                )}
                            </button>
                        )
                    })}

                    {/* Pro Features Badge */}
                    <div className="mt-auto p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Pro Features</p>
                                <p className="text-[10px] text-muted-foreground">Unlock advanced settings</p>
                            </div>
                        </div>
                        <button className="w-full py-2.5 rounded-xl glass border border-primary/30 text-primary font-bold text-sm hover:bg-primary/10 transition-all">
                            Upgrade Now
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className={`
                    flex-1 glass-strong rounded-3xl border border-white/10 p-8 overflow-y-auto custom-scrollbar
                    ${mounted ? 'animate-fade-in-up' : 'opacity-0'}
                `} style={{ animationDelay: '0.2s' }}>
                    {activeTab === 'profile' && (
                        <div className="space-y-8 max-w-2xl animate-fade-in-up">
                            <div>
                                <h3 className="text-xl font-black mb-2">Personal Information</h3>
                                <p className="text-sm text-muted-foreground mb-6">Update your profile details</p>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-foreground/80">Full Name</label>
                                        <input
                                            className="
                                                w-full px-4 h-14 rounded-xl 
                                                glass border border-white/10
                                                focus:ring-2 focus:ring-primary/30 focus:border-primary/50 
                                                outline-none transition-all
                                                font-medium
                                            "
                                            defaultValue="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-foreground/80">Email Address</label>
                                        <input
                                            className="
                                                w-full px-4 h-14 rounded-xl 
                                                glass border border-white/10
                                                focus:ring-2 focus:ring-primary/30 focus:border-primary/50 
                                                outline-none transition-all
                                                font-medium
                                            "
                                            defaultValue="john@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/10">
                                <h3 className="text-xl font-black mb-2">Theme Preference</h3>
                                <p className="text-sm text-muted-foreground mb-6">Choose your preferred appearance</p>

                                <div className="flex gap-4">
                                    <button className="
                                        flex-1 p-5 rounded-2xl 
                                        border-2 border-primary 
                                        glass space-y-4 
                                        group transition-all duration-300
                                        hover:shadow-lg hover:shadow-primary/20
                                    ">
                                        <div className="h-24 w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
                                            <Sun className="h-8 w-8 text-amber-500" />
                                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold">Light Mode</span>
                                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                    </button>

                                    <button className="
                                        flex-1 p-5 rounded-2xl 
                                        border border-white/10 
                                        glass space-y-4 
                                        group transition-all duration-300
                                        hover:border-primary/40 hover:shadow-lg
                                        opacity-70 hover:opacity-100
                                    ">
                                        <div className="h-24 w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden">
                                            <Moon className="h-8 w-8 text-indigo-400" />
                                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold">Dark Mode</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hardware' && <HardwareSettings />}

                    {activeTab === 'business' && (
                        <div className="max-w-2xl animate-fade-in-up">
                            <h3 className="text-xl font-black mb-2">Business Settings</h3>
                            <p className="text-sm text-muted-foreground mb-6">Configure your business profile</p>
                            <div className="py-16 text-center glass rounded-2xl border border-white/10">
                                <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-muted-foreground">Coming soon</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="max-w-2xl animate-fade-in-up">
                            <h3 className="text-xl font-black mb-2">Payment Settings</h3>
                            <p className="text-sm text-muted-foreground mb-6">Manage payment methods and configurations</p>
                            <div className="py-16 text-center glass rounded-2xl border border-white/10">
                                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-muted-foreground">Coming soon</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="max-w-2xl animate-fade-in-up">
                            <h3 className="text-xl font-black mb-2">Security Settings</h3>
                            <p className="text-sm text-muted-foreground mb-6">Manage your security preferences</p>
                            <div className="py-16 text-center glass rounded-2xl border border-white/10">
                                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-muted-foreground">Coming soon</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="max-w-2xl animate-fade-in-up">
                            <h3 className="text-xl font-black mb-2">Notification Settings</h3>
                            <p className="text-sm text-muted-foreground mb-6">Configure your notification preferences</p>
                            <div className="py-16 text-center glass rounded-2xl border border-white/10">
                                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-muted-foreground">Coming soon</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
