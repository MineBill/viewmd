const { app, BrowserWindow, Menu } = require('electron');
const program = require('commander');
const fs = require('fs');
const { Liquid } = require('liquidjs');
const { Octokit } = require('@octokit/core');
const hljs = require('highlight.js');

function initialize() {
    let input = fs.readFileSync('/dev/stdin').toString();
    if (input.length != 0) {
        const octokit = new Octokit();
        octokit.request('POST /markdown', {
            text: input,
            mode: 'gfm'
        }).then(renderToFile);
    }else {
        console.log("Unimplemented!!");
        app.quit();
    }
}

function renderToFile(response) {
    const engine = new Liquid();
    engine.parseFile('template.html').then((value) => {
        engine.render(value, {
            input: response.data
        }).then((value) => {
            //fs.writeFileSync('index.html', hljs.highlightAuto(value).value);
            fs.writeFileSync('index.html', value);
            createWindow();
        });
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadFile('index.html');
    win.webContents.openDevTools();

    Menu.setApplicationMenu(null);
}

app.whenReady().then(initialize);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('get-this', () => {
    if (process.platform == 'win32') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
