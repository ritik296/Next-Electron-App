import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, dialog, Notification } from "electron";
import { getPort } from "get-port-please";
import { startServer } from "next/dist/server/lib/start-server";
import { join } from "path";
import { store } from "../store";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

// Configure autoUpdater logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// Set the feed URL for GitHub releases
autoUpdater.setFeedURL({
  provider: "github",
  owner: "ritik296", // Replace with your GitHub username
  repo: "Next-Electron-App", // Replace with your GitHub repository name
});

// Function to create the main window
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  // Show the main window when it's ready
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  // Load the app (either Next.js server or local build)
  const loadURL = async () => {
    if (is.dev) {
      mainWindow.loadURL("http://localhost:3000");
    } else {
      try {
        const port = await startNextJSServer();
        log.info("Next.js server started on port:", port);
        mainWindow.loadURL(`http://localhost:${port}`);
      } catch (error) {
        log.error("Error starting Next.js server:", error);
      }
    }
  };

  loadURL();

  // Check for updates when the app is ready
  mainWindow.once("ready-to-show", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  return mainWindow;
};

// Start the Next.js server for production
const startNextJSServer = async () => {
  try {
    const nextJSPort = await getPort({ portRange: [30011, 50000] });
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
    log.error("Error starting Next.js server:", error);
    throw error;
  }
};

// Function to show notifications
const showNotification = (title, body) => {
  new Notification({ title, body }).show();
};

// Auto-updater event handlers
autoUpdater.on("checking-for-update", () => {
  showUpdateStatus("Checking for updates...");
});

autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Update Available",
    message: "A new update is available. Downloading now...",
  });
});

autoUpdater.on("update-not-available", () => {
  showUpdateStatus("No updates available.");
});

autoUpdater.on("update-downloaded", () => {
  const response = dialog.showMessageBoxSync({
    type: "info",
    title: "Update Ready",
    message: "Update downloaded. Restart the app to apply the update?",
    buttons: ["Restart", "Later"],
  });

  if (response === 0) autoUpdater.quitAndInstall(false, true);
});

autoUpdater.on("error", (err) => {
  showUpdateStatus(`Update error: ${err.message}`);
});

// Function to show the update status in a dialog box
const showUpdateStatus = (statusMessage) => {
  dialog.showMessageBox({
    type: "info",
    title: "Update Status",
    message: statusMessage,
  });
};

// Electron app lifecycle hooks
app.whenReady().then(() => {
  const mainWindow = createWindow();

  // IPC handlers
  ipcMain.on("ping", (event, data) => {
    showNotification("Notification from Main", "Ping from Electron app");
    mainWindow.webContents.send("pong", data);
  });

  ipcMain.on("redux-action", (event, action) => {
    store.dispatch(action); // Dispatch actions to the Redux store
    event.sender.send("redux-state", store.getState()); // Send the updated state back
  });

  ipcMain.on("redux-current-state", (event) => {
    event.sender.send("redux-state", store.getState()); // Send the current state back
  });
});

// Handle app closure
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
