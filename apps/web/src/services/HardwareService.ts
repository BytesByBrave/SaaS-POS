export class HardwareService {
    private static isElectron(): boolean {
        return typeof window !== 'undefined' &&
            window.process &&
            window.process.type === 'renderer';
    }

    static async printReceipt(receiptData: any) {
        if (this.isElectron()) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('print-receipt', receiptData);
            return true;
        } else {
            console.log('Not in Electron. Printing to console:', receiptData);
            // Fallback to browser print or show a modal
            return false;
        }
    }

    static async scanBarcode() {
        // Most scanners act as a keyboard. 
        // We can listen for global keydown events with a specific timing threshold.
        // This is usually handled in a global listener or a specific input.
    }
}
