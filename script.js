// script.js
const CREDENTIALS_KEY = 'collegeWifiCredentials';

let currentCredentials = null;

function loadCredentials() {
    const saved = localStorage.getItem(CREDENTIALS_KEY);
    if (saved) {
        currentCredentials = JSON.parse(saved);
        return true;
    }
    currentCredentials = null;
    return false;
}

function saveCredentials(username, password) {
    const creds = { 
        username, 
        password,
        producttype: "1",   // hidden default
        state: "1"          // hidden default
    };
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
    currentCredentials = creds;
}

function renderHome() {
    const infoEl = document.getElementById('credentials-info');
    if (currentCredentials) {
        infoEl.innerHTML = `
            <p style="color:#67e8f9; margin-bottom:6px;">✓ Credentials saved</p>
            <p style="font-size:22px; font-weight:700;">${currentCredentials.username}</p>
        `;
    } else {
        infoEl.innerHTML = `
            <p style="color:#f87171;">No credentials saved</p>
            <p style="font-size:15px; opacity:0.8;">Tap ⚙️ to add your login details</p>
        `;
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function performLogin() {
    if (!currentCredentials) {
        alert("Please save your credentials first using the gear icon.");
        showScreen('credentials-screen');
        return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://10.100.1.1:8090/login.xml';

    const fields = {
        username: currentCredentials.username,
        password: currentCredentials.password,
        producttype: currentCredentials.producttype,
        state: currentCredentials.state
    };

    Object.keys(fields).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
    });

    document.body.appendChild(form);

    // Visual feedback
    const btn = document.getElementById('connect-btn');
    const originalHTML = btn.innerHTML;
    btn.style.opacity = '0.7';
    btn.innerHTML = `<div class="button-inner"><span style="font-size:52px;">🔄</span><span class="connect-text">LOGGING IN...</span></div>`;

    setTimeout(() => {
        form.submit();
    }, 380);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCredentials();
    renderHome();

    // Buttons
    document.getElementById('connect-btn').addEventListener('click', performLogin);
    document.getElementById('settings-btn').addEventListener('click', () => {
        if (currentCredentials) {
            document.getElementById('username-input').value = currentCredentials.username || '';
            document.getElementById('password-input').value = currentCredentials.password || '';
        }
        showScreen('credentials-screen');
    });

    document.getElementById('back-btn').addEventListener('click', () => showScreen('home-screen'));
    
    document.getElementById('info-btn').addEventListener('click', () => {
        document.getElementById('info-modal').classList.add('active');
    });

    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('info-modal').classList.remove('active');
    });

    // Save credentials
    document.getElementById('save-btn').addEventListener('click', () => {
        const username = document.getElementById('username-input').value.trim();
        const password = document.getElementById('password-input').value.trim();

        if (!username || !password) {
            alert("Both Username and Password are required.");
            return;
        }

        saveCredentials(username, password);
        renderHome();
        showScreen('home-screen');
    });

    // Clear credentials
    document.getElementById('clear-btn').addEventListener('click', () => {
        if (confirm("Clear all saved credentials?")) {
            localStorage.removeItem(CREDENTIALS_KEY);
            currentCredentials = null;
            renderHome();
            showScreen('home-screen');
        }
    });

    // Password visibility toggle
    const toggleBtn = document.getElementById('toggle-password');
    const passInput = document.getElementById('password-input');
    toggleBtn.addEventListener('click', () => {
        if (passInput.type === 'password') {
            passInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            passInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    });

    // Service Worker for offline support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }
});