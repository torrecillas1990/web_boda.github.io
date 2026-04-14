// --- VARIABLES DE ESTADO ---
// Los datos vienen de datos.js
let productosMercadona = productosMercadonaBase;
let registroDiario = JSON.parse(localStorage.getItem('registroNutricional')) || [];
let totales = { kcal: 0, prot: 0, grasa: 0, carb: 0 };

const searchInput = document.getElementById('productSearch');
const resultsList = document.getElementById('resultsList');
const diaryList = document.getElementById('diaryList');
const totalCalDisplay = document.getElementById('totalCalories');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');

const quantityModal = document.getElementById('quantityModal');
const quantityInput = document.getElementById('quantityInput');
const modalProductName = document.getElementById('modalProductName');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');

const fullProductList = document.getElementById('fullProductList');

let productoSeleccionado = null; // Para guardar el producto mientras elegimos gramos

// --- 1. CARGA Y VALIDACIÓN DEL TXT ---
async function cargarBaseDeDatos() {
    try {
        const respuesta = await fetch('datos.js');
        if (!respuesta.ok) throw new Error("No se encuentra datos.js");
        
        const texto = await respuesta.text();
        const lineas = texto.split('\n');
        
        productosMercadona = [];
        lineas.forEach((linea, index) => {
            if (index === 0 || !linea.trim()) return;
            const columnas = linea.split(',');
            if (columnas.length === 5) {
                const [nombre, kcal, prot, grasa, carb] = columnas.map(c => c.trim());
                if (!isNaN(kcal)) {
                    productosMercadona.push({
                        nombre,
                        kcal: parseFloat(kcal),
                        prot: parseFloat(prot) || 0,
                        grasa: parseFloat(grasa) || 0,
                        carb: parseFloat(carb) || 0
                    });
                }
            } else {
                console.warn(`Línea ${index + 1} mal formateada en productos.txt`);
            }
        });
    } catch (error) {
        console.error("Error al cargar base de datos:", error);
    }
}

// --- 2. BUSCADOR MEJORADO ---
const normalizar = (txt) => txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

searchInput.addEventListener('input', () => {
    const query = normalizar(searchInput.value);
    resultsList.innerHTML = '';
    
    if (query.length > 1) {
        const filtrados = productosMercadona.filter(p => normalizar(p.nombre).includes(query));
        filtrados.forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${p.nombre}</strong> <span>(${p.kcal} kcal)</span>`;
            li.onclick = () => abrirModal(p); // Ahora abrimos el modal
            resultsList.appendChild(li);
        });
    }
});

// --- LÓGICA DEL MODAL ---
function abrirModal(p) {
    productoSeleccionado = p;
    modalProductName.innerHTML = `Gramos de <strong>${p.nombre}</strong>:`;
    quantityModal.style.display = 'block';
    quantityInput.focus();
}

confirmBtn.onclick = () => {
    const gramos = parseFloat(quantityInput.value);
    if (isNaN(gramos) || gramos <= 0) return;

    const factor = gramos / 100;
    registroDiario.push({
        id: Date.now(),
        nombre: `${productoSeleccionado.nombre} (${gramos}g)`,
        kcal: Math.round(productoSeleccionado.kcal * factor),
        prot: productoSeleccionado.prot * factor,
        grasa: productoSeleccionado.grasa * factor,
        carb: productoSeleccionado.carb * factor
    });

    actualizarApp();
    cerrarModal();
};

function cerrarModal() {
    quantityModal.style.display = 'none';
    productoSeleccionado = null;
    // Opcional: limpiar buscador al añadir
    // searchInput.value = '';
    // mostrarCatalogo(productosMercadonaBase);
}

// --- 3. GRÁFICO ---
const ctx = document.getElementById('macroChart').getContext('2d');
let macroChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Proteínas', 'Grasas', 'Carbos'],
        datasets: [{
            data: [0, 0, 0],
            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
        }]
    },
    options: { responsive: true, maintainAspectRatio: false }
});

// --- 4. LÓGICA DE INTERFAZ ---
function actualizarApp() {
    // Calcular totales
    totales = registroDiario.reduce((acc, p) => {
        acc.kcal += p.kcal;
        acc.prot += p.prot;
        acc.grasa += p.grasa;
        acc.carb += p.carb;
        return acc;
    }, { kcal: 0, prot: 0, grasa: 0, carb: 0 });

    // Actualizar Texto y Gráfico
    totalCalDisplay.textContent = Math.round(totales.kcal);
    macroChart.data.datasets[0].data = [totales.prot.toFixed(1), totales.grasa.toFixed(1), totales.carb.toFixed(1)];
    macroChart.update();
    
    // Persistencia
    localStorage.setItem('registroNutricional', JSON.stringify(registroDiario));
    renderizarLista();
}

function renderizarLista() {
    diaryList.innerHTML = '';
    registroDiario.forEach((p) => {
        const li = document.createElement('li');
        li.className = "diary-item";
        li.innerHTML = `
            <div style="flex-grow: 1;">
                <strong>${p.nombre}</strong><br>
                <small>P: ${p.prot}g | G: ${p.grasa}g | C: ${p.carb}g</small>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>${p.kcal} kcal</span>
                <button class="delete-btn" onclick="removeItem(${p.id})">×</button>
            </div>
        `;
        diaryList.appendChild(li);
    });
}

function addToDiary(productoBase) {
    // 1. Preguntar cantidad
    const cantidadStr = prompt(`¿Cuántos gramos de "${productoBase.nombre}" has consumido?`, "100");
    const gramos = parseFloat(cantidadStr);

    // 2. Validar que sea un número válido
    if (isNaN(gramos) || gramos <= 0) {
        alert("Por favor, introduce una cantidad válida en gramos.");
        return;
    }

    // 3. Calcular valores proporcionales
    // Usamos (valor * gramos / 100)
    const factor = gramos / 100;

    const nuevoItem = {
        id: Date.now(),
        nombre: `${productoBase.nombre} (${gramos}g)`,
        kcal: Math.round(productoBase.kcal * factor),
        prot: productoBase.prot * factor,
        grasa: productoBase.grasa * factor,
        carb: productoBase.carb * factor
    };

    // 4. Añadir al registro y actualizar
    registroDiario.push(nuevoItem);
    actualizarApp();
    
    // Limpiar buscador
    searchInput.value = '';
    resultsList.innerHTML = '';
}

function removeItem(id) {
    registroDiario = registroDiario.filter(p => p.id !== id);
    actualizarApp();
}

// --- 5. EVENTOS ---
downloadBtn.onclick = () => {
    let contenido = `REGISTRO DIARIO\nTotal: ${totales.kcal} kcal\n\n`;
    registroDiario.forEach(p => contenido += `- ${p.nombre}: ${p.kcal} kcal\n`);
    const blob = new Blob([contenido], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "mi_dieta.txt";
    a.click();
};

clearBtn.onclick = () => { if(confirm("¿Vaciar lista?")) { registroDiario = []; actualizarApp(); } };

// --- RENDERIZAR EL CATÁLOGO COMPLETO ---
function mostrarCatalogo(productos) {
    fullProductList.innerHTML = '';
    productos.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${p.nombre}</span>
            <small>${p.kcal} kcal/100g</small>
        `;
        li.onclick = () => abrirModal(p);
        fullProductList.appendChild(li);
    });
}

// --- BUSCADOR: FILTRA EL CATÁLOGO ---
searchInput.addEventListener('input', () => {
    const query = normalizar(searchInput.value);
    // Filtramos la lista original
    const filtrados = productosMercadonaBase.filter(p => 
        normalizar(p.nombre).includes(query)
    );
    // Volvemos a renderizar solo los filtrados
    mostrarCatalogo(filtrados);
});

// --- INICIO ---
function inicio() {
    mostrarCatalogo(productosMercadonaBase); // Mostrar todo al cargar
    actualizarApp();
}
inicio();