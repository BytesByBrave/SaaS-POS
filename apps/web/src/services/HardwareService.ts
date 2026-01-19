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
        const doubleLine = "================================";
        const header = "        SAAS POS DIGITAL        \n";
        const subHeader = "      Enterprise Edition      \n";
        const date = "Date: " + new Date(data.timestamp).toLocaleString() + "\n";
        const id = `Order ID: #${data.orderId.slice(0, 8)}\n`;

        let items = "ITEM                QTY   AMOUNT\n";
        items += line + "\n";

        data.items.forEach(item => {
            const name = (item.name || "Unknown").padEnd(18).slice(0, 18);
            const qty = (item.quantity || 0).toString().padStart(3);
            const priceValue = (item.price ?? 0) * (item.quantity || 0);
            const price = priceValue.toFixed(2).padStart(9);
            items += `${name} ${qty} ${price}\n`;
        });

        const subtotal = `Subtotal:`.padEnd(20) + `$${data.subtotal.toFixed(2).padStart(10)}\n`;
        const tax = `Tax (8%):`.padEnd(20) + `$${data.tax.toFixed(2).padStart(10)}\n`;
        const total = `TOTAL:`.padEnd(20) + `$${data.total.toFixed(2).padStart(10)}\n`;

        return `${header}${subHeader}${doubleLine}\n${date}${id}${doubleLine}\n${items}${line}\n` +
            `${subtotal}${tax}${doubleLine}\n` +
            `${total}${doubleLine}\n\n` +
            `Payment: ${data.paymentMethod.padStart(15)}\n\n` +
            `  THANK YOU FOR YOUR BUSINESS  \n` +
            `      www.saaspos.digital      \n\n\n`;
    }

    static async getPrinters() {
        if ((window as any).ipcRenderer?.getPrinters) {
            return await (window as any).ipcRenderer.getPrinters();
        }
        return [];
    }

    private static buildHtmlReceipt(data: ReceiptData): string {
        const itemsHtml = data.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px;">
                <div style="flex: 2;">${item.name || "Unknown"}</div>
                <div style="flex: 1; text-align: center;">${item.quantity || 0}</div>
                <div style="flex: 1; text-align: right;">$${((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}</div>
            </div>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=JetBrains+Mono&display=swap');
                    body {
                        font-family: 'Inter', sans-serif;
                        color: #1a1a1a;
                        margin: 0;
                        padding: 20px;
                        width: 300px;
                        background: white;
                    }
                    .receipt { max-width: 100%; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .logo { font-weight: 900; font-size: 20px; letter-spacing: -0.5px; margin-bottom: 4px; }
                    .tagline { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                    .info { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #444; margin-bottom: 20px; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 10px 0; }
                    .columns { display: flex; justify-content: space-between; font-weight: 700; font-size: 12px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; color: #444; }
                    .total-section { margin-top: 20px; border-top: 2px solid #000; padding-top: 10px; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
                    .grand-total { font-size: 18px; font-weight: 900; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                    .website { font-size: 10px; margin-top: 5px; color: #aaa; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <div class="logo">SAAS POS</div>
                        <div class="tagline">Enterprise Edition</div>
                    </div>
                    <div class="info">
                        Date: ${new Date(data.timestamp).toLocaleString()}<br>
                        Order ID: #${data.orderId.slice(0, 8)}<br>
                        Payment: ${data.paymentMethod}
                    </div>
                    <div class="columns">
                        <div style="flex: 2;">ITEM</div>
                        <div style="flex: 1; text-align: center;">QTY</div>
                        <div style="flex: 1; text-align: right;">TOTAL</div>
                    </div>
                    <div class="items">
                        ${itemsHtml}
                    </div>
                    <div class="total-section">
                        <div class="total-row">
                            <span>Subtotal</span>
                            <span>$${data.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="total-row">
                            <span>Tax (8%)</span>
                            <span>$${data.tax.toFixed(2)}</span>
                        </div>
                        <div class="total-row grand-total">
                            <span>TOTAL</span>
                            <span>$${data.total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="footer">
                        <strong>THANK YOU FOR YOUR BUSINESS</strong>
                        <div class="website">www.saaspos.digital</div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    static async printReceipt(data: ReceiptData) {
        const receiptText = this.formatReceipt(data);
        const receiptHtml = this.buildHtmlReceipt(data);
        const selectedPrinter = localStorage.getItem('selected_printer');

        // Use the ipcRenderer exposed via preload script if available
        const ipc = (window as any).ipcRenderer;

        if (ipc) {
            try {
                ipc.send('print-receipt', {
                    text: receiptText,
                    html: receiptHtml, // Also send HTML if the bridge supports it
                    raw: data,
                    deviceName: selectedPrinter
                });
                return true;
            } catch (e) {
                console.error('Electron IPC failed:', e);
            }
        }

        // Web Fallback: Open in a new small window for printing
        console.log('Printing Receipt (Web Fallback):\n', receiptText);
        const printWindow = window.open('', '_blank', 'width=350,height=600');
        if (printWindow) {
            printWindow.document.write(receiptHtml);
            printWindow.document.close();
            printWindow.focus();

            // Wait for fonts to load for best look
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
        return true;
    }

    static async scanBarcode() {
        // Handled via ScannerService logic
    }
}
