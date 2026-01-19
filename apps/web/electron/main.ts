import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
        },
        width: 1200,
        height: 800,
        title: 'SaaS POS'
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
    }
}

// Receipt Printing Handler
ipcMain.on('print-receipt', (_event, { text }) => {
    console.log('Main process received print request:', text);

    // Create a hidden printer window
    let workerWin = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: false
        }
    });

    // Load the receipt content
    const html = `
        <html>
        <body style="margin: 0; padding: 10px; font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 300px;">
            <pre style="white-space: pre-wrap; word-wrap: break-word;">${text}</pre>
        </body>
        <script>
            window.onload = () => { window.print(); }
        </script>
        </html>
    `;

    workerWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    workerWin.webContents.on('did-finish-load', () => {
        // Silent printing if possible, or show printer dialog
        workerWin.webContents.print({
            silent: true,
            printBackground: true,
            deviceName: '' // Leave empty for default printer
        }, (success, errorType) => {
            if (!success) console.error('Print failed:', errorType);
            workerWin.close();
        });
    });
});

// Check if we are checking for single instance.
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (_event, _commandLine, _workingDirectory) => {
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
        }
    })

    app.on('ready', createWindow)
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
