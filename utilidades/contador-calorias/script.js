// --- VARIABLES ---
let registroDiario = JSON.parse(localStorage.getItem('registroNutricional')) || [];
let productoSeleccionado = null;

const searchInput = document.getElementById('productSearch');
const fullProductList = document.getElementById('fullProductList');
const diaryList = document.getElementById('diaryList');
const totalCalDisplay = document.getElementById('totalCalories');
const quantityModal = document.getElementById('quantityModal');
const quantityInput = document.getElementById('quantityInput');
const modalProductName = document.getElementById('modalProductName');

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

// --- FUNCIONES DE CATÁLOGO ---
const normalizar = (txt) => txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function renderizarCatalogo(lista) {
    fullProductList.innerHTML = '';
    lista.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${p.nombre}</span> <small>${p.kcal} kcal</small>`;
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
    modalProductName.innerHTML = `Cantidad para <strong>${p.nombre}</strong> (g):`;
    quantityModal.style.display = 'block';
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

// --- APP LOGIC ---
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
    localStorage.setItem('registroNutricional', JSON.stringify(registroDiario));
}

function removeItem(id) {
    registroDiario = registroDiario.filter(p => p.id !== id);
    actualizarApp();
}

document.getElementById('clearBtn').onclick = () => {
    if(confirm("¿Borrar todo?")) { registroDiario = []; actualizarApp(); }
};

// Función para generar el nombre de archivo AAAAMMDD.js
function obtenerNombreArchivo() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${año}${mes}${dia}.js`;
}

document.getElementById('downloadBtn').onclick = () => {
    if (registroDiario.length === 0) {
        alert("No hay datos para guardar hoy.");
        return;
    }

    const nombreArchivo = obtenerNombreArchivo();
    
    // Creamos el contenido en formato JS
    let contenidoJS = `// Registro Nutricional del ${new Date().toLocaleDateString()}\n`;
    contenidoJS += `const diario_${nombreArchivo.replace('.js', '')} = `;
    contenidoJS += JSON.stringify({
        fecha: new Date().toISOString(),
        totalKcal: totalCalDisplay.textContent,
        macros: {
            proteinas: macroChart.data.datasets[0].data[0],
            grasas: macroChart.data.datasets[0].data[1],
            carbohidratos: macroChart.data.datasets[0].data[2]
        },
        alimentos: registroDiario
    }, null, 4);
    contenidoJS += `;`;

    // Crear el "dispositivo" de descarga
    const blob = new Blob([contenidoJS], { type: 'application/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombreArchivo; // Esto pondrá automáticamente 20260414.js (o la fecha de hoy)
    a.click();
    
    // Feedback visual
    alert(`Archivo preparado: ${nombreArchivo}\nGuárdalo en tu carpeta ./diario`);
};

// Inicio
renderizarCatalogo(productosMercadonaBase);
actualizarApp();