import { app, ipcMain, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
process.env.DIST = path.join(__dirname$1, "../dist");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || "", "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    },
    width: 1200,
    height: 800,
    title: "SaaS POS"
  });
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST || "", "index.html"));
  }
}
ipcMain.handle("get-printers", async () => {
  return await win?.webContents.getPrintersAsync();
});
ipcMain.on("print-receipt", (_event, { text, deviceName }) => {
  console.log("Main process received print request for device:", deviceName || "Default");
  let workerWin = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false
    }
  });
  const html = `
        <html>
        <body style="margin: 0; padding: 10px; font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 300px;">
            <pre style="white-space: pre-wrap; word-wrap: break-word;">${text}</pre>
        </body>
        </html>
    `;
  workerWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  workerWin.webContents.on("did-finish-load", () => {
    workerWin.webContents.print({
      silent: true,
      printBackground: true,
      deviceName: deviceName || ""
    }, (success, errorType) => {
      if (!success) console.error("Print failed:", errorType);
      workerWin.close();
    });
  });
});
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
  app.on("ready", createWindow);
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
