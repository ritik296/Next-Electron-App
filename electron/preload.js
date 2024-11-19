import { contextBridge, ipcRenderer } from "electron";
import os from 'os';

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, listener) =>
      ipcRenderer.on(channel, listener),
  },
  homeDir: os.homedir(),
  arch: os.arch(),
  osVersion: os.version()
});

contextBridge.exposeInMainWorld('counter', {
  dispatchAction: (action) => {
    ipcRenderer.send('redux-action', action);
  },
  subscribeToState: (callback) => {
    ipcRenderer.on('redux-state', (event, state) => {
      callback(state);
    });
  },
});

// // Auto-updater events
// contextBridge.exposeInMainWorld("updater", {
//   onStatusChange: (callback) => {
//     ipcRenderer.on("update-status", (event, status) => callback(status));
//   },
// });
