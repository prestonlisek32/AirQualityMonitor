// Author: Preston Lisek
const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('node:path');
const fs = require('fs').promises;

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 600,
        center: true,
        frame: false,
        fullscreen: false,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('public/index.html');
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


ipcMain.handle('sensor:readDataFile', async (event, filePath) => {
    try {
        // Read the file content using fs.promises.readFile
        const data = await fs.readFile(filePath, 'utf8');
        return data; // Return the data to the renderer process
    } catch (error) {
        // Handle any errors during file reading
        console.error('Error reading file:', error);
        throw new Error('Failed to read file.');

    }
});