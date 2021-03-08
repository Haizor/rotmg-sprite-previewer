const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
    selectSprite: () => {
        ipcRenderer.send("selectSprite");
    },
    selectMask: () => {
        ipcRenderer.send("selectMask");
    },
    onSetSprite: (func) => {
        ipcRenderer.on("setSprite", func);
    },
    onSetMask: (func) => {
        ipcRenderer.on("setMask", func);
    }
})