import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { getPort } from "get-port-please";
import { startServer } from "next/dist/server/lib/start-server";
import { join } from "path";
import { Notification } from "electron";
import { store } from "../store";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  mainWindow.on("ready-to-show", async () => {
    mainWindow.show()
  });
  
  const loadURL = async () => {
    if (is.dev) {
      mainWindow.loadURL("http://localhost:3000");
    } else {
      try {
        const port = await startNextJSServer();
        console.log("Next.js server started on port:", port);
        mainWindow.loadURL(`http://localhost:${port}`);
      } catch (error) {
        console.error("Error starting Next.js server:", error);
      }
    }
  };
  
  loadURL();
  
  mainWindow.on("ready", async () => {
    autoUpdater.checkForUpdatesAndNotify();
  })

  return mainWindow;
};

const startNextJSServer = async () => {
  try {
    const nextJSPort = await getPort({ portRange: [30_011, 50_000] });
    const webDir = join(app.getAppPath(), "app");

    await startServer({
      dir: webDir,
      isDev: false,
      hostname: "localhost",
      port: nextJSPort,
      customServer: true,
      allowRetry: false,
      keepAliveTimeout: 5000,
      minimalMode: true,
    });

    return nextJSPort;
  } catch (error) {
    console.error("Error starting Next.js server:", error);
    throw error;
  }
};

// Display notifications for update events
const showNotification = (title, body) => {
  new Notification({ title, body }).show();
};

// Auto-updater event handlers
autoUpdater.on("checking-for-update", () => {
  showUpdateStatus("Checking for updates...");
});

autoUpdater.on("update-available", (info) => {
  showUpdateStatus(`Update available: Version ${info.version}`);
});

autoUpdater.on("update-not-available", () => {
  showUpdateStatus("No updates available.");
});

autoUpdater.on("update-downloaded", (info) => {
  showUpdateStatus(`Update downloaded: Version ${info.version}. Restarting to install...`);
});

autoUpdater.on("error", (err) => {
  showUpdateStatus(`Update error: ${err.message}`);
});

// Function to show the update status in a dialog box
const showUpdateStatus = (statusMessage) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Status',
    message: statusMessage,
  });
};

app.whenReady().then(() => {
  const mainWindow = createWindow();

  ipcMain.on("ping", (event, data) => {
    new Notification({
      title: 'Notification from main file',
      body: 'Ping from electron app'
    }).show();
    mainWindow.webContents.send('pong', data);
  });

  // Handle Redux actions via IPC
  ipcMain.on('redux-action', (event, action) => {
    store.dispatch(action); // Dispatch actions to the Redux store
    event.sender.send('redux-state', store.getState()); // Send the updated state back
  });

  ipcMain.on('redux-current-state', (event, action) => {
    event.sender.send('redux-state', store.getState()); // Send the updated state back
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
