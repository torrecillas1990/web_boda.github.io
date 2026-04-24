// --- VARIABLES DE ESTADO GLOBALES ---
let historialNutricional = {};
let registroDiario = [];
let productoSeleccionado = null;
let macroChart = null;
let weeklyChart = null;

// --- INICIALIZACIÓN PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {    
    // 1. Cargar datos usando el prefijo de usuario de VitalStats
    const dataString = VitalStats.get('historialNutricional');
    historialNutricional = JSON.parse(dataString) || {};

    // 2. Configuración de Fecha Inicial
    const datePicker = document.getElementById('datePicker');
    const hoy = new Date().toISOString().split('T')[0];
    
    if (datePicker) {
        datePicker.value = hoy;
        registroDiario = historialNutricional[hoy] || [];

        datePicker.addEventListener('change', () => {
            registroDiario = historialNutricional[datePicker.value] || [];
            actualizarApp();
        });
    }

    // 3. Inicializar Gráfico Diario
    const ctx = document.getElementById('macroChart');
    if (ctx) {
        macroChart = new Chart(ctx.getContext('2d'), {
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
    }

    // 4. Catálogo y Filtros
    if (typeof productosMercadonaBase !== 'undefined') {
        renderizarCatalogo(productosMercadonaBase);
    }

    const searchInput = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    if (searchInput) searchInput.addEventListener('input', filtrarYRenderizar);
    if (categoryFilter) categoryFilter.addEventListener('change', filtrarYRenderizar);

    // 5. Lógica del Modal
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const quantityInput = document.getElementById('quantityInput');
            if (!productoSeleccionado || !quantityInput) return;

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
    }
    if (cancelBtn) cancelBtn.onclick = cerrarModal;

    // 6. Botones de Acción (Vaciar y Exportar)
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (confirm("¿Vaciar lista de hoy?")) {
                registroDiario = [];
                actualizarApp();
            }
        };
    }

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            if (registroDiario.length === 0) return;
            const session = JSON.parse(localStorage.getItem('vs_session'));
            const user = session ? session.user : "anonimo";
            const date = document.getElementById('datePicker').value;
            const content = `const VS_${user}_${date.replace(/-/g,'')} = ${JSON.stringify(registroDiario, null, 4)};`;
            const blob = new Blob([content], { type: 'application/javascript' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `VS_${user}_${date.replace(/-/g,'')}.js`;
            a.click();
        };
    }

    // 7. Filtros Gráfico Semanal
    const timeRangeFilter = document.getElementById('timeRangeFilter');
    if (timeRangeFilter) timeRangeFilter.addEventListener('change', inicializarGraficoSemanal);

    const macroToggles = document.querySelectorAll('.macro-toggle');
    macroToggles.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (weeklyChart) {
                weeklyChart.setDatasetVisibility(e.target.value, e.target.checked);
                weeklyChart.update();
            }
        });
    });

    // --- REGISTRAR RANGO Y RECARGAR ---
	const bulkBtn = document.getElementById('bulkImportBtn');
	if (bulkBtn) {
		bulkBtn.onclick = () => {
			const start = document.getElementById('importRangeStart').value;
			const end = document.getElementById('importRangeEnd').value;

			if (!start || !end) return alert("Selecciona un rango de fechas.");

			// 1. Generamos los nombres de archivos esperados
			const listaArchivos = generarNombresArchivosPorRango(start, end);
			
			// 2. Guardamos en una clave especial para que el sistema los cargue al reiniciar
			localStorage.setItem('pendiente_carga_servidor', JSON.stringify(listaArchivos));
			
			// 3. Recargamos la página
			window.location.reload();
		};
	}

	// --- DETECTOR DE CARGA PENDIENTE (Se ejecuta cada vez que carga la página) ---
	const pendientes = JSON.parse(localStorage.getItem('pendiente_carga_servidor'));
	if (pendientes && pendientes.length > 0) {
		ejecutarCargaMasivaServidor(pendientes);
	}

    actualizarApp();
});

// --- FUNCIONES DE CORE ---

function actualizarApp() {
    const diaryList = document.getElementById('diaryList');
    if (!diaryList) return;

    let t = { kcal: 0, p: 0, g: 0, c: 0 };
    diaryList.innerHTML = '';

    registroDiario.forEach(item => {
        t.kcal += item.kcal; t.p += item.prot; t.g += item.grasa; t.c += item.carb;
        const li = document.createElement('li');
        li.className = "diary-item";
        li.innerHTML = `<div><strong>${item.nombre}</strong><br><small>${item.kcal} kcal</small></div><button class="delete-btn">×</button>`;
        li.querySelector('.delete-btn').onclick = () => {
            registroDiario = registroDiario.filter(p => p.id !== item.id);
            actualizarApp();
        };
        diaryList.appendChild(li);
    });

    document.getElementById('totalCalories').textContent = Math.round(t.kcal);
    document.getElementById('totalProt').textContent = t.p.toFixed(1);
    document.getElementById('totalFat').textContent = t.g.toFixed(1);
    document.getElementById('totalCarb').textContent = t.c.toFixed(1);

    if (macroChart) {
        macroChart.data.datasets[0].data = [t.p.toFixed(1), t.g.toFixed(1), t.c.toFixed(1)];
        macroChart.update();
    }

    // Persistencia con prefijo de usuario
    const dateVal = document.getElementById('datePicker').value;
    historialNutricional[dateVal] = registroDiario;
    VitalStats.save('historialNutricional', JSON.stringify(historialNutricional));

    inicializarGraficoSemanal();
}

function renderizarCatalogo(lista) {
    const listEl = document.getElementById('fullProductList');
    if (!listEl) return;
    listEl.innerHTML = '';
    lista.forEach(p => {
        const li = document.createElement('li');
        li.className = "product-item";
        li.innerHTML = `<strong>${p.nombre}</strong><br><small>${p.kcal} kcal | ${p.categoria}</small>`;
        li.onclick = () => abrirModal(p);
        listEl.appendChild(li);
    });
}

function abrirModal(p) {
    productoSeleccionado = p; 
    document.getElementById('modalProductName').innerHTML = `Añadir <strong>${p.nombre}</strong>`;
    document.getElementById('quantityModal').style.display = 'block';
    document.getElementById('quantityInput').focus();
}

function cerrarModal() {
    document.getElementById('quantityModal').style.display = 'none';
    productoSeleccionado = null;
}

function filtrarYRenderizar() {
    const query = document.getElementById('productSearch').value.toLowerCase().trim();
    const cat = document.getElementById('categoryFilter').value;
    const filtrados = productosMercadonaBase.filter(p => 
        p.nombre.toLowerCase().includes(query) && (cat === "todos" || p.categoria === cat)
    );
    renderizarCatalogo(filtrados);
}

function inicializarGraficoSemanal() {
    const canvas = document.getElementById('weeklyChart');
    const filter = document.getElementById('timeRangeFilter');
    if (!canvas || !filter) return;

    const etiquetas = obtenerRangoFechas(filter.value);
    const tipoGrafico = etiquetas.length > 31 ? 'line' : 'bar';

    const dataKcal = etiquetas.map(f => (historialNutricional[f] || []).reduce((a, b) => a + b.kcal, 0));
    const dataProt = etiquetas.map(f => (historialNutricional[f] || []).reduce((a, b) => a + b.prot, 0));
    const dataFat = etiquetas.map(f => (historialNutricional[f] || []).reduce((a, b) => a + b.grasa, 0));
    const dataCarb = etiquetas.map(f => (historialNutricional[f] || []).reduce((a, b) => a + b.carb, 0));

    // Totales Leyenda
    const sumaKcal = dataKcal.reduce((a, b) => a + b, 0);
    document.getElementById('rangeKcal').textContent = sumaKcal.toLocaleString();
    document.getElementById('avgKcal').textContent = Math.round(sumaKcal / (dataKcal.filter(k => k > 0).length || 1)).toLocaleString();
    document.getElementById('rangeProt').textContent = Math.round(dataProt.reduce((a,b)=>a+b,0));
    document.getElementById('rangeFat').textContent = Math.round(dataFat.reduce((a,b)=>a+b,0));
    document.getElementById('rangeCarb').textContent = Math.round(dataCarb.reduce((a,b)=>a+b,0));

    if (weeklyChart) weeklyChart.destroy();
    weeklyChart = new Chart(canvas.getContext('2d'), {
        type: tipoGrafico,
        data: {
            labels: etiquetas.map(f => f.split('-').reverse().slice(0,2).join('/')),
            datasets: [
                { label: 'Kcal', data: dataKcal, backgroundColor: '#9b59b6', yAxisID: 'y', tension: 0.3, fill: tipoGrafico === 'line' },
                { label: 'Prot (g)', data: dataProt, backgroundColor: '#36A2EB', yAxisID: 'y1' },
                { label: 'Grasa (g)', data: dataFat, backgroundColor: '#FF6384', yAxisID: 'y1' },
                { label: 'Carb (g)', data: dataCarb, backgroundColor: '#FFCE56', yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { type: 'linear', position: 'left' },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function obtenerRangoFechas(opcion) {
    let fechas = [];
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let diasAMostrar = 7;
    if (opcion === 'lastMonth') diasAMostrar = 30;
    if (opcion === 'last6Months') diasAMostrar = 180;
    if (opcion === 'lastYear') diasAMostrar = 365;
    
    if (opcion === 'currentWeek') {
        let diaSemana = hoy.getDay(); 
        let dif = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
        let lunes = new Date(hoy.setDate(dif));
        for (let i = 0; i < 7; i++) {
            let d = new Date(lunes);
            d.setDate(lunes.getDate() + i);
            fechas.push(d.toISOString().split('T')[0]);
        }
        return fechas;
    }

    for (let i = diasAMostrar - 1; i >= 0; i--) {
        let d = new Date();
        d.setDate(new Date().getDate() - i);
        fechas.push(d.toISOString().split('T')[0]);
    }
    return fechas;
}

async function ejecutarCargaMasivaServidor(lista) {
    let cargados = 0;
    const session = JSON.parse(localStorage.getItem('vs_session'));
    const usuario = session ? session.user : "anonimo";

    for (const nombre of lista) {
        // Extraer fecha del nombre: VS_admin_20260424.js -> 2026-04-24
        const f = nombre.match(/(\d{8})/)[0];
        const fechaClave = `${f.substring(0,4)}-${f.substring(4,6)}-${f.substring(6,8)}`;
        const varName = `VS_${usuario}_${f}`;

        try {
            // Cargamos el script desde la carpeta ./diario/
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = `./diario/${nombre}`; // Ruta relativa a la carpeta diario
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });

            if (window[varName]) {
                historialNutricional[fechaClave] = window[varName];
                cargados++;
                delete window[varName];
            }
        } catch (e) {
            console.warn(`No se encontró en servidor: ${nombre}`);
        }
    }

    if (cargados > 0) {
        // Guardamos todo en el historial del usuario
        VitalStats.save('historialNutricional', JSON.stringify(historialNutricional));
        // Limpiamos la cola de pendientes para que no entre en bucle infinito
        localStorage.removeItem('pendiente_carga_servidor');
        // Refrescamos una última vez para ver los datos finales
        actualizarApp();
    }
}

function generarNombresArchivosPorRango(inicio, fin) {
    const nombres = [];
    let actual = new Date(inicio);
    const limite = new Date(fin);
    const usuario = JSON.parse(localStorage.getItem('vs_session'))?.user || "anonimo";

    while (actual <= limite) {
        const y = actual.getFullYear();
        const m = String(actual.getMonth() + 1).padStart(2, '0');
        const d = String(actual.getDate()).padStart(2, '0');
        nombres.push(`VS_${usuario}_${y}${m}${d}.js`);
        actual.setDate(actual.getDate() + 1);
    }
    return nombres;
}