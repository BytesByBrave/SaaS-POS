const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For simplicity in this demo, usually true for security
        },
    });

    const startURL = isDev
        ? 'http://localhost:5173' // Vite default port
        : `file://${path.join(__dirname, '../web/dist/index.html')}`;

    win.loadURL(startURL);

    if (isDev) {
        win.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC for Printer Support (ESC/POS)
ipcMain.on('print-receipt', (event, receiptData) => {
    console.log('Printing receipt:', receiptData);
    // In a real app: use node-escpos or electron's thermal printer library
    // win.webContents.print({ silent: true, deviceName: 'Thermal_Printer' });
});

// IPC for Barcode Scanner 
// (Barcode scanners usually act as keyboards, but we can handle specific USB HID if needed)
