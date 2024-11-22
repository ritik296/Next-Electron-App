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

contextBridge.exposeInMainWorld('autoLaunch', {
  enable: () => ipcRenderer.send("auto-launch-enable"),
  disable: () => ipcRenderer.send("auto-launch-disable"),
  checkStatus: () => ipcRenderer.send("auto-launch-check"),
  onStatusChange: (listener) => ipcRenderer.on("auto-launch-status", (event, data) => listener(data)),
})

contextBridge.exposeInMainWorld('todo', {
  create: (todoItem) => ipcRenderer.invoke('create-todo', todoItem),
  get: () => ipcRenderer.invoke('get-todo'),
  update: (id, updatedTodo) => ipcRenderer.invoke('update-todo', id, updatedTodo),
  delete: (id) => ipcRenderer.invoke('delete-todo', id)
})

// // Auto-updater events
// contextBridge.exposeInMainWorld("updater", {
//   onStatusChange: (callback) => {
//     ipcRenderer.on("update-status", (event, status) => callback(status));
//   },
// });
