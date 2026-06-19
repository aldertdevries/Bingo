const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('printerAPI', {
  getPrinters: () => ipcRenderer.invoke('get-printers')
})