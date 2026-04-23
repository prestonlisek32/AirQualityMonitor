// Author: Preston Lisek
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('general', {
    readDataFile: async (filePath) => await ipcRenderer.invoke('sensor:readDataFile', filePath)
})


