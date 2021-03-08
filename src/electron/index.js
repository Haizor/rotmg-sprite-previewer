const { app, BrowserWindow, screen, dialog, ipcMain } = require('electron');
const path = require("path");
const oldFS = require("fs");
const fs = oldFS.promises;
const watch = oldFS.watch;

let spritePath;
let spriteWatcher;
let maskPath;
let maskWatcher;

const createWindow = () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    window = new BrowserWindow({
        width: width / 1.25,
        height: height / 1.25,
        webPreferences: {
            preload: path.join(app.getAppPath(), "src/electron/preload.js")
        }
    });
    window.removeMenu();
    window.loadFile('public/index.html');
};

let window = null;

ipcMain.on("selectSprite", async (e) => {
    const result = await dialog.showOpenDialog(window, {
        properties: [
            "openFile"
        ]
    })
    if (!result.canceled) {
        setSpritePath(e, result.filePaths[0]);
    }
})

ipcMain.on("selectMask", async (e) => {
    const result = await dialog.showOpenDialog(window, {
        properties: [
            "openFile"
        ]
    })
    if (!result.canceled) {
        setMaskPath(e, result.filePaths[0]);
    }
})

//TODO: this could be merged into one function pretty easily probably
async function setSpritePath(e, path) {
    spritePath = path;
    if (spriteWatcher) {
        spriteWatcher.close();
    }

    const buf = await fs.readFile(path);
    e.reply("setSprite", "data:image/png;base64," + buf.toString("base64"));

    spriteWatcher = watch(path);
    //TODO: wtf is the path argument passed on watch???
    spriteWatcher.on("change", async (type, what) => {
        if (type !== "change") return;
        if (window === null || window === undefined) return;

        const buf = await fs.readFile(path);
        e.reply("setSprite", "data:image/png;base64," + buf.toString("base64"));
    })
}

async function setMaskPath(e, path) {
    maskPath = path;
    if (maskWatcher) {
        maskWatcher.close();
    }

    const buf = await fs.readFile(path);
    e.reply("setMask", "data:image/png;base64," + buf.toString("base64"));

    maskWatcher = watch(path);
    //TODO: wtf is the path argument passed on watch???
    maskWatcher.on("change", async (type, what) => {
        if (type !== "change") return;
        if (window === null || window === undefined) return;

        const buf = await fs.readFile(path);
        e.reply("setMask", "data:image/png;base64," + buf.toString("base64"));
    })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit());