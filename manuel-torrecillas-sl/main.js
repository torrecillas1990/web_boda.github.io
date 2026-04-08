// main.js

function loadComponent(id, file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback();
        })
        .catch(error => console.error('Error cargando ' + file, error));
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar el Navegador
    loadComponent('navbar-placeholder', 'nav.html', () => {
        // --- Lógica del Menú Colapsable ---
        const btn = document.getElementById('menu-btn');
        const menu = document.getElementById('nav-links');
        const icon = document.getElementById('menu-icon');

        if (btn && menu) {
            btn.addEventListener('click', () => {
                // Toggles la clase 'hidden' para mostrar/ocultar
                menu.classList.toggle('hidden');
                
                // Cambia el icono de barras a una 'X' al abrir
                if (menu.classList.contains('hidden')) {
                    icon.classList.replace('fa-times', 'fa-bars');
                } else {
                    icon.classList.replace('fa-bars', 'fa-times');
                }
            });
        }

        // --- Lógica de Enlace Activo ---
        const currentPage = window.location.pathname.split("/").pop() || 'index.html';
        const linkId = 'link-' + currentPage.replace('.html', '');
        const activeLink = document.getElementById(linkId);
        if (activeLink) activeLink.classList.add('text-green-600');
    });

    // 2. Cargar el Footer
    loadComponent('footer-placeholder', 'footer.html');
});