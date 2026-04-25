// --- VARIABLES DE ESTADO GLOBALES ---
let historialNutricional = {};
let registroDiario = [];
let productoSeleccionado = null;
let macroChart = null;
let weeklyChart = null;

// --- INICIALIZACIÓN PRINCIPAL ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 VitalStats Iniciado");

    // 1. Cargar datos locales
    const dataString = VitalStats.get('historialNutricional');
    historialNutricional = JSON.parse(dataString) || {};

    // 2. CONFIGURACIÓN PREVIA DEL CALENDARIO (Fundamental)
    const datePicker = document.getElementById('datePicker');
    const hoy = new Date().toISOString().split('T')[0];
    
    if (datePicker) {
        datePicker.value = hoy; // Ahora el input ya tiene "2026-04-25"
        
        // Escuchador de cambios manuales
        datePicker.addEventListener('change', () => {
            registroDiario = historialNutricional[datePicker.value] || [];
            actualizarApp();
        });
    }

    // 3. CARGA MASIVA DEL SERVIDOR
    const pendientes = JSON.parse(localStorage.getItem('pendiente_carga_servidor'));
    if (pendientes && pendientes.length > 0) {
        console.log("📥 Detectados archivos pendientes...");
        await ejecutarCargaMasivaServidor(pendientes);
        
        // Tras la carga, actualizamos registroDiario con la fecha que tenga el calendario
        if (datePicker) {
            registroDiario = historialNutricional[datePicker.value] || [];
        }
    } else {
        // Si no hay carga, simplemente asignamos lo que haya en LocalStorage para hoy
        if (datePicker) {
            registroDiario = historialNutricional[datePicker.value] || [];
        }
    }

    // 4. Inicializar Gráficos (Solo si existen)
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

    // 5. Catálogo y Filtros
    if (typeof productosMercadonaBase !== 'undefined') renderizarCatalogo(productosMercadonaBase);
    const searchInput = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    if (searchInput) searchInput.addEventListener('input', filtrarYRenderizar);
    if (categoryFilter) categoryFilter.addEventListener('change', filtrarYRenderizar);

    // 6. Lógica del Botón Sincronizar
    const bulkBtn = document.getElementById('bulkImportBtn');
    if (bulkBtn) {
        bulkBtn.onclick = function() {
            const start = document.getElementById('importRangeStart').value;
            const end = document.getElementById('importRangeEnd').value;
            if (!start || !end) return alert("Selecciona un rango.");

            const lista = generarNombresArchivosPorRango(start, end);
            localStorage.setItem('ultimo_rango_sincronizado', JSON.stringify({ start, end }));
            localStorage.setItem('pendiente_carga_servidor', JSON.stringify(lista));
            window.location.reload();
        };
    }

    // 7. PINTADO FINAL
    actualizarApp();
    
    // Mostrar rango
    const display = document.getElementById('currentRangeDisplay');
    const savedRange = JSON.parse(localStorage.getItem('ultimo_rango_sincronizado'));
    if (display && savedRange) {
        const fInicio = savedRange.start.split('-').reverse().join('/');
        const fFin = savedRange.end.split('-').reverse().join('/');
        display.innerHTML = `✅ Historial cargado del ${fInicio} al ${fFin}`;
    }
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

    // Actualizar UI
    document.getElementById('totalCalories').textContent = Math.round(t.kcal);
    document.getElementById('totalProt').textContent = t.p.toFixed(1);
    document.getElementById('totalFat').textContent = t.g.toFixed(1);
    document.getElementById('totalCarb').textContent = t.c.toFixed(1);

    if (macroChart) {
        macroChart.data.datasets[0].data = [t.p.toFixed(1), t.g.toFixed(1), t.c.toFixed(1)];
        macroChart.update();
    }

	// --- PERSISTENCIA SEGURA ---
    const datePicker = document.getElementById('datePicker');
    if (datePicker) {
        const dateVal = datePicker.value;
        
        // Solo guardamos si el día tiene datos o si ya existía en el historial
        // Esto evita que al cargar la página se sobrescriba con "vacío" por error
        if (registroDiario.length > 0 || (historialNutricional[dateVal] && historialNutricional[dateVal].length > 0)) {
            historialNutricional[dateVal] = registroDiario;
            VitalStats.save('historialNutricional', JSON.stringify(historialNutricional));
        }
    }

    if (macroChart) {
        macroChart.data.datasets[0].data = [t.p.toFixed(1), t.g.toFixed(1), t.c.toFixed(1)];
        macroChart.update();
    }
    if (typeof inicializarGraficoSemanal === 'function') inicializarGraficoSemanal();
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
    const session = JSON.parse(localStorage.getItem('vs_session'));
    const usuarioApp = session ? session.user : "anonimo";
    let cargados = 0;

    for (const nombre of lista) {
        try {
            const match = nombre.match(/(\d{8})/);
            if (!match) continue;
            
            const f = match[0]; // Ejemplo: 20260424
            const fechaClave = `${f.substring(0,4)}-${f.substring(4,6)}-${f.substring(6,8)}`;
            const varEsperada = `VS_${usuarioApp}_${f}`;

            // 1. Cargamos el script de la forma más compatible posible
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = `./diario/${nombre}`; 
                s.async = false; // Forzamos carga secuencial
                s.onload = () => setTimeout(resolve, 150); // Espera generosa para Windows
                s.onerror = reject;
                document.head.appendChild(s);
            });

            // 2. BÚSQUEDA FORENSE: Intentamos capturar los datos
            let datos = window[varEsperada] || globalThis[varEsperada];

            // 3. PLAN B: Si no aparece por nombre exacto, buscamos cualquier variable 
            // que empiece por "VS_" y termine con la fecha (por si hay errores de nombre)
            if (!datos) {
                const todasLasVariables = Object.keys(window);
                const llaveEncontrada = todasLasVariables.find(k => k.includes(f) && k.startsWith('VS'));
                if (llaveEncontrada) {
                    datos = window[llaveEncontrada];
                    console.log(`🔎 ¡Encontrado por proximidad! Variable real: ${llaveEncontrada}`);
                }
            }

            if (datos) {
                historialNutricional[fechaClave] = datos;
                cargados++;
                console.log(`✅ ¡POR FIN! Datos de ${fechaClave} cargados.`);
            } else {
                console.error(`❌ Fallo total en ${nombre}. La variable no aparece en el mapa global.`);
                // DEBUG: Vamos a ver qué variables "VS" hay realmente en memoria
                console.log("Variables VS actuales en memoria:", Object.keys(window).filter(k => k.startsWith('VS')));
            }

        } catch (e) {
            // Esto ignora los días que no tienen archivo físico (los errores rojos)
            console.log(`ℹ️ Día sin archivo en carpeta: ${nombre}`);
        }
    }

    if (cargados > 0) {
        VitalStats.save('historialNutricional', JSON.stringify(historialNutricional));
        const dp = document.getElementById('datePicker');
        if (dp) {
            registroDiario = historialNutricional[dp.value] || [];
            actualizarApp();
        }
        alert(`Sincronización brutal completada: ${cargados} días recuperados.`);
    }
    
    localStorage.removeItem('pendiente_carga_servidor');
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

const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
    downloadBtn.onclick = () => {
        if (registroDiario.length === 0) return;
        const session = JSON.parse(localStorage.getItem('vs_session'));
        const user = session ? session.user : "anonimo";
        const date = document.getElementById('datePicker').value;
        
        // CAMBIO AQUÍ: Usamos 'var' en lugar de 'const'
        const content = `var VS_${user}_${date.replace(/-/g,'')} = ${JSON.stringify(registroDiario, null, 4)};`;
        
        const blob = new Blob([content], { type: 'application/javascript' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `VS_${user}_${date.replace(/-/g,'')}.js`;
        a.click();
    };
}