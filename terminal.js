// --- DOM Elements & State ---
const openTerminalBtn = document.getElementById('open-terminal-btn');
const closeTerminalBtn = document.getElementById('close-terminal-btn');
const terminalOverlay = document.getElementById('terminal-overlay');
const commandInput = document.getElementById('command-input');
const outputDiv = document.getElementById('output');
const terminalWindow = document.getElementById('terminal-window');
const promptElement = document.getElementById('prompt');

let commandHistory = [];
let historyIndex = -1;
let cwd = '/'; // Current Working Directory

// --- Virtual File System ---
let fileSystem = {
    '/': {
        type: 'directory',
        children: {
            'about': { type: 'directory', path: '/about' },
            'blog': { type: 'directory', path: '/blog' }
        }
    },
    '/about': { type: 'directory', children: {} },
    '/blog': { type: 'directory', children: {} }
};

// Function to dynamically populate the blog directory once data is loaded
function initializeFileSystem() {
    if (window.writeupsData) {
        window.writeupsData.forEach(post => {
            fileSystem['/blog'].children[post.id] = { type: 'file', path: `/blog/${post.id}` };
        });
    }
}

// --- Core Terminal Functions ---

function updatePrompt() {
    const pathForPrompt = cwd === '/' ? '~' : `~${cwd}`;
    promptElement.textContent = `guest@etynso.io:${pathForPrompt}$`;
}

// Make setCwd globally available so app.js can call it
window.setTerminalCwd = (path) => {
    // Ensure the path exists in our simplified FS, default to root if not
    if (path === '/blog' || path === '/about' || path === '/') {
        cwd = path;
    } else if (path.startsWith('/blog/')) {
        // For individual posts, the CWD is the blog directory
        cwd = '/blog';
    } else {
        cwd = '/';
    }
    updatePrompt();
};

// --- Event Listeners ---
if (openTerminalBtn) {
    openTerminalBtn.addEventListener('click', () => {
        terminalOverlay.style.display = 'block';
        commandInput.focus();
    });
}
if (closeTerminalBtn) {
    closeTerminalBtn.addEventListener('click', () => {
        terminalOverlay.style.display = 'none';
    });
}
if (terminalWindow) {
    terminalWindow.addEventListener('click', () => commandInput.focus());
}
if (commandInput) {
    commandInput.addEventListener('keydown', function(event) {
        if (event.key === "Enter") {
            const commandText = this.value.trim();
            if (commandText) {
                commandHistory.unshift(commandText);
                historyIndex = -1;
                printToOutput(`${promptElement.textContent} ${commandText}`);
                processCommand(commandText);
                this.value = "";
            }
            terminalWindow.scrollTop = terminalWindow.scrollHeight;
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                this.value = commandHistory[historyIndex];
            }
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                this.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                this.value = "";
            }
        }
    });
}

function printToOutput(text, isHTML = false) {
    const div = document.createElement('div');
    if (isHTML) {
        div.innerHTML = text;
    } else {
        div.textContent = text;
    }
    if(outputDiv) {
        outputDiv.appendChild(div);
    }
}

// --- Command Processing ---
function processCommand(commandText) {
    const [command, ...args] = commandText.split(/\s+/);
    switch (command.toLowerCase()) {
        case 'help': command_help(); break;
        case 'clear': command_clear(); break;
        case 'date': printToOutput(new Date().toString()); break;
        case 'whoami': printToOutput('guest'); break;
        case 'ls': command_ls(); break;
        case 'cd': command_cd(args); break;
        default:
            printToOutput(`-bash: ${command}: command not found`);
            break;
    }
}

// --- Command Implementations ---
function command_help() {
    const helpText = `
Available commands:
  <span style="color: var(--primary);">help</span>      - Shows this help message.
  <span style="color: var(--primary);">clear</span>     - Clears the terminal screen.
  <span style="color: var(--primary);">date</span>      - Shows the current date and time.
  <span style="color: var(--primary);">whoami</span>    - Prints the current user.
  <span style="color: var(--primary);">ls</span>        - Lists available pages.
  <span style="color: var(--primary);">cd [page]</span> - Navigates to a page.
            `;
    printToOutput(helpText, true);
}

function command_clear() {
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage && outputDiv) {
        const welcomeHTML = welcomeMessage.outerHTML;
        outputDiv.innerHTML = welcomeHTML + '<p>Type \'help\' to see a list of available commands.</p><br>';
    }
}

function command_ls() {
    const currentDir = fileSystem[cwd];
    if (!currentDir || !currentDir.children) {
        printToOutput('ls: cannot access current directory.');
        return;
    }

    let output = '';
    const children = Object.keys(currentDir.children);
    if (children.length === 0) {
        printToOutput('');
        return;
    }

    children.forEach(item => {
        const node = currentDir.children[item];
        if (node.type === 'directory') {
            output += `<span style="color: var(--secondary); font-weight: bold;">${item}/</span>  `;
        } else {
            output += `<span>${item}</span>  `;
        }
    });
    printToOutput(output, true);
}

function command_cd(args) {
    const target = args[0];
    if (!target) {
        printToOutput('cd: missing operand');
        return;
    }

    if (target === '..') {
        if (cwd !== '/') {
            // Simple case: just go to root
            cwd = '/';
            navigate('/');
            updatePrompt();
        }
        return;
    }

    const currentDir = fileSystem[cwd];
    const destination = currentDir.children[target];

    if (destination) {
        printToOutput(`Navigating to ${destination.path}...`);
        navigate(destination.path); // Let app.js handle the CWD update via setTerminalCwd
    } else {
        printToOutput(`cd: no such file or directory: ${target}`);
    }
}

// Initialize prompt on load
updatePrompt();
