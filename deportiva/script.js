/**
 * VITALSTATS ENGINE 2026 - Objeto Global de Gestión
 */
const VitalStats = {
    sessionKey: 'vs_session', // Llave única para todo el proyecto

    // --- 1. GESTIÓN DE SESIÓN ---
    getUserSession: function() {
        return JSON.parse(localStorage.getItem(this.sessionKey));
    },

    getUserPrefix: function() {
        const session = this.getUserSession();
        return session ? `user_${session.user}_` : 'guest_';
    },

    // --- 2. PERSISTENCIA MULTI-USUARIO ---
    save: function(key, value) {
        const prefix = this.getUserPrefix();
        localStorage.setItem(`${prefix}${key}`, value);
    },

    get: function(key) {
        const prefix = this.getUserPrefix();
        return localStorage.getItem(`${prefix}${key}`);
    },

    // --- 3. ACTUALIZACIÓN DE INTERFAZ (BOTÓN AUTH) ---
    actualizarInterfaz: function() {
        const authBtn = document.getElementById('authBtn');
        if (!authBtn) return;

        const session = this.getUserSession();

        if (session && session.nombre) {
            // ESTADO: LOGUEADO
            //authBtn.innerHTML = `👤 Hola, ${session.nombre.split(' ')[0]}`;
            authBtn.innerHTML = `👤`;
            authBtn.classList.add('logged-in');
            authBtn.onclick = (e) => { 
                e.preventDefault(); 
                this.abrirPerfil(session); 
            };
        } else {
            // ESTADO: INVITADO
            authBtn.innerHTML = 'Iniciar Sesión';
            authBtn.classList.remove('logged-in');
            authBtn.onclick = (e) => { 
                e.preventDefault(); 
                abrirLogin(); 
            };
        }
		
		const perfilNombre = document.getElementById('perfilNombre');
		if (perfilNombre) perfilNombre.textContent =  session.nombre;
		
		const userAvatar = document.getElementById('userAvatar');
		if (userAvatar) userAvatar.textContent = (session.nombre || 'U').charAt(0).toUpperCase();
		
		// Calcular días registrados basados en el historial del usuario
		const historial = JSON.parse(this.get('historialNutricional')) || {};
		const statsDias = document.getElementById('statsDias');
        if (statsDias) statsDias.textContent = Object.keys(historial).length;

        // Sincronizar también la Tab Bar
        this.setActiveTab();
    },

    // --- 4. MODALES ---
    abrirPerfil: function(session) {
        const modal = document.getElementById('perfilModal');
        if (!modal) return;
		
		document.getElementById('perfilNombreModalPerfil').textContent = session.nombre;
        document.getElementById('userAvatarModalPerfil').textContent = (session.nombre || 'U').charAt(0).toUpperCase();
		
        // Calcular días registrados basados en el historial del usuario
        const historial = JSON.parse(this.get('historialNutricional')) || {};
        const statsDiasModalPerfil = document.getElementById('statsDiasModalPerfil');
        if (statsDiasModalPerfil) statsDiasModalPerfil.textContent = Object.keys(historial).length;

        modal.style.display = 'flex';
    },

    logout: function() {
        if (confirm("¿Seguro que quieres cerrar sesión?")) {
            localStorage.removeItem(this.sessionKey);
            localStorage.removeItem('ultimo_rango_sincronizado');
            window.location.reload(); // Recarga para limpiar estados
        }
    },

    // --- 5. NAVEGACIÓN (TAB BAR) ---
    setActiveTab: function() {
        const currentPath = window.location.pathname;
        const tabs = document.querySelectorAll('.tab-item');
        
        tabs.forEach(tab => {
            const href = tab.getAttribute('href');
            // Quitamos los puntos de la ruta para comparar carpetas
            const cleanHref = href.replace('../', '').replace('./', '');
            
            if (cleanHref !== 'index.html' && currentPath.includes(cleanHref.split('/')[0])) {
                tab.classList.add('active');
            } else if ((currentPath.endsWith('/') || currentPath.endsWith('index.html')) && cleanHref === 'index.html') {
                if (!currentPath.includes('calculadora') && !currentPath.includes('registro')) {
                    tab.classList.add('active');
                }
            }
        });
    }
};

/**
 * FUNCIONES GLOBALES DE ACCESO
 */
function abrirLogin() { 
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'flex'; 
}

function cerrarLogin() { 
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none'; 
}

function intentarLogin() {
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;
    
    if (typeof DB_USUARIOS === 'undefined') return alert("Error: Base de datos no cargada.");

    const user = DB_USUARIOS.find(user => user.user === u && user.pass === p);
    
    if (user) {
        localStorage.setItem(VitalStats.sessionKey, JSON.stringify(user));
        cerrarLogin();
        VitalStats.actualizarInterfaz();
        window.location.reload(); // Para que las calculadoras carguen los datos del usuario
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

/**
 * Verifica si el usuario está autenticado.
 * Si no lo está, abre el modal de login y lanza un aviso.
 */
function verificarAcceso() {
    const session = JSON.parse(localStorage.getItem('vs_session'));
    
    if (session && session.user) {
        return true; // Acceso permitido
    } else {
        alert("🔒 Esta función requiere estar identificado.");
        // Si tienes la función abrirLogin() definida:
        if (typeof abrirLogin === 'function') {
            abrirLogin(); 
        } else {
            document.getElementById('authModal').style.display = 'flex';
        }
        return false; // Acceso denegado
    }
}

/**
 * INICIALIZACIÓN DE EVENTOS (ÚNICO PUNTO DE ENTRADA)
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Iniciar UI
    VitalStats.actualizarInterfaz();

    // 2. Eventos de cierre de modales
    const closePerfil = document.getElementById('closePerfil');
    if (closePerfil) closePerfil.onclick = () => document.getElementById('perfilModal').style.display = 'none';

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.onclick = () => VitalStats.logout();

    // 3. Menú Hamburguesa Móvil
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.onclick = () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('is-active');
        };
    }

    // 4. Modo Oscuro
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.textContent = '☀️';
    }

    if (themeBtn) {
        themeBtn.onclick = () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
        };
    }

    // 5. Cierre por clic exterior
    window.onclick = (e) => {
        if (e.target.id === 'authModal') cerrarLogin();
        if (e.target.id === 'perfilModal') document.getElementById('perfilModal').style.display = 'none';
    };
});

/**
 * PWA - Service Worker
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW error', err));
    });
}

let deferredPrompt;
const installBanner = document.getElementById('install-banner');
const btnInstallYes = document.getElementById('btn-install-yes');
const btnInstallNo = document.getElementById('btn-install-no');

// 1. Escuchar el evento de instalación
window.addEventListener('beforeinstallprompt', (e) => {
    // Evita que el navegador muestre su propio aviso automático
    e.preventDefault();
    // Guarda el evento para usarlo más tarde
    deferredPrompt = e;
    
    // Solo mostramos nuestro banner si el usuario no ha rechazado la instalación antes
    if (!localStorage.getItem('pwa-dismissed')) {
        installBanner.style.display = 'flex';
    }
});

// 2. Acción: El usuario quiere instalar
btnInstallYes.addEventListener('click', async () => {
    if (deferredPrompt) {
        // Muestra el prompt nativo de instalación
        deferredPrompt.prompt();
        
        // Espera a la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Resultado de instalación: ${outcome}`);
        
        // Limpiamos el evento
        deferredPrompt = null;
        installBanner.style.display = 'none';
    }
});

// 3. Acción: El usuario no quiere instalar ahora
btnInstallNo.addEventListener('click', () => {
    installBanner.style.display = 'none';
    // Opcional: No molestar en las próximas 24h
    localStorage.setItem('pwa-dismissed', 'true');
});

// Ocultar banner si ya está instalada la App
window.addEventListener('appinstalled', () => {
    installBanner.style.display = 'none';
    deferredPrompt = null;
    console.log('🎉 VitalStats instalada con éxito');
});