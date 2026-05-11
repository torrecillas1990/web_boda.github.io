/**
 * OBJETO GLOBAL VITALSTATS
 */
const VitalStats = {
    // Obtener el prefijo del usuario actual
    getUserPrefix: function() {
        const session = JSON.parse(localStorage.getItem('vs_session'));
        return session ? `user_${session.user}_` : 'guest_';
    },

    // --- PERSISTENCIA (Añadidas para evitar el error .get) ---
    save: function(key, value) {
        const prefix = this.getUserPrefix();
        localStorage.setItem(`${prefix}${key}`, value);
    },

    get: function(key) {
        const prefix = this.getUserPrefix();
        return localStorage.getItem(`${prefix}${key}`);
    },

    initSession: function() {
        const session = JSON.parse(localStorage.getItem('vs_session'));
        this.adaptarUI(!!session, session);
    },

    adaptarUI: function(isAuth, session = null) {
        const authBtn = document.getElementById('authBtn');
        const premiumBtn = document.getElementById('premiumBtn');

        if (authBtn) {
            if (isAuth) {
                authBtn.innerText = `Salir (${session.user})`;
                authBtn.style.background = "#e74c3c";
                authBtn.onclick = (e) => { e.preventDefault(); this.logout(); };
            } else {
                authBtn.innerText = "Login";
                authBtn.style.background = ""; 
                authBtn.onclick = () => abrirLogin();
            }
        }

        if (premiumBtn) {
            if (isAuth) {
                premiumBtn.textContent = "Mi Perfil";
                premiumBtn.classList.add('btn-logged');
                premiumBtn.onclick = () => abrirPerfilModal(session);
            } else {
                premiumBtn.textContent = "Premium";
                premiumBtn.classList.remove('btn-logged');
                premiumBtn.onclick = () => window.location.href = "./registro-premium/index.html";
            }
        }
    },

    logout: function() {
        if (confirm("¿Seguro que quieres cerrar sesión?")) {
            localStorage.removeItem('vs_session');
            localStorage.removeItem('ultimo_rango_sincronizado');
            window.location.reload();
        }
    }
};

/**
 * FUNCIONES DE MODALES
 */
function abrirPerfilModal(session) {
    const modal = document.getElementById('perfilModal');
    if (!modal) return;

    document.getElementById('perfilNombre').textContent = session.nombre || session.user;
    document.getElementById('userAvatar').textContent = session.user.charAt(0).toUpperCase();
    
    // Ahora .get ya funciona aquí también
    const historial = JSON.parse(VitalStats.get('historialNutricional')) || {};
    document.getElementById('statsDias').textContent = Object.keys(historial).length;

    modal.style.display = 'flex';
}

function abrirLogin() { document.getElementById('authModal').style.display = 'flex'; }
function cerrarLogin() { document.getElementById('authModal').style.display = 'none'; }

function intentarLogin() {
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;
    if (typeof DB_USUARIOS === 'undefined') return alert("Error: Base de datos no cargada.");
    const user = DB_USUARIOS.find(user => user.user === u && user.pass === p);
    if (user) {
        localStorage.setItem('vs_session', JSON.stringify(user));
        location.reload();
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

/**
 * EVENTOS PRINCIPALES
 */
document.addEventListener('DOMContentLoaded', () => {
    VitalStats.initSession();

    const closePerfil = document.getElementById('closePerfil');
    if (closePerfil) {
        closePerfil.onclick = () => document.getElementById('perfilModal').style.display = 'none';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => VitalStats.logout();
    }

    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.onclick = () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('is-active');
        };
    }
    
    window.onclick = (event) => {
        if (event.target.id === 'authModal') cerrarLogin();
        if (event.target.id === 'perfilModal') document.getElementById('perfilModal').style.display = 'none';
    };

    // --- 1. LÓGICA DE MODO OSCURO ---
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    // Recuperar preferencia guardada
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        if (themeIcon) themeIcon.textContent = '☀️';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            
            // Guardar preferencia
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Cambiar icono (Luna/Sol)
            if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
            
            // Opcional: Actualizar colores de Chart.js si existen
            if (typeof updateChartsTheme === 'function') updateChartsTheme();
        });
    }

    // --- 2. LÓGICA DE TAB BAR ACTIVA ---
    // Ilumina automáticamente el icono de la sección actual
    const currentPath = window.location.pathname;
    const tabItems = document.querySelectorAll('.tab-item');

    tabItems.forEach(item => {
        const href = item.getAttribute('href');
        // Si la URL contiene el nombre de la carpeta, marcamos como activo
        if (href !== '../index.html' && currentPath.includes(href.split('/')[1])) {
            item.classList.add('active');
        } else if (href === '../index.html' && (currentPath.endsWith('index.html') || currentPath.endsWith('/'))) {
            // Caso especial para la home
            item.classList.add('active');
        }
    });
});


function setActiveTab() {
    const currentPath = window.location.pathname;
    const tabs = document.querySelectorAll('.tab-item');

    tabs.forEach(tab => {
        const href = tab.getAttribute('href');
        // Comprueba si la URL actual contiene el nombre de la carpeta del enlace
        if (href !== '../index.html' && currentPath.includes(href.split('/')[1])) {
            tab.classList.add('active');
        } else if (href.includes('index.html') && (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
            // Caso para la página principal
            if (!currentPath.includes('calculadora') && !currentPath.includes('registro')) {
                tab.classList.add('active');
            }
        }
    });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', setActiveTab);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ VitalStats PWA lista para usar offline'))
      .catch(err => console.log('❌ Error al registrar PWA', err));
  });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Aquí podrías mostrar un botón de "Instalar VitalStats" en tu navbar
    console.log("💎 VitalStats puede ser instalada.");
});