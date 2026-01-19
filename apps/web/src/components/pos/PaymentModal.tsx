import { X, Banknote, CreditCard } from 'lucide-react';

interface PaymentModalProps {
    total: number;
    selectedMethod: 'Cash' | 'Card';
    onSelectMethod: (method: 'Cash' | 'Card') => void;
    onClose: () => void;
    onComplete: () => void;
}

export function PaymentModal({ total, selectedMethod, onSelectMethod, onClose, onComplete }: PaymentModalProps) {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-md p-8 rounded-3xl border shadow-2xl scale-in-center">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">Select Payment</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => onSelectMethod('Cash')}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${selectedMethod === 'Cash' ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`}
                    >
                        <Banknote className={`h-8 w-8 ${selectedMethod === 'Cash' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-bold ${selectedMethod === 'Cash' ? 'text-primary' : ''}`}>Cash</span>
                    </button>
                    <button
                        onClick={() => onSelectMethod('Card')}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${selectedMethod === 'Card' ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`}
                    >
                        <CreditCard className={`h-8 w-8 ${selectedMethod === 'Card' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-bold ${selectedMethod === 'Card' ? 'text-primary' : ''}`}>Card</span>
                    </button>
                </div>

                <div className="p-4 bg-muted/30 rounded-2xl mb-8">
                    <div className="flex justify-between items-center text-xl font-black">
                        <span className="text-muted-foreground text-sm uppercase tracking-widest">Total Amount</span>
                        <span>${(total * 1.08).toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={onComplete}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    Complete Order
                </button>
            </div>
        </div>
    );
}
