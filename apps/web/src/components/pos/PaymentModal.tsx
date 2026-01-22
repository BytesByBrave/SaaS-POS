import { X, Banknote, CreditCard, CheckCircle, Wallet, Clock } from 'lucide-react';
import { useState } from 'react';

interface PaymentModalProps {
    total: number;
    selectedMethod: 'Cash' | 'Card';
    onSelectMethod: (method: 'Cash' | 'Card') => void;
    onClose: () => void;
    onComplete: () => void;
}

export function PaymentModal({ total, selectedMethod, onSelectMethod, onClose, onComplete }: PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleComplete = async () => {
        setIsProcessing(true);
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-background/60 backdrop-blur-xl animate-fade-in-scale"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-lg scale-in-center">
                {/* Ambient glow effects */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

                {/* Main Modal */}
                <div className="relative glass-strong border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="relative p-8 pb-6 border-b border-white/10">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0 grid-pattern" />
                        </div>

                        <div className="flex justify-between items-center relative z-10">
                            <div>
                                <h2 className="text-3xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    Payment
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Select payment method
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="
                                    p-3 rounded-xl glass border border-white/10
                                    hover:bg-muted hover:border-primary/30
                                    transition-all duration-300
                                    active:scale-90
                                "
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Cash Button */}
                            <button
                                onClick={() => onSelectMethod('Cash')}
                                className={`
                                    relative p-6 rounded-2xl 
                                    transition-all duration-500 
                                    flex flex-col items-center gap-4
                                    overflow-hidden group
                                    ${selectedMethod === 'Cash'
                                        ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                                        : 'glass border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                                    }
                                `}
                            >
                                {/* Icon with 3D effect */}
                                <div className={`
                                    relative h-16 w-16 rounded-2xl 
                                    flex items-center justify-center
                                    transition-all duration-500
                                    ${selectedMethod === 'Cash'
                                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/40'
                                        : 'bg-muted/50'
                                    }
                                `}>
                                    {/* 3D shine effect */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/20" />
                                    <Banknote className={`
                                        h-8 w-8 relative z-10 transition-all duration-300
                                        ${selectedMethod === 'Cash' ? 'text-white scale-110' : 'text-muted-foreground group-hover:text-emerald-500'}
                                    `} />
                                </div>

                                <span className={`
                                    font-bold text-lg transition-colors duration-300
                                    ${selectedMethod === 'Cash' ? 'text-emerald-500' : 'text-foreground'}
                                `}>
                                    Cash
                                </span>

                                {/* Selected indicator */}
                                {selectedMethod === 'Cash' && (
                                    <div className="absolute top-3 right-3">
                                        <div className="relative">
                                            <CheckCircle className="h-6 w-6 text-emerald-500" />
                                            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                                        </div>
                                    </div>
                                )}
                            </button>

                            {/* Card Button */}
                            <button
                                onClick={() => onSelectMethod('Card')}
                                className={`
                                    relative p-6 rounded-2xl 
                                    transition-all duration-500 
                                    flex flex-col items-center gap-4
                                    overflow-hidden group
                                    ${selectedMethod === 'Card'
                                        ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20'
                                        : 'glass border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5'
                                    }
                                `}
                            >
                                {/* Icon with 3D effect */}
                                <div className={`
                                    relative h-16 w-16 rounded-2xl 
                                    flex items-center justify-center
                                    transition-all duration-500
                                    ${selectedMethod === 'Card'
                                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/40'
                                        : 'bg-muted/50'
                                    }
                                `}>
                                    {/* 3D shine effect */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/20" />
                                    <CreditCard className={`
                                        h-8 w-8 relative z-10 transition-all duration-300
                                        ${selectedMethod === 'Card' ? 'text-white scale-110' : 'text-muted-foreground group-hover:text-blue-500'}
                                    `} />
                                </div>

                                <span className={`
                                    font-bold text-lg transition-colors duration-300
                                    ${selectedMethod === 'Card' ? 'text-blue-500' : 'text-foreground'}
                                `}>
                                    Card
                                </span>

                                {/* Selected indicator */}
                                {selectedMethod === 'Card' && (
                                    <div className="absolute top-3 right-3">
                                        <div className="relative">
                                            <CheckCircle className="h-6 w-6 text-blue-500" />
                                            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Total Amount Card */}
                        <div className="relative p-6 rounded-2xl glass border border-white/10 overflow-hidden">
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Wallet className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                            Total Amount
                                        </span>
                                        <p className="text-xs text-muted-foreground">Including 8% tax</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg text-muted-foreground font-medium">$</span>
                                        <span className="text-4xl font-black text-foreground tracking-tight">
                                            {Math.floor(total * 1.08)}
                                        </span>
                                        <span className="text-xl font-bold text-muted-foreground">
                                            .{((total * 1.08) % 1).toFixed(2).slice(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Complete Button */}
                        <button
                            onClick={handleComplete}
                            disabled={isProcessing}
                            className="
                                relative w-full py-5 rounded-2xl 
                                font-black text-lg text-white
                                overflow-hidden
                                transition-all duration-500
                                hover:scale-[1.02] active:scale-[0.98]
                                disabled:opacity-70 disabled:cursor-not-allowed
                                group
                            "
                        >
                            {/* Gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_100%] animate-gradient-rotate" />

                            {/* 3D effect layers */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

                            {/* Button shadow */}
                            <div className="absolute -bottom-2 inset-x-4 h-4 bg-primary/40 blur-xl rounded-full" />

                            {/* Content */}
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {isProcessing ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        Complete Order
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
