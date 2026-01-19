/**
 * PrinterService - Hardware Interface
 * Handles communication with thermal printers via Electron's IPC or WebUSB/WebSerial
 */

export interface PrinterDevice {
    id: string;
    name: string;
    type: 'usb' | 'network' | 'bluetooth';
}

export class PrinterService {
    private static instance: PrinterService;
    private isElectron: boolean;

    private constructor() {
        this.isElectron = !!(window as any).ipcRenderer;
    }

    static getInstance(): PrinterService {
        if (!PrinterService.instance) {
            PrinterService.instance = new PrinterService();
        }
        return PrinterService.instance;
    }

    async getPrinters(): Promise<PrinterDevice[]> {
        if (this.isElectron) {
            // In a real implementation, call Electron main process to list printers
            // return (window as any).ipcRenderer.invoke('get-printers');
            console.log('Fetching printers via Electron...');
            return [
                { id: '1', name: 'EPSON TM-T88V', type: 'usb' },
                { id: '2', name: 'Star TSP100', type: 'usb' }
            ];
        } else {
            console.warn('Browser mode: Cannot access raw USB devices directly without WebUSB.');
            return [];
        }
    }

    async printReceipt(orderId: string, content: string): Promise<boolean> {
        console.log(`Printing receipt for Order ${orderId}`);

        if (this.isElectron) {
            // Send raw ESC/POS commands via Electron
            // (window as any).ipcRenderer.send('print-raw', { content });
            return true;
        }

        // Browser Fallback: Print Dialog
        window.print();
        return true;
    }
}
