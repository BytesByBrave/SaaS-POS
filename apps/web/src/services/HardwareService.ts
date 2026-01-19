export interface ReceiptData {
    orderId: string;
    items: { name: string; price: number; quantity: number }[];
    subtotal: number;
    tax: number;
    total: number;
    timestamp: number;
    paymentMethod: string;
}

export class HardwareService {
    static formatReceipt(data: ReceiptData): string {
        const line = "--------------------------------";
        const header = "        SAAS POS DIGITAL        \n";
        const date = new Date(data.timestamp).toLocaleString() + "\n";
        const id = `Order: #${data.orderId.slice(0, 8)}\n`;

        let items = "";
        data.items.forEach(item => {
            const name = item.name.padEnd(20).slice(0, 20);
            const qty = item.quantity.toString().padStart(2);
            const price = (item.price * item.quantity).toFixed(2).padStart(8);
            items += `${name} ${qty} ${price}\n`;
        });

        return `${header}${line}\n${date}${id}${line}\n${items}${line}\n` +
            `Subtotal:        $${data.subtotal.toFixed(2).padStart(10)}\n` +
            `Tax (8%):        $${data.tax.toFixed(2).padStart(10)}\n` +
            `TOTAL:           $${data.total.toFixed(2).padStart(10)}\n` +
            `${line}\n` +
            `Payment: ${data.paymentMethod}\n` +
            `   THANK YOU FOR YOUR BUSINESS   \n\n\n`;
    }

    static async printReceipt(data: ReceiptData) {
        const receiptText = this.formatReceipt(data);

        // Use the ipcRenderer exposed via preload script if available
        const ipc = (window as any).ipcRenderer;

        if (ipc) {
            try {
                ipc.send('print-receipt', { text: receiptText, raw: data });
                return true;
            } catch (e) {
                console.error('Electron IPC failed:', e);
            }
        }

        // Web Fallback: Open in a new small window for printing
        console.log('Printing Receipt (Web Fallback):\n', receiptText);
        const printWindow = window.open('', '_blank', 'width=300,height=600');
        if (printWindow) {
            printWindow.document.write(`<pre style="font-family: monospace; font-size: 12px; white-space: pre-wrap;">${receiptText}</pre>`);
            printWindow.document.close();
            printWindow.focus();
            // Wrap print in a small timeout to ensure document is loaded
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
        return true;
    }

    static async scanBarcode() {
        // Handled via ScannerService logic
    }
}
