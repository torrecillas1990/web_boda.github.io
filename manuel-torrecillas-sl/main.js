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

// --- LÓGICA DE ÓRDENES DE PEDIDO ---

let pedido = JSON.parse(localStorage.getItem('pedido_torrecillas')) || [];

function agregarAlPedido(nombre, formato) {
    // Añadimos el producto al array
    pedido.push({ nombre, formato, id: Date.now() });
    
    // Guardamos en el navegador (para que no se borre al refrescar)
    localStorage.setItem('pedido_torrecillas', JSON.stringify(pedido));
    
    actualizarUI();
    
    // Si es el primer producto, mostramos el panel
    if(pedido.length === 1) {
        togglePanel(true);
    }
}

function eliminarDelPedido(id) {
    pedido = pedido.filter(item => item.id !== id);
    localStorage.setItem('pedido_torrecillas', JSON.stringify(pedido));
    actualizarUI();
}

function actualizarUI() {
    const lista = document.getElementById('lista-pedido');
    const contador = document.getElementById('contador-pedido');
    const btnAbrir = document.getElementById('btn-abrir-pedido');
    const panel = document.getElementById('panel-pedido');

    if (!lista) return; // Si no estamos en la página de catalogo

    lista.innerHTML = '';
    
    pedido.forEach(item => {
        lista.innerHTML += `
            <div class="flex justify-between items-center text-sm bg-slate-800 p-3 rounded-lg">
                <div>
                    <p class="font-bold text-green-400">${item.nombre}</p>
                    <p class="text-[10px] text-slate-400">${item.formato}</p>
                </div>
                <button onclick="eliminarDelPedido(${item.id})" class="text-red-400 hover:text-red-300 px-2">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    });

    // Actualizar contador
    contador.innerText = pedido.length;

    // Mostrar/Ocultar botón flotante
    if (pedido.length > 0) {
        btnAbrir.classList.remove('hidden');
    } else {
        btnAbrir.classList.add('hidden');
        panel.classList.add('translate-y-full');
    }
}

function togglePanel(forzarAbrir = false) {
    const panel = document.getElementById('panel-pedido');
    if (forzarAbrir) {
        panel.classList.remove('translate-y-full');
    } else {
        panel.classList.toggle('translate-y-full');
    }
}

function finalizarPedido() {
    if (pedido.length === 0) return;

    // Creamos un texto legible con los productos
    const listaNombres = pedido.map(i => `${i.nombre} (${i.formato})`).join(', ');
    const textoPedido = `Hola, me gustaría solicitar presupuesto para los siguientes productos: ${listaNombres}.`;
    
    // Redirigimos a contacto.html pasando el texto en la URL
    window.location.href = `contacto.html?pedido=${encodeURIComponent(textoPedido)}`;
}

// Ejecutar al cargar para recuperar pedido guardado
document.addEventListener("DOMContentLoaded", () => {
    actualizarUI();
});

// --- LÓGICA DE FILTRADO ---

function filtrarProductos(categoria) {
    const productos = document.querySelectorAll('.producto-card');
    const botones = document.querySelectorAll('.btn-filtro');

    // 1. Gestionar estilo de los botones
    botones.forEach(btn => {
        btn.classList.remove('bg-green-600', 'text-white', 'active');
        btn.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
    });

    // Resaltar el botón clickeado (buscamos por el evento o el texto)
    event.currentTarget.classList.add('bg-green-600', 'text-white', 'active');
    event.currentTarget.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');

    // 2. Filtrar las tarjetas
    productos.forEach(card => {
        if (categoria === 'todos') {
            card.classList.remove('hidden');
        } else {
            if (card.getAttribute('data-category') === categoria) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        }
    });
}

// --- LÓGICA DEL BUSCADOR ---

function buscarProducto() {
    const input = document.getElementById('buscador');
    const filtro = input.value.toLowerCase();
    const productos = document.querySelectorAll('.producto-card');

    productos.forEach(card => {
        // Obtenemos el título del producto dentro de la tarjeta
        const titulo = card.querySelector('h3').innerText.toLowerCase();
        
        // Si el título incluye lo que escribimos, lo mostramos; si no, lo ocultamos
        if (titulo.includes(filtro)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });

    // Opcional: Si el usuario escribe, desactivamos visualmente los filtros de categoría
    if (filtro !== "") {
        const botones = document.querySelectorAll('.btn-filtro');
        botones.forEach(btn => btn.classList.replace('bg-green-600', 'bg-white'));
    }
}