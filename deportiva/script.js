/**
 * OBJETO GLOBAL VITALSTATS
 * Centraliza la gestión de sesión, persistencia y sincronización
 */
const VitalStats = {
    // Obtener el prefijo del usuario actual
    getUserPrefix: function() {
        const session = JSON.parse(localStorage.getItem('vs_session'));
        return session ? `user_${session.user}_` : 'guest_';
    },
	
    // --- PERSISTENCIA BÁSICA ---
    // Guardar un dato asociado al usuario
    save: function(key, value) {
        const prefix = this.getUserPrefix();
        localStorage.setItem(`${prefix}${key}`, value);
    },
	
    // Recuperar un dato asociado al usuario
    get: function(key) {
        const prefix = this.getUserPrefix();
        return localStorage.getItem(`${prefix}${key}`);
    },

    clear: function() {
        localStorage.clear();
        location.reload();
    },

    // --- GESTIÓN DE SESIÓN ---
	initSession: function() {
        const session = JSON.parse(localStorage.getItem('vs_session'));
        this.adaptarUI(!!session, session);
    },

    adaptarUI: function(isAuth, session = null) {
        const authBtn = document.getElementById('authBtn');
        const premiumBtn = document.getElementById('premiumBtn');

        // Botón de Login/Logout
        if (authBtn) {
            if (isAuth) {
                authBtn.innerText = `Salir (${session.user})`;
                authBtn.style.background = "#e74c3c";
                authBtn.onclick = (e) => { e.preventDefault(); this.logout(); };
            } else {
                authBtn.innerText = "Iniciar Sesión";
                authBtn.style.background = ""; // Color original
                authBtn.onclick = abrirLogin;
            }
        }

        // Botón Premium / Perfil
        if (premiumBtn) {
            if (isAuth) {
                premiumBtn.textContent = "Mi Perfil";
                premiumBtn.classList.add('btn-logged');
                premiumBtn.onclick = () => abrirPerfilModal(session);
            } else {
                premiumBtn.textContent = "Hazte Premium";
                premiumBtn.classList.remove('btn-logged');
                premiumBtn.onclick = () => alert("¡Pásate a Premium para funciones avanzadas!");
            }
        }
    },

    isLoggedIn: function() {
        return localStorage.getItem('vs_session') !== null;
    },

    // --- SINCRONIZACIÓN CLOUD (Simulada) ---
    // Sincronización (Modificada para usar el prefijo)
    sincronizarDatos: function(session) {
        // Si el usuario es nuevo en este dispositivo, pero tenemos datos en 
        // window.REGISTRO_CLOUD (tu archivo JS), los volcamos a SU espacio local
        if (window.REGISTRO_CLOUD && window.REGISTRO_CLOUD[session.user]) {
            const datosCloud = window.REGISTRO_CLOUD[session.user];
            let historialUsuario = {};
            
            datosCloud.forEach(reg => {
                historialUsuario[reg.fecha] = [{ 
                    nombre: "Sincronizado", 
                    kcal: reg.kcal, prot: reg.prot, grasa: reg.grasa, carb: reg.carb 
                }];
            });

            // Guardamos usando el prefijo del usuario
            this.save('historialNutricional', JSON.stringify(historialUsuario));
        }
    },
	
	logout: function() {
        // 1. Borramos la sesión
        localStorage.removeItem('vs_session');
        localStorage.removeItem('ultimo_rango_sincronizado');
		
        // 2. Opcional: Borrar datos temporales de la sesión actual 
        // (Si prefieres que al cerrar sesión los gráficos se limpien)
        // localStorage.removeItem('historialNutricional');

        alert("Has cerrado sesión correctamente.");

        // 3. Redirigir al index principal para limpiar la UI completamente
        // Usamos una ruta relativa que funcione desde subcarpetas
        if (window.location.pathname.includes('/contador-calorias/') || 
            window.location.pathname.includes('/calculadora-')) {
            window.location.href = "../index.html";
        } else {
            window.location.href = "index.html";
        }
        window.location.reload(); 
    }
};

/**
 * FUNCIONES DE AUTENTICACIÓN (Llamadas desde el HTML)
 */
function abrirLogin() {
    document.getElementById('authModal').style.display = 'flex';
}

function cerrarLogin() {
    document.getElementById('authModal').style.display = 'none';
}

function intentarLogin() {
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;

    if (typeof DB_USUARIOS === 'undefined') {
        alert("Error: No se encontró la base de datos de usuarios.");
        return;
    }

    const usuarioEncontrado = DB_USUARIOS.find(user => user.user === u && user.pass === p);

    if (usuarioEncontrado) {
        localStorage.setItem('vs_session', JSON.stringify(usuarioEncontrado));
        alert("Sesión iniciada como " + usuarioEncontrado.nombre);
        location.reload();
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

/**
 * HISTORIAL Y LÍMITES
 */
function saveToHistory(data) {
    let historyCount = parseInt(VitalStats.get('history_count') || 0);

    if (historyCount >= 3 && !VitalStats.isLoggedIn()) {
        alert("Has alcanzado el límite de 3 registros gratuitos. Hazte Premium para guardar todo tu historial.");
        window.location.href = "../registro-premium/index.html";
    } else {
        let historial = JSON.parse(VitalStats.get('user_history') || "[]");
        historial.push({
            fecha: new Date().toLocaleDateString(),
            datos: data
        });
        
        VitalStats.save('user_history', JSON.stringify(historial));
        
        if (!VitalStats.isLoggedIn()) {
            historyCount++;
            VitalStats.save('history_count', historyCount);
        }
        
        alert("¡Datos guardados con éxito!");
    }
}

/**
 * INICIALIZACIÓN DE EVENTOS
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Iniciar Sesión y UI
    VitalStats.initSession();

    // 2. Menú Hamburguesa
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('is-active');
        });

        document.addEventListener('click', (event) => {
            const isClickInside = menuToggle.contains(event.target) || navLinks.contains(event.target);
            if (!isClickInside && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('is-active');
            }
        });
    }
	
	// --- LÓGICA DEL BOTÓN PERFIL / PREMIUM ---
	const premiumBtn = document.getElementById('premiumBtn');
	const session = JSON.parse(localStorage.getItem('vs_session'));

	if (premiumBtn) {
		if (session && session.user) {
			// OPCIÓN A: Usuario Logueado
			premiumBtn.textContent = "Mi Perfil";
			premiumBtn.classList.add('btn-logged'); // Para darle un color diferente si quieres
			
			premiumBtn.onclick = () => {
				// Aquí lo mandas a tu página de perfil
				window.location.href = 'perfil.html'; 
			};
			
			console.log(`👤 Botón configurado para el usuario: ${session.user}`);
		} else {
			// OPCIÓN B: Usuario no logueado (Invitado)
			premiumBtn.textContent = "Hazte Premium";
			
			premiumBtn.onclick = () => {
				alert("¡Pásate a Premium para funciones avanzadas!");
				// O abrir un modal de registro
			};
		}
	}
});

// --- LÓGICA DEL PERFIL ---
const premiumBtn = document.getElementById('premiumBtn');
const perfilModal = document.getElementById('perfilModal');
const closePerfil = document.getElementById('closePerfil');
const logoutBtn = document.getElementById('logoutBtn');

if (premiumBtn) {
    const session = JSON.parse(localStorage.getItem('vs_session'));

    if (session && session.user) {
        // Usuario Logueado
        premiumBtn.textContent = "Mi Perfil";
        premiumBtn.classList.add('btn-logged');

        premiumBtn.onclick = () => {
            // Rellenar datos antes de abrir
            document.getElementById('perfilNombre').textContent = session.user;
            document.getElementById('userAvatar').textContent = session.user.charAt(0).toUpperCase();
            
            // Contar días con datos en el historial
            const totalDias = Object.keys(historialNutricional).length;
            document.getElementById('statsDias').textContent = totalDias;

            perfilModal.style.display = 'block';
        };
    } else {
        // No logueado
        premiumBtn.textContent = "Hazte Premium";
        premiumBtn.onclick = () => alert("¡Regístrate para guardar tus datos en la nube!");
    }
}

// Cerrar Modal
if (closePerfil) closePerfil.onclick = () => perfilModal.style.display = 'none';

// Lógica de Cerrar Sesión
if (logoutBtn) {
    logoutBtn.onclick = () => {
        if(confirm("¿Seguro que quieres cerrar sesión?")) {
            localStorage.removeItem('vs_session');
            window.location.reload(); // Recarga para volver al estado inicial
        }
    };
}