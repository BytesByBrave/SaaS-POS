import { useState } from 'react'
import { Save, User, Building, Printer, CreditCard, Shield, Bell } from 'lucide-react'

const SETTINGS_TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business UI', icon: Building },
    { id: 'hardware', label: 'Hardware', icon: Printer },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
]

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')

    return (
        <div className="h-full flex flex-col bg-background p-8 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your professional POS configuration and profile</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    <Save className="h-4 w-4" />
                    Save Changes
                </button>
            </div>

            <div className="flex-1 flex gap-8 overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-64 flex flex-col gap-2">
                    {SETTINGS_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 p-4 rounded-xl font-semibold transition-all ${activeTab === tab.id
                                ? 'bg-card text-primary border shadow-sm translate-x-1'
                                : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
                                }`}
                        >
                            <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-card rounded-3xl border shadow-sm p-8 overflow-y-auto custom-scrollbar">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 max-w-2xl">
                            <div>
                                <h3 className="text-xl font-bold mb-6">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                        <input className="w-full px-4 h-12 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" defaultValue="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                        <input className="w-full px-4 h-12 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" defaultValue="john@example.com" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t">
                                <h3 className="text-xl font-bold mb-6">Theme Preference</h3>
                                <div className="flex gap-4">
                                    <button className="flex-1 p-4 rounded-2xl border-2 border-primary bg-card space-y-3">
                                        <div className="h-20 w-full bg-slate-100 rounded-lg border" />
                                        <span className="font-bold">Light Mode</span>
                                    </button>
                                    <button className="flex-1 p-4 rounded-2xl border bg-muted/50 space-y-3 grayscale opacity-60">
                                        <div className="h-20 w-full bg-slate-900 rounded-lg border border-slate-700" />
                                        <span className="font-bold">Dark Mode</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hardware' && (
                        <div className="space-y-8 max-w-2xl">
                            <h3 className="text-xl font-bold mb-6">Printer & Scanner</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 rounded-2xl border bg-background">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-secondary rounded-xl text-primary">
                                            <Printer className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">Receipt Printer</div>
                                            <div className="text-sm text-muted-foreground">Epson TM-T88VI (USB)</div>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80 transition-colors">Configure</button>
                                </div>

                                <div className="flex items-center justify-between p-6 rounded-2xl border bg-background">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-secondary rounded-xl text-primary">
                                            <CreditCard className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">Card Terminal</div>
                                            <div className="text-sm text-muted-foreground">Stripe Reader S700</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Connected</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
