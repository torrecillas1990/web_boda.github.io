// main.js

// 1. Función para manejar el despliegue del menú
function setupMobileMenu() {
    const btn = document.getElementById('menu-btn');
    const menu = document.getElementById('nav-links');
    const icon = document.getElementById('menu-icon');

    if (btn && menu) {
        // Limpiamos cualquier evento previo para no duplicar
        btn.onclick = null; 
        
        btn.onclick = () => {
            menu.classList.toggle('hidden');
            
            // Cambiamos el icono entre barras (☰) y equis (✕)
            if (menu.classList.contains('hidden')) {
                icon.classList.replace('fa-times', 'fa-bars');
            } else {
                icon.classList.replace('fa-bars', 'fa-times');
            }
        };
        console.log("Menu móvil configurado correctamente");
    } else {
        console.warn("No se encontró el botón o el menú para el móvil");
    }
}

// 2. Función para cargar componentes (Nav/Footer)
function loadComponent(id, file, callback) {
    const container = document.getElementById(id);
    if (!container) return; // Si no existe el hueco, no hacemos nada

    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar " + file);
            return response.text();
        })
        .then(data => {
            container.innerHTML = data;
            if (callback) callback();
        })
        .catch(error => console.error(error));
}

// 3. Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    
    // CASO A: Si el menú ya está en el HTML (como en tu último index.html)
    setupMobileMenu();

    // CASO B: Si vas a usar el sistema de piezas (modulares)
    loadComponent('navbar-placeholder', 'nav.html', () => {
        setupMobileMenu(); // Volvemos a configurar tras cargar el archivo
        destacarEnlaceActivo();
    });

    loadComponent('footer-placeholder', 'footer.html');
});

// Resaltar la página donde estamos
function destacarEnlaceActivo() {
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    const linkId = 'link-' + currentPage.replace('.html', '');
    const activeLink = document.getElementById(linkId);
    if (activeLink) activeLink.classList.add('text-green-600');
}