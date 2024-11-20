import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, dialog, Notification, Menu, Tray, nativeImage } from "electron";
import { getPort } from "get-port-please";
import { startServer } from "next/dist/server/lib/start-server";
import { join } from "path";
import { store } from "../store";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

let deferUpdates = false; // Track if the user clicked "Later"
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
let tray = null; // Tray object
let mainWindow = null; // Reference to the main window

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
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
    show: false, // Start hidden; open only via tray menu
  });

  // Show the main window when it's ready
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("close", (event) => {
    // Hide the window instead of closing it
    event.preventDefault();
    mainWindow.hide();
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
    startPeriodicUpdateChecks(); // Start the periodic update check
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

// Function to check for updates periodically
const startPeriodicUpdateChecks = () => {
  setInterval(() => {
    if (!deferUpdates) {
      log.info("Periodic update check triggered.");
      autoUpdater.checkForUpdatesAndNotify();
    } else {
      log.info("Update checks deferred by the user.");
    }
  }, UPDATE_INTERVAL);
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

  if (response === 0) {
    autoUpdater.quitAndInstall(false, true);
  } else {
    deferUpdates = true; // User clicked "Later"
  }
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

// Create the tray with menu options
const createTray = (isUpdateAvailable=false) => {
  const iconPath = join(__dirname, "../public/logo1.png"); // Replace with your tray icon path
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => {
        if (mainWindow) mainWindow.show();
      },
    },
    isUpdateAvailable
    ? {
        label: "Update App",
        click: () => {
          autoUpdater.quitAndInstall(false, true);
        },
      }
    : {
        label: "Check for Updates",
        click: () => {
          if (!deferUpdates) autoUpdater.checkForUpdatesAndNotify();
        },
      },
    {
      label: "Close",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Next Electron App");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow) mainWindow.show();
  });
};

// Electron app lifecycle hooks
app.whenReady().then(() => {
  mainWindow = createWindow();
  createTray(false); // Create the tray icon and menu

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

// Send the current app version
ipcMain.on("get-version", (event) => {
  event.sender.send("app-version", app.getVersion());
});

// Notify renderer when an update is available
autoUpdater.on("update-available", () => {
  createTray(true)
  if (BrowserWindow.getAllWindows().length) {
    BrowserWindow.getAllWindows()[0].webContents.send("update-available");
  }
});

// Handle update installation
ipcMain.on("apply-update", () => {
  autoUpdater.quitAndInstall(false, true);
});
