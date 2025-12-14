const { app, BrowserWindow } = require('electron');
const path = require('path');
const expressApp = require('./server.js'); // Import the express app

let mainWindow;
let server; // Declare server variable

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, 'images 2.png'), // Path to icon
    title: 'Prison Return Management System',
    show: false // Don't show until ready-to-show
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Start the Express server
  const port = 3000;
  server = expressApp.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  createWindow();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Close the server when the app quits
    if (server) {
      server.close();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
