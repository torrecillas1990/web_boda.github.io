// Al inicio de contador-calorias/script.js
document.addEventListener('DOMContentLoaded', () => {
    const savedWeight = VitalStats.get('user_weight');
    const savedFat = VitalStats.get('user_fat');

    if (savedWeight) {
        console.log(`Peso detectado: ${savedWeight}kg. Ajustando cálculos...`);
        // Aquí podrías mostrar un mensaje: "Calculando en base a tus 75kg"
    }
});

// --- VARIABLES DE ESTADO ---
// Cargamos el historial completo o un objeto vacío
let historialNutricional = JSON.parse(localStorage.getItem('historialNutricional')) || {};
let productoSeleccionado = null;

// Referencias al DOM
const searchInput = document.getElementById('productSearch');
const fullProductList = document.getElementById('fullProductList');
const diaryList = document.getElementById('diaryList');
const totalCalDisplay = document.getElementById('totalCalories');
const quantityModal = document.getElementById('quantityModal');
const quantityInput = document.getElementById('quantityInput');
const modalProductName = document.getElementById('modalProductName');
const datePicker = document.getElementById('datePicker');

// --- INICIALIZACIÓN DE FECHA ---
const hoy = new Date().toISOString().split('T')[0];
datePicker.value = hoy;

// Definimos registroDiario basado en la fecha del picker (SIN REDECLARAR)
let registroDiario = historialNutricional[datePicker.value] || [];

// --- GRÁFICO ---
const ctx = document.getElementById('macroChart').getContext('2d');
let macroChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Prot (g)', 'Grasas (g)', 'Carbos (g)'],
        datasets: [{
            data: [0, 0, 0],
            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
        }]
    },
    options: { responsive: true, maintainAspectRatio: false }
});

// --- CAMBIAR DE DÍA ---
datePicker.onchange = () => {
    // Recuperamos los datos del nuevo día seleccionado
    registroDiario = historialNutricional[datePicker.value] || [];
    actualizarApp();
};

// --- FUNCIONES DE CATÁLOGO ---
const normalizar = (txt) => txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Referencias nuevas
const categoryFilter = document.getElementById('categoryFilter');

function filtrarYRenderizar() {
    const query = normalizar(searchInput.value);
    const cat = categoryFilter.value;

    const filtrados = productosMercadonaBase.filter(p => {
        const coincideNombre = normalizar(p.nombre).includes(query);
        const coincideCat = (cat === "todos" || p.categoria === cat);
        return coincideNombre && coincideCat;
    });

    renderizarCatalogo(filtrados);
}

// Escuchar cambios en ambos inputs
searchInput.addEventListener('input', filtrarYRenderizar);
categoryFilter.addEventListener('change', filtrarYRenderizar);

// Actualizamos renderizarCatalogo para que incluya las observaciones y badges
function renderizarCatalogo(lista) {
    fullProductList.innerHTML = '';
    lista.forEach(p => {
        const li = document.createElement('li');
        li.className = "product-item";
        li.innerHTML = `
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge ${p.categoria.toLowerCase().replace('/', '-').replace(' ', '-')}">${p.categoria}</span>
                    <strong>${p.nombre}</strong>
                </div>
                <small style="color: #666; margin-left: 5px;">${p.kcal} kcal | <span style="font-style: italic;">${p.obs}</span></small>
            </div>
        `;
        li.onclick = () => abrirModal(p);
        fullProductList.appendChild(li);
    });
}

searchInput.addEventListener('input', () => {
    const query = normalizar(searchInput.value);
    const filtrados = productosMercadonaBase.filter(p => normalizar(p.nombre).includes(query));
    renderizarCatalogo(filtrados);
});

// --- MODAL CANTIDAD ---
function abrirModal(p) {
    productoSeleccionado = p;
    modalProductName.innerHTML = `
        Añadir <strong>${p.nombre}</strong><br>
        <small style="color: #666;">${p.obs ? '💡 ' + p.obs : ''}</small>
    `;
    quantityModal.style.display = 'block';
    quantityInput.value = 100;
    quantityInput.focus();
}

document.getElementById('confirmBtn').onclick = () => {
    const gramos = parseFloat(quantityInput.value);
    if (!gramos || gramos <= 0) return;

    const f = gramos / 100;
    registroDiario.push({
        id: Date.now(),
        nombre: `${productoSeleccionado.nombre} (${gramos}g)`,
        kcal: Math.round(productoSeleccionado.kcal * f),
        prot: productoSeleccionado.prot * f,
        grasa: productoSeleccionado.grasa * f,
        carb: productoSeleccionado.carb * f
    });
    actualizarApp();
    cerrarModal();
};

document.getElementById('cancelBtn').onclick = cerrarModal;
function cerrarModal() { quantityModal.style.display = 'none'; }

// --- LÓGICA DE ACTUALIZACIÓN Y GUARDADO ---
function actualizarApp() {
    let t = { kcal: 0, p: 0, g: 0, c: 0 };
    diaryList.innerHTML = '';

    registroDiario.forEach(item => {
        t.kcal += item.kcal; t.p += item.prot; t.g += item.grasa; t.c += item.carb;
        
        const li = document.createElement('li');
        li.className = "diary-item";
        li.innerHTML = `
            <div><strong>${item.nombre}</strong><br><small>${item.kcal} kcal</small></div>
            <button class="delete-btn" onclick="removeItem(${item.id})">×</button>
        `;
        diaryList.appendChild(li);
    });

    totalCalDisplay.textContent = t.kcal;
    macroChart.data.datasets[0].data = [t.p.toFixed(1), t.g.toFixed(1), t.c.toFixed(1)];
    macroChart.update();

    // Guardado en el historial global usando la fecha actual del picker como llave
    historialNutricional[datePicker.value] = registroDiario;
    localStorage.setItem('historialNutricional', JSON.stringify(historialNutricional));
}

function removeItem(id) {
    registroDiario = registroDiario.filter(p => p.id !== id);
    actualizarApp();
}

document.getElementById('clearBtn').onclick = () => {
    if(confirm(`¿Borrar todos los datos del día ${datePicker.value}?`)) {
        registroDiario = [];
        actualizarApp();
    }
};

// --- EXPORTACIÓN ---
document.getElementById('downloadBtn').onclick = () => {
    if (registroDiario.length === 0) {
        alert("No hay datos para guardar en esta fecha.");
        return;
    }

    const fechaLimpia = datePicker.value.replace(/-/g, '');
    const nombreArchivo = `${fechaLimpia}.js`;
    
    let contenidoJS = `// Registro Nutricional exportado: ${datePicker.value}\n`;
    contenidoJS += `const diario_${fechaLimpia} = ${JSON.stringify(registroDiario, null, 4)};`;

    const blob = new Blob([contenidoJS], { type: 'application/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombreArchivo;
    a.click();
};

// --- INICIO ---
renderizarCatalogo(productosMercadonaBase);
actualizarApp();